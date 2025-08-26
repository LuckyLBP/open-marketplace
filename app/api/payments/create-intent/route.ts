// /api/payments/create-intent/route.ts
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

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });
}

// Duration → fee %-trappa
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

export async function POST(req: Request) {
  try {
    // Initialize Firebase and get db instance
    const { db } = initializeFirebase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = getStripe();

    const body = await req.json();
    const { items } = body as {
      items: Array<{
        id: string; // dealId
        quantity?: number;
        accountType?: 'company' | 'customer';
        price?: number;
        feePercentage?: number;
      }>;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Varukorgen är tom.' },
        { status: 400 }
      );
    }

    const currency = 'sek';

    let subtotalSEK = 0;
    let serviceFeeSEK = 0;

    const sellerMap: Record<
      string,
      { amountSEK: number; stripeAccountId: string }
    > = {};
    const enrichedItems: Array<{
      dealId: string;
      sellerId: string;
      quantity: number;
      unitAmountSEK: number;
      feePct: number;
    }> = [];

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
      const { stripeAccountId } = sellerSnap.data() as {
        stripeAccountId?: string;
      };
      if (!stripeAccountId) continue;

      const qty = Math.max(1, Number(item.quantity || 1));
      const unitAmountSEK = Math.round(Number(deal.price));
      const lineTotalSEK = unitAmountSEK * qty;

      const feePct = Number.isFinite(Number(deal.duration))
        ? feePctFromDuration(Number(deal.duration))
        : Math.max(0, Number(item.feePercentage ?? 0));

      const lineFeeSEK = Math.round((lineTotalSEK * feePct) / 100);
      const sellerNetSEK = lineTotalSEK - lineFeeSEK;

      subtotalSEK += lineTotalSEK;
      serviceFeeSEK += lineFeeSEK;

      if (!sellerMap[sellerId]) {
        sellerMap[sellerId] = { amountSEK: sellerNetSEK, stripeAccountId };
      } else {
        sellerMap[sellerId].amountSEK += sellerNetSEK;
      }

      enrichedItems.push({
        dealId: item.id,
        sellerId,
        quantity: qty,
        unitAmountSEK,
        feePct,
      });
    }

    if (subtotalSEK <= 0) {
      return NextResponse.json(
        { error: 'Ogiltigt totalbelopp.' },
        { status: 400 }
      );
    }

    const shippingFeeSEK = subtotalSEK < 500 ? 50 : 0;
    const grandTotalSEK = subtotalSEK + shippingFeeSEK;

    // --- 7) Skapa PaymentIntent ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: grandTotalSEK * 100,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        platform_service_fee_sek: String(serviceFeeSEK),
        shipping_fee_sek: String(shippingFeeSEK),
        subtotal_sek: String(subtotalSEK),
      },
    });

    // --- 7b) Uppdatera metadata så vi alltid har sessionId i Stripe ---
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        ...paymentIntent.metadata,
        sessionId: paymentIntent.id, // <- knyter ihop Firestore & Stripe
      },
    });

    // --- 8) Spara checkoutSession i Firestore ---
    const sessionRef = doc(
      collection(db, 'checkoutSessions'),
      paymentIntent.id
    );
    await setDoc(sessionRef, {
      createdAt: serverTimestamp(),
      sessionId: paymentIntent.id,
      currency,
      items: enrichedItems,
      subtotalSEK,
      shippingFeeSEK,
      totalAmountSEK: grandTotalSEK,
      serviceFeeSEK,
      sellerMap,
      status: 'requires_payment',
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('[create-intent] Error:', error);
    return NextResponse.json({ error: 'Något gick fel.' }, { status: 500 });
  }
}
