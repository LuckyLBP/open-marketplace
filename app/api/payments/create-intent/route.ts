import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

// --- Stripe init ---
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
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

// 🔄 UPPDATERAD: utöka "buyer" till full gästdatatyp
type IncomingBuyer = {
  id?: string; // om inloggad finns kvar (ok att vara undefined för gäster)
  email?: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string; // t.ex. "SE"
};

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
    .map((i) => ({ id: i.id, q: Number(i.quantity || 1) }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const payload = JSON.stringify({ b: buyerId || '', i: normalized });
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 24);
}

export async function POST(req: Request) {
  try {
    // --- Use Admin SDK (bypasses Firestore rules) ---
    const db = adminDb;
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    // --- Body parse ---
    const body = await req.json();
    const { items, buyer } = body as {
      items: IncomingItem[];
      buyer?: IncomingBuyer;
    };

    console.log('[create-intent] Request received:', {
      itemCount: items?.length,
      itemIds: items?.map((i) => i.id),
      buyerEmail: buyer?.email,
      buyerName: buyer?.fullName,
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Varukorgen är tom.' },
        { status: 400 }
      );
    }

    // ✅ Validera gästdatan (minimikrav för kvitto/spårbarhet)
    const hasRequiredBuyer =
      !!buyer?.email &&
      !!buyer?.fullName &&
      !!buyer?.addressLine1 &&
      !!buyer?.postalCode &&
      !!buyer?.city &&
      !!buyer?.country;

    console.log('[create-intent] Buyer validation:', {
      hasEmail: !!buyer?.email,
      hasFullName: !!buyer?.fullName,
      hasAddress: !!buyer?.addressLine1,
      hasPostalCode: !!buyer?.postalCode,
      hasCity: !!buyer?.city,
      hasCountry: !!buyer?.country,
      hasRequiredBuyer,
      buyer,
    });

    if (!hasRequiredBuyer) {
      return NextResponse.json(
        { error: 'Kunduppgifter saknas (namn, e-post och adress krävs).' },
        { status: 400 }
      );
    }

    // Stabil nyckel per varukorg (från klienten eller server-genererad)
    const providedCartId: string | undefined =
      (body as any)?.cartId || (body as any)?.idempotencyKey || undefined;
    const cartId = providedCartId || makeDeterministicCartId(items, buyer?.id);

    const currency = 'sek';

    // ===== Idempotens: återanvänd befintlig PI för samma cartId =====
    const cartRef = db.collection('checkoutCarts').doc(cartId);
    const cartSnap = await cartRef.get();
    const existingPiId = cartSnap.exists
      ? (cartSnap.data() as any)?.piId
      : undefined;

    if (existingPiId) {
      try {
        const existing = await stripe.paymentIntents.retrieve(existingPiId);
        if (existing && !['canceled', 'succeeded'].includes(existing.status)) {
          await cartRef.update({
            piId: existing.id,
            updatedAt: FieldValue.serverTimestamp(),
          });
          return NextResponse.json({
            clientSecret: existing.client_secret,
            paymentIntentId: existing.id,
            cartId,
            reused: true,
          });
        }
      } catch (e) {
        console.warn(
          '[create-intent] Could not reuse existing PI',
          existingPiId,
          e
        );
      }
    }

    // --- Ackumulatorer ---
    let subtotalSEK = 0;
    let serviceFeeSEK = 0;

    const enrichedItems: EnrichedItem[] = [];
    const sellerMap: Record<string, { stripeAccountId: string }> = {};

    // --- Bygg items från Firestore ---
    for (const item of items) {
      console.log(`[create-intent] Processing item:`, {
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      });

      const dealRef = db.collection('deals').doc(item.id);
      const dealSnap = await dealRef.get();
      if (!dealSnap.exists) {
        console.warn('[create-intent] deal not found → skip', item.id);
        continue;
      }

      const deal = dealSnap.data() as any;
      console.log(`[create-intent] Deal found:`, {
        id: deal.id,
        title: deal.title,
        companyId: deal.companyId,
        price: deal.price,
        status: deal.status,
      });

      const sellerId: string = deal.companyId;
      if (!sellerId) {
        console.error(
          '[create-intent] Deal has no companyId → skip',
          item.id,
          'deal keys:',
          Object.keys(deal)
        );
        return NextResponse.json(
          {
            error: `Deal "${deal.title}" är inte korrekt konfigurerad. Kontakta support.`,
          },
          { status: 400 }
        );
      }

      const accountType: 'company' | 'customer' =
        item.accountType === 'customer' ? 'customer' : 'company';

      const sellerRef = db
        .collection(accountType === 'company' ? 'companies' : 'customers')
        .doc(sellerId);
      const sellerSnap = await sellerRef.get();
      if (!sellerSnap.exists) {
        console.warn('[create-intent] seller doc missing → skip', sellerId);
        continue;
      }

      const sellerData = sellerSnap.data() as any;
      const { stripeAccountId } = sellerData;

      // Better logging for debugging
      console.log(`[create-intent] Seller ${sellerId} data:`, {
        hasStripeAccount: !!stripeAccountId,
        accountId: stripeAccountId
          ? `${stripeAccountId.substring(0, 10)}...`
          : 'MISSING',
        sellerName: sellerData?.name || sellerData?.companyName || 'Unknown',
      });

      if (!stripeAccountId) {
        console.error(
          `[create-intent] ❌ Seller ${sellerId} has no stripeAccountId → SKIPPING ITEM ${item.id}`
        );
        // Don't skip - continue processing but flag the issue
        return NextResponse.json(
          {
            error: `Säljaren för "${deal.title}" har inte konfigurerat sitt Stripe-konto än. Kontakta säljaren.`,
          },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, Number(item.quantity || 1));
      const unitAmountSEK = Math.round(Number(deal.price));
      const grossPerItemSEK = unitAmountSEK * quantity;

      const feePct = Number.isFinite(Number(deal.duration))
        ? feePctFromDuration(Number(deal.duration))
        : Math.max(0, Number(item.feePercentage ?? 0));

      const platformFeePerItemSEK = Math.round(
        (grossPerItemSEK * feePct) / 100
      );

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
      return NextResponse.json(
        { error: 'Ogiltigt totalbelopp.' },
        { status: 400 }
      );
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
        // ✅ Kvitto till gäst (eller inloggad) via Stripe
        receipt_email: buyer?.email || undefined,
        metadata: {
          subtotal_sek: String(subtotalSEK),
          platform_service_fee_sek: String(serviceFeeSEK),
          shipping_fee_sek: String(shippingFeeSEK),

          // behåll backward-compatible fält
          buyer_id: buyer?.id || '',
          buyer_email: buyer?.email || '',

          // lägg till några icke-känsliga buyer-fält för sökbarhet i Stripe
          buyer_name: buyer?.fullName || '',
          buyer_phone: buyer?.phone || '',
          buyer_city: buyer?.city || '',
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
    await db
      .collection('checkoutSessions')
      .doc(paymentIntent.id)
      .set({
        createdAt: FieldValue.serverTimestamp(),
        sessionId: paymentIntent.id,
        currency,
        items: enrichedItems,
        subtotalSEK,
        shippingFeeSEK,
        totalAmountSEK,
        serviceFeeSEK,
        sellerMap,
        status: 'requires_payment',

        // 🔥 Spara både gamla och nya buyer-fält för spårbarhet
        buyerId: buyer?.id || null,
        buyerEmail: buyer?.email || null,
        buyer: {
          id: buyer?.id || null,
          fullName: buyer?.fullName || null,
          email: buyer?.email || null,
          phone: buyer?.phone || null,
          addressLine1: buyer?.addressLine1 || null,
          addressLine2: buyer?.addressLine2 || null,
          postalCode: buyer?.postalCode || null,
          city: buyer?.city || null,
          country: buyer?.country || null,
        },
      });

    // --- Pekare per cart (för återanvändning vid retrys/dubbelklick) ---
    await cartRef.set(
      {
        piId: paymentIntent.id,
        updatedAt: FieldValue.serverTimestamp(),
      },
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[create-intent] Error:', {
      message: errorMsg,
      error: error instanceof Error ? error.stack : error,
    });
    return NextResponse.json(
      {
        error: 'Något gick fel vid betalningen.',
        debug: errorMsg, // Remove this in production but keep for now
      },
      { status: 500 }
    );
  }
}
