import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: 'Ingen varukorg hittades.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      mode: 'payment',
      line_items: body.items.map((item: any) => ({
        price_data: {
          currency: 'sek',
          product_data: {
            name: item.title,
            description: item.companyName ?? '',
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/varukorg`,
    });

    await addDoc(collection(db, 'checkoutSessions'), {
      createdAt: serverTimestamp(),
      sessionId: session.id,
      items: body.items,
      totalAmount: body.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      ),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 });
  }
}
