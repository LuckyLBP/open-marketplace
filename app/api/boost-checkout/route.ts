import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// --- helpers för pris ---
function boostPriceFromSettings(
  boost: any,
  placement: 'floating' | 'banner',
  duration: number
): number {
  // 1. Om tabell per duration (t.ex. boostPrices.floating = { "12":199, "24":299 })
  if (boost?.[placement] && typeof boost[placement] === 'object') {
    const table = boost[placement] as Record<string, number>;
    if (typeof table[String(duration)] === 'number') return table[String(duration)];

    // fallback: närmsta lägre duration
    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    let best = table[String(keys[0])];
    for (const k of keys) {
      if (duration >= k) best = table[String(k)];
      else break;
    }
    return best ?? 0;
  }

  // 2. Annars per timme (floatingPerHour / bannerPerHour)
  const perHour =
    placement === 'floating'
      ? boost?.floatingPerHour ?? 20
      : boost?.bannerPerHour ?? 10;
  return duration * perHour;
}

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const db = adminDb;
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    const { dealId, type, duration } = body;
    if (!dealId || !type || !duration) {
      return NextResponse.json(
        { error: 'Ogiltig begäran – saknar fält' },
        { status: 400 }
      );
    }

    const allowedTypes = ['banner', 'floating'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Ogiltig boost-typ' }, { status: 400 });
    }

    // Hämta deal
    const dealSnap = await db.collection('deals').doc(dealId).get();
    if (!dealSnap.exists) {
      return NextResponse.json(
        { error: 'Erbjudandet finns inte' },
        { status: 404 }
      );
    }
    const deal = dealSnap.data();
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal data saknas' },
        { status: 404 }
      );
    }

    // Hämta global settings
    const settingsSnap = await db.collection('settings').doc('global').get();
    const settings = settingsSnap.exists ? settingsSnap.data() : {};
    const boostSettings = settings?.boostPrices || {};

    // 🔑 Räkna fram korrekt pris från settings
    const trustedPrice = boostPriceFromSettings(boostSettings, type, duration);
    if (!trustedPrice || trustedPrice <= 0) {
      return NextResponse.json(
        { error: 'Kunde inte räkna ut pris för boost' },
        { status: 400 }
      );
    }

    // Floating cap: max 3 åt gången
    if (type === 'floating') {
      const now = new Date();
      const activeBoostsQuery = db.collection('deals')
        .where('isBoosted', '==', true)
        .where('boostType', '==', 'floating')
        .where('boostStart', '<=', now)
        .where('boostEnd', '>', now);

      const snapshot = await activeBoostsQuery.get();
      if (snapshot.size >= 3) {
        return NextResponse.json(
          { error: 'Max antal floating-annonser är redan aktiva. Försök senare.' },
          { status: 400 }
        );
      }
    }

    // Skapa Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      line_items: [
        {
          price_data: {
            currency: 'sek',
            product_data: {
              name: `${type === 'floating' ? 'FloatingAd' : 'BannerAd'} för: ${deal.title}`,
              description: `Visning i ${type} under ${duration}h`,
            },
            unit_amount: trustedPrice * 100, // 💰 alltid settings-priset
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
        trustedPrice: trustedPrice.toString(),
      },
    });

    await db.collection('boostSessions').add({
      dealId,
      boostType: type,
      duration,
      total: trustedPrice,
      sessionId: session.id,
      createdAt: FieldValue.serverTimestamp(),
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
