import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeFirebase } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// --- Stripe init ---
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is required');
  // Låt Stripe använda sin default API-version (säkrare än att hårdkoda).
  return new Stripe(key);
}

/**
 * POST: Skapa/hämta Stripe Express-konto och returnera onboarding-länk
 * Body: { sellerId: string, accountType: 'company' | 'customer' }
 *
 * GET: Kontrollera status för ett konto
 * Query: ?sellerId=...&accountType=company|customer
 */
export async function POST(req: Request) {
  try {
    const { db } = initializeFirebase();
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

    // 1) Skapa Connect-konto om det saknas
    if (!stripeAccountId || typeof stripeAccountId !== 'string' || !stripeAccountId.startsWith('acct_')) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'SE',
        business_type: accountType === 'company' ? 'company' : 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        settings: {
          payouts: { schedule: { interval: 'daily' } },
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

    // 2) Skapa onboarding-länk (använd dynamisk origin istället för env)
    const origin = new URL(req.url).origin; // ex: http://localhost:3000 eller https://din-app.vercel.app
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId!,
      refresh_url: `${origin}/dashboard/settings?connect=refresh&aid=${encodeURIComponent(sellerId)}`,
      return_url: `${origin}/dashboard/settings?connect=done&aid=${encodeURIComponent(sellerId)}`,
      type: 'account_onboarding',
    });

    // 3) (Valfritt) Spara senaste onboarding-url
    await updateDoc(sellerRef, {
      stripeOnboardingLastUrl: accountLink.url,
      stripeOnboardingCreatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      stripeAccountId,
      onboardingUrl: accountLink.url,
    });
  } catch (err: any) {
    console.error('[create-stripe-account][POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Ett fel uppstod vid onboarding' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { db } = initializeFirebase();
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
  } catch (err: any) {
    console.error('[create-stripe-account][GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Ett fel uppstod vid statuskontroll' }, { status: 500 });
  }
}
