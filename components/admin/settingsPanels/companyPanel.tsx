'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/components/firebase-provider';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DealList } from '../dealList';
import type { Deal } from '@/components/types/deal';

// --- Stripe status-typ (samma mönster som i CustomerPanel)
type StripeStatus = {
  hasStripeAccount: boolean;
  stripeAccountId?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
};

export default function CompanyPanel() {
  const { user, loading } = useFirebase();
  const [tab, setTab] = useState<'active' | 'expired'>('active');

  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [expiredDeals, setExpiredDeals] = useState<Deal[]>([]);
  const [fetching, setFetching] = useState(false);

  // --- Stripe UI-state
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [connecting, setConnecting] = useState(false);

  const ACCOUNT_TYPE: 'company' = 'company';

  // Företagsprofil
  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'companies', user.uid));
      setCompanyInfo(snap.exists() ? snap.data() : null);
    })();
  }, [user]);

  // Hämta approved (egna) och dela upp på expiresAt
  useEffect(() => {
    if (!user) return;
    (async () => {
      setFetching(true);

      const snap = await getDocs(
        query(
          collection(db, 'deals'),
          where('companyId', '==', user.uid),
          where('status', '==', 'approved')
        )
      );

      const toDeal = (d: any, id: string): Deal => {
        const toDate = (ts: any) =>
          ts?.toDate?.() ? ts.toDate() : (ts instanceof Date ? ts : new Date(0));
        return {
          id,
          title: d.title ?? 'Okänt erbjudande',
          description: d.description ?? '',
          price: typeof d.price === 'number' ? d.price : 0,
          originalPrice: typeof d.originalPrice === 'number' ? d.originalPrice : null,
          duration: typeof d.duration === 'number' ? d.duration : 24,
          images: Array.isArray(d.images) ? d.images : [],
          imageUrl: d.imageUrl ?? undefined,
          companyId: d.companyId ?? '',
          companyName: d.companyName ?? '',
          category: d.category ?? '',
          subcategory: d.subcategory ?? undefined,
          feePercentage: typeof d.feePercentage === 'number' ? d.feePercentage : 0,
          createdAt: toDate(d.createdAt),
          expiresAt: toDate(d.expiresAt),
          boostStart: d.boostStart ? toDate(d.boostStart) : undefined,
          boostEnd: d.boostEnd ? toDate(d.boostEnd) : undefined,
          boostType: d.boostType ?? undefined,
          specifications: Array.isArray(d.specifications) ? d.specifications : undefined,
          features: Array.isArray(d.features) ? d.features : undefined,
          inStock: typeof d.inStock === 'boolean' ? d.inStock : undefined,
          stockQuantity: typeof d.stockQuantity === 'number' ? d.stockQuantity : undefined,
          sku: d.sku ?? undefined,
          stripeAccountId: d.stripeAccountId ?? undefined,
          accountType: d.accountType === 'customer' ? 'customer' : 'company',
          role: d.role ?? undefined,
        };
      };

      const all: Deal[] = snap.docs.map((docSnap) => toDeal(docSnap.data(), docSnap.id));
      const now = new Date();
      setActiveDeals(all.filter((deal) => (deal as any).expiresAt > now));
      setExpiredDeals(all.filter((deal) => (deal as any).expiresAt <= now));
      setFetching(false);
    })();
  }, [user]);

  // --- Hämta Stripe-status för företaget
  const refreshStripeStatus = useCallback(async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams({
        sellerId: user.uid,
        accountType: ACCOUNT_TYPE,
      });
      const res = await fetch(`/api/create-stripe-account?${params.toString()}`, { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        setStripeStatus({
          hasStripeAccount: !!data.hasStripeAccount,
          stripeAccountId: data.stripeAccountId,
          charges_enabled: data.charges_enabled,
          payouts_enabled: data.payouts_enabled,
        });
      } else {
        setStripeStatus(null);
        console.warn('Stripe status error:', data?.error);
      }
    } catch (err) {
      console.error('Stripe status fetch failed:', err);
      setStripeStatus(null);
    }
  }, [user]);

  useEffect(() => {
    refreshStripeStatus();
  }, [refreshStripeStatus]);

  // --- Starta / fortsätt onboarding
  const startOnboarding = async () => {
    if (!user) return;
    try {
      setConnecting(true);
      const res = await fetch('/api/create-stripe-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user.uid,
          accountType: ACCOUNT_TYPE,
        }),
      });
      const data = await res.json();
      if (res.ok && data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        alert(data.error || 'Kunde inte starta Stripe-onboarding.');
      }
    } catch (err) {
      console.error(err);
      alert('Kunde inte ansluta till Stripe.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading || !user) return <p>Laddar...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Företagsprofil</h2>

      <div className="p-4 rounded-lg bg-white border shadow-sm">
        {companyInfo ? (
          <>
            <p><strong>Företagsnamn:</strong> {companyInfo.name || 'Ej angivet'}</p>
            <p><strong>Email:</strong> {companyInfo.email || user.email}</p>
            {companyInfo.orgNr && <p><strong>OrgNr:</strong> {companyInfo.orgNr}</p>}

            {/* --- Stripe-sektion för företag --- */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Stripe</h3>

              {stripeStatus?.hasStripeAccount ? (
                <>
                  {stripeStatus?.charges_enabled ? (
                    <p className="text-green-600 font-medium">
                      Stripe-konto anslutet och aktiverat ✅
                    </p>
                  ) : (
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                      <p className="text-yellow-700 text-sm mb-2">
                        Stripe-konto finns men är inte färdigaktiverat (charges_enabled: false).
                      </p>
                      <button
                        onClick={startOnboarding}
                        disabled={connecting}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {connecting ? 'Öppnar...' : 'Slutför Stripe-onboarding'}
                      </button>
                    </div>
                  )}
                  {stripeStatus?.payouts_enabled === false && (
                    <p className="text-sm text-yellow-700 mt-2">
                      Obs: payouts är inte aktiverade ännu.
                    </p>
                  )}
                  <button onClick={refreshStripeStatus} className="mt-2 text-sm underline">
                    Uppdatera Stripe-status
                  </button>
                </>
              ) : (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                  <p className="text-yellow-700 text-sm mb-2">
                    För att kunna ta emot betalningar behöver du koppla ett Stripe-konto.
                  </p>
                  <button
                    onClick={startOnboarding}
                    disabled={connecting}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {connecting ? 'Öppnar...' : 'Anslut Stripe-konto'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Ingen företagsinformation hittades.</p>
        )}
      </div>

      <div className="flex gap-4 border-b pt-4">
        <button
          onClick={() => setTab('active')}
          className={tab === 'active' ? 'border-b-2 font-semibold pb-2' : 'pb-2'}
        >
          Aktiva
        </button>
        <button
          onClick={() => setTab('expired')}
          className={tab === 'expired' ? 'border-b-2 font-semibold pb-2' : 'pb-2'}
        >
          Utgångna
        </button>
      </div>

      {tab === 'active' && (
        <DealList title="Aktiva erbjudanden" deals={activeDeals} loading={fetching} />
      )}
      {tab === 'expired' && (
        <DealList title="Utgångna erbjudanden" deals={expiredDeals} loading={fetching} />
      )}
    </div>
  );
}
