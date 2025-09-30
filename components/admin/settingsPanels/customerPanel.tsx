'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/components/firebase-provider';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DealList } from '../dealList';
import { Deal } from '@/components/types/deal';
import ReactivateDeal from '@/components/deals/reactivate-deal';

type StripeStatus = {
  hasStripeAccount: boolean;
  stripeAccountId?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
};

export default function CustomerPanel() {
  const { user, loading } = useFirebase();
  const [tab, setTab] = useState<'active' | 'expired'>('active');

  const [userInfo, setUserInfo] = useState<any>(null);
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [expiredDeals, setExpiredDeals] = useState<Deal[]>([]);
  const [fetching, setFetching] = useState(false);

  // Stripe UI-state
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [connecting, setConnecting] = useState(false);

  const ACCOUNT_TYPE: 'customer' = 'customer';

  // Hämta kundprofil
  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'customers', user.uid));
      setUserInfo(snap.exists() ? snap.data() : null);
    })();
  }, [user]);

  // Hämta deals där kunden är säljare (stöd både customerId och ev. legacy companyId)
  useEffect(() => {
    if (!user) return;
    (async () => {
      setFetching(true);
      const [byCustomer, byCompany] = await Promise.all([
        getDocs(query(collection(db, 'deals'), where('customerId', '==', user.uid))),
        getDocs(query(collection(db, 'deals'), where('companyId', '==', user.uid))),
      ]);

      const mapDoc = (docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title ?? 'Okänt erbjudande',
          companyId: data.companyId ?? data.customerId ?? 'okänt',
          companyName: data.companyName ?? data.customerName ?? 'okänt',
          expiresAt: data.expiresAt?.toDate?.() ?? new Date(0),
          ...data,
        } as Deal;
      };

      // slå ihop och deduplikera på id
      const merged: Record<string, Deal> = {};
      byCustomer.docs.forEach((d) => (merged[d.id] = mapDoc(d)));
      byCompany.docs.forEach((d) => (merged[d.id] = mapDoc(d)));
      const allDeals = Object.values(merged);

      const now = new Date();
      setActiveDeals(allDeals.filter((deal) => (deal as any).expiresAt > now));
      setExpiredDeals(allDeals.filter((deal) => (deal as any).expiresAt <= now));
      setFetching(false);
    })();
  }, [user]);

  // Hämta Stripe-status
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

  // Starta onboarding
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

  if (loading || !user) {
    return <p>Laddar...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Min profil</h2>

      <div className="p-4 rounded-lg bg-white border shadow-sm">
        {userInfo ? (
          <>
            <p>
              <strong>Namn:</strong> {userInfo.name || 'Ej angivet'}
            </p>
            <p>
              <strong>Email:</strong> {userInfo.email || user.email}
            </p>

            {/* Stripe-sektion */}
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
          <p className="text-muted-foreground">Ingen användarinformation hittades.</p>
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
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Utgångna erbjudanden</h3>
          {expiredDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga utgångna erbjudanden.</p>
          ) : (
            <ul className="divide-y">
              {expiredDeals.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{d.title}</div>
                  </div>
                  <ReactivateDeal
                    deal={d}
                    onDone={(u) => {
                      // Ta bort från utgångna direkt
                      setExpiredDeals((prev) => prev.filter((x) => x.id !== d.id));
                      setActiveDeals((prev) => [
                        {
                          ...d,
                          expiresAt: u.expiresAt ?? (d as any).expiresAt,
                          feePercentage: u.feePercentage ?? (d as any).feePercentage,
                        } as any,
                        ...prev.filter((x) => x.id !== d.id),
                      ]);

                      // Valfritt: hoppa till Aktiva så användaren ser posten direkt
                      setTab('active');
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
