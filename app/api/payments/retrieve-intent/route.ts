import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Saknar paymentIntent ID' }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(id);
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error('retrieve-intent error', err);
    return NextResponse.json({ error: 'Kunde inte hämta paymentIntent' }, { status: 500 });
  }
}
