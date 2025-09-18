import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeFirebase } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Håll samma version som övriga routes
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is required');
  return new Stripe(key, { apiVersion: '2025-04-30.basil' });
}

type AccountType = 'company' | 'customer';

/**
 * POST: Skapa/hämta Stripe Express-konto och returnera onboarding-länk
 * Body: { sellerId?: string, entityId?: string, accountType?: 'company' | 'customer' }
 *
 * GET: Kontrollera status för ett konto
 * Query: ?sellerId=...&accountType=company|customer
 */
export async function POST(req: Request) {
  try {
    // ⚠️ Viktigt: vänta in Firebase-init
    const { db } = await initializeFirebase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const stripe = getStripe();
    const body = await req.json().catch(() => ({} as any));

    const sellerId: string | undefined = body?.sellerId || body?.entityId;
    const accountType: AccountType = body?.accountType === 'customer' ? 'customer' : 'company';

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId (eller entityId) krävs' }, { status: 400 });
    }

    const col = accountType === 'company' ? 'companies' : 'customers';
    const sellerRef = doc(db, col, sellerId);
    const snap = await getDoc(sellerRef);
    if (!snap.exists()) {
      // Skapa minimalt dokument om det saknas (så updateDoc inte faller)
      await setDoc(sellerRef, { createdAt: serverTimestamp() }, { merge: true });
    }

    let data = (await getDoc(sellerRef)).data() as any;
    let stripeAccountId: string | undefined = data?.stripeAccountId;
    let legacyStripeAccountId: string | null = null;

    // ✅ Validera befintligt acct_ mot nuvarande Stripe-konto
    if (stripeAccountId && typeof stripeAccountId === 'string' && stripeAccountId.startsWith('acct_')) {
      try {
        await stripe.accounts.retrieve(stripeAccountId);
      } catch {
        // Finns inte på denna plattform → skapa nytt och spara legacy-id
        legacyStripeAccountId = stripeAccountId;
        stripeAccountId = undefined;
      }
    } else {
      stripeAccountId = undefined;
    }

    // ✅ Skapa nytt Express-konto om vi inte har ett giltigt
    if (!stripeAccountId) {
      const acct = await stripe.accounts.create({
        type: 'express',
        country: 'SE',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          app_seller_id: sellerId,
          app_account_type: accountType,
        },
      });

      stripeAccountId = acct.id;

      await updateDoc(sellerRef, {
        stripeAccountId,
        legacyStripeAccountId: legacyStripeAccountId || null,
        stripeAccountCreatedAt: serverTimestamp(),
        stripeLinkedAt: serverTimestamp(),
      });
    }

    // ✅ Bygg baseUrl robust (lokalt funkar utan NEXT_PUBLIC_BASE_URL)
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (() => {
        try {
          return new URL(req.url).origin; // t.ex. http://localhost:3000
        } catch {
          return 'http://localhost:3000';
        }
      })();

    // ✅ Skapa onboarding-länk (går bara igenom om acct_ finns på denna plattform)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard/settings?connect=refresh`,
      return_url: `${baseUrl}/dashboard/settings?connect=done`,
      type: 'account_onboarding',
    });

    // (valfritt) logga senaste länk
    await updateDoc(sellerRef, {
      stripeOnboardingLastUrl: accountLink.url,
      stripeOnboardingCreatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      stripeAccountId,
      onboardingUrl: accountLink.url,
      reusedExisting: !legacyStripeAccountId, // true = vi återanvände befintligt acct_
      legacyStripeAccountId,
      accountType,
      sellerId,
    });
  } catch (err: any) {
    // Logga Stripe-fel tydligare i servern
    console.error('[create-stripe-account][POST] Error:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Ett fel uppstod vid onboarding' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { db } = await initializeFirebase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const stripe = getStripe();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId') || undefined;
    const accountType: AccountType =
      (searchParams.get('accountType') as AccountType) === 'customer' ? 'customer' : 'company';

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId krävs' }, { status: 400 });
    }

    const col = accountType === 'company' ? 'companies' : 'customers';
    const sellerRef = doc(db, col, sellerId);
    const snap = await getDoc(sellerRef);
    if (!snap.exists()) {
      return NextResponse.json({
        hasStripeAccount: false,
        stripeAccountId: null,
        charges_enabled: false,
        payouts_enabled: false,
      });
    }

    const { stripeAccountId } = (snap.data() as any) || {};
    if (!stripeAccountId || typeof stripeAccountId !== 'string' || !stripeAccountId.startsWith('acct_')) {
      return NextResponse.json({
        hasStripeAccount: false,
        stripeAccountId: null,
        charges_enabled: false,
        payouts_enabled: false,
      });
    }

    // ✅ Validera att kontot verkligen finns på nuvarande plattform
    try {
      const acct = await stripe.accounts.retrieve(stripeAccountId);
      return NextResponse.json({
        hasStripeAccount: true,
        stripeAccountId,
        charges_enabled: acct.charges_enabled,
        payouts_enabled: acct.payouts_enabled,
        requirements: acct.requirements,
      });
    } catch {
      // Konto finns inte på denna plattform (t.ex. efter kontobyte)
      return NextResponse.json({
        hasStripeAccount: false,
        stripeAccountId: null,
        charges_enabled: false,
        payouts_enabled: false,
      });
    }
  } catch (err: any) {
    console.error('[create-stripe-account][GET] Error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Ett fel uppstod vid statuskontroll' }, { status: 500 });
  }
}
