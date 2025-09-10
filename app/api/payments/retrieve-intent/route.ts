// app/api/payments/retrieve-intent/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is required');
  return new Stripe(key, { apiVersion: '2025-04-30.basil' });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id =
      searchParams.get('id') ||
      searchParams.get('payment_intent') ||
      searchParams.get('pi');

    if (!id || !id.startsWith('pi_')) {
      return NextResponse.json({ error: 'Ogiltiga query-parametrar' }, { status: 400 });
    }

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(id);

    return NextResponse.json({
      id: pi.id,
      clientSecret: pi.client_secret,          // används av Stripe Elements
      status: pi.status,
      amount: pi.amount,
      currency: pi.currency,
      receipt_email: (pi as any).receipt_email ?? null,
      metadata: pi.metadata ?? {},
    });
  } catch (e: any) {
    console.error('[retrieve-intent] error:', e);
    return NextResponse.json(
      { error: e?.message || 'Kunde inte hämta PaymentIntent' },
      { status: 500 }
    );
  }
}
