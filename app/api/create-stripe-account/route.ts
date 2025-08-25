import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeFirebase } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });
}

export async function POST(request: Request) {
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

    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Ingen varukorg hittades.' },
        { status: 400 }
      );
    }

    // 🧠 Säkerställ att varje item har accountType
    const enrichedItems = body.items.map((item: any) => ({
      ...item,
      accountType:
        item.accountType ?? (item.companyId ? 'company' : 'customer'),
    }));

    const firstItem = enrichedItems[0];
    const sellerId = firstItem.companyId;
    const accountType = firstItem.accountType;

    if (
      !sellerId ||
      !accountType ||
      !['company', 'customer'].includes(accountType)
    ) {
      return NextResponse.json(
        { error: 'Ogiltig säljardata' },
        { status: 400 }
      );
    }

    const sellerRef = doc(
      db,
      accountType === 'company' ? 'companies' : 'customers',
      sellerId
    );
    const sellerSnap = await getDoc(sellerRef);

    if (!sellerSnap.exists()) {
      return NextResponse.json(
        { error: 'Säljaren hittades inte i databasen' },
        { status: 404 }
      );
    }

    const { stripeAccountId } = sellerSnap.data();

    if (
      !stripeAccountId ||
      typeof stripeAccountId !== 'string' ||
      !stripeAccountId.startsWith('acct_')
    ) {
      return NextResponse.json(
        { error: 'Säljaren har inget giltigt Stripe-konto' },
        { status: 400 }
      );
    }

    const line_items = enrichedItems.map((item: any) => ({
      price_data: {
        currency: 'sek',
        product_data: {
          name: item.title,
          description: item.companyName ?? '',
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    const totalAmount = enrichedItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const totalFeeAmount = enrichedItems.reduce(
      (sum: number, item: any) =>
        sum +
        Math.round(
          item.price * item.quantity * (item.feePercentage / 100) * 100
        ),
      0
    );

    console.log('[Stripe Checkout]', {
      sellerId,
      stripeAccountId,
      totalAmount,
      totalFeeAmount,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&dealId=${firstItem.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/varukorg`,
      payment_intent_data: {
        application_fee_amount: totalFeeAmount,
        transfer_data: {
          destination: stripeAccountId,
        },
      },
    });

    await setDoc(doc(db, 'checkoutSessions', session.id), {
      createdAt: serverTimestamp(),
      sessionId: session.id,
      items: enrichedItems,
      totalAmount,
      feeAmount: totalFeeAmount,
      sellerId,
      stripeAccountId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe Checkout ERROR]:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid betalning' },
      { status: 500 }
    );
  }
}
