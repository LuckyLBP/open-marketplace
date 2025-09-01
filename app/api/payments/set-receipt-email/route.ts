import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' });
}

export async function POST(req: Request) {
  try {
    const { pi, email } = await req.json();
    if (!pi || !email) {
      return NextResponse.json({ error: 'Missing pi or email' }, { status: 400 });
    }
    const stripe = getStripe();
    const updated = await stripe.paymentIntents.update(pi, { receipt_email: email });
    return NextResponse.json({ ok: true, receipt_email: updated.receipt_email });
  } catch (e: any) {
    console.error('[set-receipt-email] error:', e);
    return NextResponse.json({ error: e?.message || 'update failed' }, { status: 500 });
  }
}
