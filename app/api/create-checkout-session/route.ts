import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const items = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Ingen varukorg hittades.' }, { status: 400 });
    }

    const firstItem = items[0];
    const { companyId, accountType } = firstItem;

    if (!companyId || !accountType || !['company', 'customer'].includes(accountType)) {
      console.error('[ERROR] Ogiltig säljardata:', { companyId, accountType });
      return NextResponse.json({ error: 'Ogiltig säljardata' }, { status: 400 });
    }

    const sellerRef = doc(db, accountType === 'company' ? 'companies' : 'customers', companyId);
    const sellerSnap = await getDoc(sellerRef);

    if (!sellerSnap.exists()) {
      return NextResponse.json({ error: 'Säljaren hittades inte i databasen' }, { status: 404 });
    }

    const { stripeAccountId } = sellerSnap.data();

    if (!stripeAccountId || typeof stripeAccountId !== 'string' || !stripeAccountId.startsWith('acct_')) {
      return NextResponse.json({ error: 'Säljaren har inget giltigt Stripe-konto' }, { status: 400 });
    }

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'sek',
        product_data: {
          name: item.title,
          description: item.companyName ?? '',
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity ?? 1,
    }));

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * (item.quantity ?? 1),
      0
    );

    const totalFeeAmount = items.reduce(
      (sum: number, item: any) =>
        sum + Math.round(item.price * (item.quantity ?? 1) * (item.feePercentage / 100) * 100),
      0
    );

    console.log('[Stripe Checkout]', {
      companyId,
      stripeAccountId,
      totalAmount,
      totalFeeAmount,
      accountType,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
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
      items,
      totalAmount,
      feeAmount: totalFeeAmount,
      sellerId: companyId,
      stripeAccountId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe Checkout ERROR]:', error);
    return NextResponse.json({ error: 'Ett fel uppstod vid betalning' }, { status: 500 });
  }
}
