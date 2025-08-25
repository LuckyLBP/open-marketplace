import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const { dealId, type, duration, price } = body;

    if (!dealId || !type || !duration || !price) {
      return NextResponse.json(
        { error: 'Ogiltig begäran  saknar fält' },
        { status: 400 }
      );
    }

    const allowedTypes = ['banner', 'floating'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Ogiltig boost-typ' }, { status: 400 });
    }

    const dealSnap = await getDoc(doc(db, 'deals', dealId));
    if (!dealSnap.exists()) {
      return NextResponse.json(
        { error: 'Erbjudandet finns inte' },
        { status: 404 }
      );
    }

    const deal = dealSnap.data();

    if (type === 'floating') {
      const now = Timestamp.now();
      const activeBoostsQuery = query(
        collection(db, 'deals'),
        where('isBoosted', '==', true),
        where('boostType', '==', 'floating'),
        where('boostStart', '<=', now),
        where('boostEnd', '>', now)
      );

      const snapshot = await getDocs(activeBoostsQuery);
      const activeFloatingCount = snapshot.size;

      if (activeFloatingCount >= 3) {
        return NextResponse.json(
          {
            error:
              'Max antal floating-annonser är redan aktiva. Försök senare.',
          },
          { status: 400 }
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      line_items: [
        {
          price_data: {
            currency: 'sek',
            product_data: {
              name: `${type === 'floating' ? 'floatingAd' : 'BannerAd'} för: ${
                deal.title
              }`,
              description: `Visning i ${type} under ${duration}h`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?boost=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?boost=cancel`,
      metadata: {
        dealId,
        boostType: type,
        duration: duration.toString(),
      },
    });

    await addDoc(collection(db, 'boostSessions'), {
      dealId,
      boostType: type,
      duration,
      total: price,
      sessionId: session.id,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('🚨 Boost Checkout Error:', error);
    return NextResponse.json(
      { error: 'Checkout misslyckades' },
      { status: 500 }
    );
  }
}
