import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Saknar paymentIntent ID' },
      { status: 400 }
    );
  }

  try {
    // Initialize Stripe
    const stripe = getStripe();

    const intent = await stripe.paymentIntents.retrieve(id);
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error('retrieve-intent error', err);
    return NextResponse.json(
      { error: 'Kunde inte hämta paymentIntent' },
      { status: 500 }
    );
  }
}
