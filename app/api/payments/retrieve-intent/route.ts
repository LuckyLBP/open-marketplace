import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeFirebase } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
  });
}

/**
 * POST: Skapa/hämta Stripe Express-konto för en säljare och returnera onboarding-länk
 * Body: { sellerId: string, accountType: 'company' | 'customer' }
 *
 * GET: Kontrollera status för ett konto
 * Query: ?sellerId=...&accountType=company|customer
 */
export async function POST(req: Request) {
  try {
    const { db } = await initializeFirebase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const stripe = getStripe();
    const body = await req.json();
    const { sellerId, accountType } = body as {
      sellerId?: string;
      accountType?: 'company' | 'customer';
    };

    if (!sellerId || !accountType || !['company', 'customer'].includes(accountType)) {
      return NextResponse.json({ error: 'Ogiltig säljardata' }, { status: 400 });
    }

    const col = accountType === 'company' ? 'companies' : 'customers';
    const sellerRef = doc(db, col, sellerId);
    const snap = await getDoc(sellerRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Säljaren hittades inte i databasen' }, { status: 404 });
    }

    let { stripeAccountId } = (snap.data() as any) || {};

    // 1) Skapa konto om saknas
    if (!stripeAccountId || typeof stripeAccountId !== 'string' || !stripeAccountId.startsWith('acct_')) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'SE', // justera om ni har säljare utanför Sverige
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual', // eller 'company' om ni vet detta istället
        settings: {
          payouts: { schedule: { interval: 'daily' } }, // valfritt
        },
        metadata: {
          app_seller_id: sellerId,
          app_account_type: accountType,
        },
      });

      stripeAccountId = account.id;

      await updateDoc(sellerRef, {
        stripeAccountId,
        stripeAccountCreatedAt: serverTimestamp(),
      });
    }

    // 2) Skapa onboarding-länk
    const returnUrl = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/settings?connect=done`
      : 'https://example.com/settings?connect=done';

    const refreshUrl = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/settings?connect=refresh`
      : 'https://example.com/settings?connect=refresh';

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    // 3) (valfritt) Spara senaste onboarding-försök
    await updateDoc(sellerRef, {
      stripeOnboardingLastUrl: accountLink.url,
      stripeOnboardingCreatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      stripeAccountId,
      onboardingUrl: accountLink.url,
    });
  } catch (err) {
    console.error('[create-stripe-account] Error:', err);
    return NextResponse.json({ error: 'Ett fel uppstod vid onboarding' }, { status: 500 });
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
    const accountType = (searchParams.get('accountType') as 'company' | 'customer') || undefined;

    if (!sellerId || !accountType || !['company', 'customer'].includes(accountType)) {
      return NextResponse.json({ error: 'Ogiltiga query-parametrar' }, { status: 400 });
    }

    const col = accountType === 'company' ? 'companies' : 'customers';
    const sellerRef = doc(db, col, sellerId);
    const snap = await getDoc(sellerRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: 'Säljaren hittades inte' }, { status: 404 });
    }

    const { stripeAccountId } = (snap.data() as any) || {};
    if (!stripeAccountId || typeof stripeAccountId !== 'string' || !stripeAccountId.startsWith('acct_')) {
      return NextResponse.json({
        hasStripeAccount: false,
        charges_enabled: false,
        payouts_enabled: false,
      });
    }

    const acct = await stripe.accounts.retrieve(stripeAccountId);
    return NextResponse.json({
      hasStripeAccount: true,
      stripeAccountId,
      charges_enabled: acct.charges_enabled,
      payouts_enabled: acct.payouts_enabled,
      requirements: acct.requirements,
    });
  } catch (err) {
    console.error('[create-stripe-account][GET] Error:', err);
    return NextResponse.json({ error: 'Ett fel uppstod vid statuskontroll' }, { status: 500 });
  }
}
