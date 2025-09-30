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
import crypto from 'crypto';

// --- Stripe init ---
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
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
  price?: number;
  feePercentage?: number;
};
type IncomingBuyer = { id?: string; email?: string };

type EnrichedItem = {
  dealId: string;
  sellerId: string;
  sellerStripeAccountId: string;
  quantity: number;
  unitAmountSEK: number;
  grossPerItemSEK: number;
  feePct: number;
  platformFeePerItemSEK: number;
};

// Skapa ett stabilt cartId om klienten inte skickar ett
function makeDeterministicCartId(items: IncomingItem[], buyerId?: string) {
  // sortera items så ordningen inte påverkar hash
  const normalized = [...items]
    .map(i => ({ id: i.id, q: Number(i.quantity || 1) }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const payload = JSON.stringify({ b: buyerId || '', i: normalized });
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 24);
}

export async function POST(req: Request) {
  try {
    // --- Firebase init ---
    const { db } = await initializeFirebase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const stripe = getStripe();

    // --- Body parse ---
    const body = await req.json();
    const { items, buyer } = body as { items: IncomingItem[]; buyer?: IncomingBuyer };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Varukorgen är tom.' }, { status: 400 });
    }

    // Stabil nyckel per varukorg (från klienten eller server-genererad)
    const providedCartId: string | undefined =
      (body as any)?.cartId || (body as any)?.idempotencyKey || undefined;
    const cartId = providedCartId || makeDeterministicCartId(items, buyer?.id);

    const currency = 'sek';

    // ===== Idempotens: återanvänd befintlig PI för samma cartId =====
    const cartRef = doc(collection(db, 'checkoutCarts'), cartId);
    const cartSnap = await getDoc(cartRef);
    const existingPiId = cartSnap.exists() ? (cartSnap.data() as any)?.piId : undefined;

    if (existingPiId) {
      try {
        const existing = await stripe.paymentIntents.retrieve(existingPiId);
        if (existing && !['canceled', 'succeeded'].includes(existing.status)) {
          await setDoc(
            cartRef,
            { piId: existing.id, updatedAt: serverTimestamp() },
            { merge: true }
          );
          return NextResponse.json({
            clientSecret: existing.client_secret,
            paymentIntentId: existing.id,
            cartId,
            reused: true,
          });
        }
      } catch (e) {
        console.warn('[create-intent] Could not reuse existing PI', existingPiId, e);
      }
    }

    // --- Ackumulatorer ---
    let subtotalSEK = 0;
    let serviceFeeSEK = 0;

    const enrichedItems: EnrichedItem[] = [];
    const sellerMap: Record<string, { stripeAccountId: string }> = {};

    // --- Bygg items från Firestore ---
    for (const item of items) {
      const dealRef = doc(db, 'deals', item.id);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) {
        console.warn('[create-intent] deal not found → skip', item.id);
        continue;
      }

      const deal = dealSnap.data() as any;

      const sellerId: string = deal.companyId;
      if (!sellerId) {
        console.warn('[create-intent] deal has no sellerId → skip', item.id);
        continue;
      }

      const accountType: 'company' | 'customer' =
        item.accountType === 'customer' ? 'customer' : 'company';

      const sellerRef = doc(
        db,
        accountType === 'company' ? 'companies' : 'customers',
        sellerId
      );
      const sellerSnap = await getDoc(sellerRef);
      if (!sellerSnap.exists()) {
        console.warn('[create-intent] seller doc missing → skip', sellerId);
        continue;
      }

      const { stripeAccountId } = sellerSnap.data() as { stripeAccountId?: string };
      if (!stripeAccountId) {
        console.warn('[create-intent] seller has no stripeAccountId → skip', sellerId);
        continue;
      }

      const quantity = Math.max(1, Number(item.quantity || 1));
      const unitAmountSEK = Math.round(Number(deal.price));
      const grossPerItemSEK = unitAmountSEK * quantity;

      const feePct =
        Number.isFinite(Number(deal.duration))
          ? feePctFromDuration(Number(deal.duration))
          : Math.max(0, Number(item.feePercentage ?? 0));

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
    const amountOre = Math.max(0, Math.round(totalAmountSEK * 100));

    // --- Skapa PaymentIntent ---
    const options = { idempotencyKey: `pi_${cartId}` };

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountOre,
        currency,
        automatic_payment_methods: { enabled: true },
        receipt_email: buyer?.email || undefined,
        metadata: {
          subtotal_sek: String(subtotalSEK),
          platform_service_fee_sek: String(serviceFeeSEK),
          shipping_fee_sek: String(shippingFeeSEK),
          buyer_id: buyer?.id || '',
          buyer_email: buyer?.email || '',
          cart_id: cartId,
        },
      },
      options
    );

    // Sätt transfer_group = PI-id och sessionId
    await stripe.paymentIntents.update(paymentIntent.id, {
      transfer_group: paymentIntent.id,
      metadata: {
        ...(paymentIntent.metadata || {}),
        sessionId: paymentIntent.id,
      },
    });

    // --- Spara checkoutSession i Firestore ---
    await setDoc(doc(collection(db, 'checkoutSessions'), paymentIntent.id), {
      createdAt: serverTimestamp(),
      sessionId: paymentIntent.id,
      currency,
      items: enrichedItems,
      subtotalSEK,
      shippingFeeSEK,
      totalAmountSEK,
      serviceFeeSEK,
      sellerMap,
      status: 'requires_payment',
      buyerId: buyer?.id || null,
      buyerEmail: buyer?.email || null,
    });

    // --- Pekare per cart (för återanvändning vid retrys/dubbelklick) ---
    await setDoc(
      cartRef,
      { piId: paymentIntent.id, updatedAt: serverTimestamp() },
      { merge: true }
    );

    return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      cartId,
      receiptEmailOnPI: (paymentIntent as any).receipt_email ?? null,
      metadataBuyerEmail: paymentIntent.metadata?.buyer_email ?? null,
    });
  } catch (error) {
    console.error('[create-intent] Error:', error);
    return NextResponse.json({ error: 'Något gick fel.' }, { status: 500 });
  }
}
