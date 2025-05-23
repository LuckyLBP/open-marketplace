import { NextResponse } from 'next/server';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export async function POST(request: Request) {
  try {
    const { dealId, price, title, feePercentage, companyId, userId } =
      await request.json();

    // Verify the deal exists and is still active
    const dealDoc = await getDoc(doc(db, 'deals', dealId));
    if (!dealDoc.exists()) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const dealData = dealDoc.data();
    const expiresAt = dealData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Deal has expired' }, { status: 400 });
    }

    // Calculate total with fee
    const feeAmount = price * (feePercentage / 100);
    const totalAmount = price + feeAmount;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sek',
            product_data: {
              name: title,
              description: `Deal from BudFynd.se (${feePercentage}% fee included)`,
            },
            unit_amount: Math.round(totalAmount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/${dealId}`,
      metadata: {
        dealId,
        companyId,
        userId,
        feePercentage: feePercentage.toString(),
      },
    });

    // Store the checkout session in Firestore
    await addDoc(collection(db, 'checkoutSessions'), {
      sessionId: session.id,
      dealId,
      companyId,
      userId,
      price,
      feePercentage,
      totalAmount,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
