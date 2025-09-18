import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeFirebase } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';

// --- Stripe init ---
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil', // håll samma version som övriga routes
  });
}

// --- Duration → fee %-trappa (heltal %) ---
function feePctFromDuration(hours?: number): number {
  const h = Number(hours ?? 0);
  if (h <= 12) return 3;
  if (h <= 24) return 4;
  if (h <= 36) return 5;
  if (h <= 48) return 6;
  if (h <= 72) return 7;
  if (h <= 96) return 8;
  if (h <= 120) return 9;
  return 10; // 144h+
}

type IncomingItem = {
  id: string; // dealId
  quantity?: number;
  accountType?: 'company' | 'customer';
  price?: number;          // ev. fallback, men vi hämtar alltid live från deal
  feePercentage?: number;  // fallback om duration saknas på deal
};

type IncomingBuyer = {
  id?: string;
  email?: string;
};

type EnrichedItem = {
  dealId: string;
  sellerId: string;
  sellerStripeAccountId: string;
  quantity: number;
  unitAmountSEK: number;         // pris per styck (SEK, heltal)
  grossPerItemSEK: number;       // unit * qty (SEK)
  feePct: number;                // ex. 6, 10 (heltal %)
  platformFeePerItemSEK: number; // avrundad per rad (SEK)
};

export async function POST(req: Request) {
  try {
    // --- Firebase init ---
    const { db } = await initializeFirebase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // --- Stripe init ---
    const stripe = getStripe();

    // --- Body parse ---
    const body = await req.json();
    const { items, buyer } = body as { items: IncomingItem[]; buyer?: IncomingBuyer };
    // Skydd mot dubbletter om användaren dubbelklickar / nätverksretry
    const idempotencyKey: string | undefined =
      (body as any)?.idempotencyKey ?? (body as any)?.cartId ?? undefined;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Varukorgen är tom.' }, { status: 400 });
    }

    const currency = 'sek';

    // --- Ackumulatorer ---
    let subtotalSEK = 0;      // summa av alla deals (exkl. frakt)
    let serviceFeeSEK = 0;    // din serviceavgift (summa per rad)

    const enrichedItems: EnrichedItem[] = [];
    // Mappar endast säljare → konto (belopp delas i webhook)
    const sellerMap: Record<string, { stripeAccountId: string }> = {};

    // --- Bygg items från Firestore ---
    for (const item of items) {
      const dealRef = doc(db, 'deals', item.id);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) continue;

      const deal = dealSnap.data() as any;

      const sellerId: string = deal.companyId;
      if (!sellerId) continue;

      const accountType: 'company' | 'customer' =
        item.accountType === 'customer' ? 'customer' : 'company';

      const sellerRef = doc(
        db,
        accountType === 'company' ? 'companies' : 'customers',
        sellerId
      );
      const sellerSnap = await getDoc(sellerRef);
      if (!sellerSnap.exists()) continue;

      const { stripeAccountId } = sellerSnap.data() as { stripeAccountId?: string };
      if (!stripeAccountId) continue;

      const quantity = Math.max(1, Number(item.quantity || 1));
      const unitAmountSEK = Math.round(Number(deal.price)); // pris på deal (SEK, heltal)
      const grossPerItemSEK = unitAmountSEK * quantity;

      const feePct =
        Number.isFinite(Number(deal.duration))
          ? feePctFromDuration(Number(deal.duration))
          : Math.max(0, Number(item.feePercentage ?? 0)); // fallback om duration saknas

      const platformFeePerItemSEK = Math.round((grossPerItemSEK * feePct) / 100);

      subtotalSEK += grossPerItemSEK;
      serviceFeeSEK += platformFeePerItemSEK;

      enrichedItems.push({
        dealId: item.id,
        sellerId,
        sellerStripeAccountId: stripeAccountId,
        quantity,
        unitAmountSEK,
        grossPerItemSEK,
        feePct,
        platformFeePerItemSEK,
      });

      if (!sellerMap[sellerId]) {
        sellerMap[sellerId] = { stripeAccountId };
      }
    }

    if (subtotalSEK <= 0) {
      return NextResponse.json({ error: 'Ogiltigt totalbelopp.' }, { status: 400 });
    }

    // --- Frakt (tillhör plattformen) ---
    const shippingFeeSEK = subtotalSEK < 500 ? 50 : 0;

    // --- Totalt kunddebiterat ---
    const totalAmountSEK = subtotalSEK + shippingFeeSEK;

    // --- Skapa PaymentIntent (belopp i öre) ---
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalAmountSEK * 100,
        currency,
        automatic_payment_methods: { enabled: true },
        receipt_email: buyer?.email || undefined,
        metadata: {
          subtotal_sek: String(subtotalSEK),
          platform_service_fee_sek: String(serviceFeeSEK),
          shipping_fee_sek: String(shippingFeeSEK),
          buyer_id: buyer?.id || '',
          buyer_email: buyer?.email || '',
        },
      },
      // NYTT: idempotency för att undvika dubbla PIs vid retrys
      idempotencyKey ? { idempotencyKey } : undefined
    );

    // Sätt transfer_group = PI-id (bra för att koppla transfers i webhooken)
    // Samtidigt skriver vi sessionId och ev. cart_id i metadata.
    await stripe.paymentIntents.update(paymentIntent.id, {
      transfer_group: paymentIntent.id,
      metadata: {
        ...(paymentIntent.metadata || {}),
        sessionId: paymentIntent.id,
        cart_id: (body as any)?.cartId || '',
      },
    });

    // --- Spara checkoutSession i Firestore (per-item breakdown) ---
    await setDoc(doc(collection(db, 'checkoutSessions'), paymentIntent.id), {
      createdAt: serverTimestamp(),
      sessionId: paymentIntent.id,
      currency,
      items: enrichedItems,        // innehåller gross + platformFee per item
      subtotalSEK,
      shippingFeeSEK,
      totalAmountSEK,
      serviceFeeSEK,
      sellerMap,                   // endast mapping: sellerId -> stripeAccountId
      status: 'requires_payment',
      buyerId: buyer?.id || null,
      buyerEmail: buyer?.email || null,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      receiptEmailOnPI: (paymentIntent as any).receipt_email ?? null,
      metadataBuyerEmail: paymentIntent.metadata?.buyer_email ?? null,
    });
  } catch (error) {
    console.error('[create-intent] Error:', error);
    return NextResponse.json({ error: 'Något gick fel.' }, { status: 500 });
  }
}
