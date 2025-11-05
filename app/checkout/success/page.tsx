'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/components/cart/cartProvider';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, Timestamp } from 'firebase/firestore';

type StoredItem = {
  dealId: string;
  quantity: number;
  unitAmountSEK: number;   // pris/st i SEK (heltal)
  grossPerItemSEK: number; // unit * qty
  sellerId?: string;
};
type StoredSession = {
  status: 'requires_payment' | 'succeeded' | 'failed' | string;
  currency: 'sek' | string;
  items: StoredItem[];
  subtotalSEK: number;
  shippingFeeSEK: number;
  totalAmountSEK: number;
  serviceFeeSEK?: number;
  buyerId?: string | null;
  buyerEmail?: string | null;
  receiptUrl?: string | null;
  createdAt?: Timestamp | { seconds: number; nanoseconds: number };
};

type DealInfo = { title?: string; imageUrl?: string; sellerName?: string };

function formatSEK(v?: number) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(v);
}
function toDate(ts?: StoredSession['createdAt']) {
  if (!ts) return null;
  return ts instanceof Timestamp ? ts.toDate() : new Date((ts as any).seconds * 1000);
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartContext();
  const paymentIntentId = searchParams.get('payment_intent') || '';
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [deals, setDeals] = useState<Record<string, DealInfo>>({});

  // 1) Lyssna live på checkoutSessions/<pi>
  useEffect(() => {
    if (!paymentIntentId) {
      setLoading(false);
      return;
    }
    const ref = doc(db, 'checkoutSessions', paymentIntentId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as any as StoredSession;
          setSession(data);
          setLoading(false);
          // rensa kundvagn när betalningen är bekräftad
          if (data.status === 'succeeded') {
            // 1) töm varukorgen
            try { clearCart(); } catch { }

            // 2) rensa gästformulär-data
            try { localStorage.removeItem('guestDetails'); } catch { }

            // 3) (om du cache:ar varukorg i localStorage)
            try { localStorage.removeItem('cart'); } catch { }

            // 4) flagga att vi precis slutfört ett köp (för att kunna resetta nästa sida)
            try { sessionStorage.setItem('checkoutJustSucceeded', '1'); } catch { }
          }


        } else {
          setSession(null);
          setLoading(false);
        }
      },
      (err) => {
        console.error('[success] ❌ onSnapshot error for paymentIntent:', paymentIntentId, err);
        // Try to fetch the session once more before giving up
        (async () => {
          try {
            const fallbackSnap = await getDoc(doc(db, 'checkoutSessions', paymentIntentId));
            if (fallbackSnap.exists()) {
              const data = fallbackSnap.data() as any as StoredSession;
              setSession(data);
              console.log('[success] ✅ Fallback fetch successful');
            }
          } catch (fallbackErr) {
            console.error('[success] ❌ Fallback fetch also failed:', fallbackErr);
          }
          setLoading(false);
        })();
      }
    );
    return () => unsub();
  }, [paymentIntentId, clearCart]);

  // 2) Hämta titel/bild för visning (valfritt – visas om finns)
  useEffect(() => {
    (async () => {
      if (!session?.items?.length) return;
      const missing: string[] = session.items
        .map((i) => i.dealId)
        .filter((id) => id && !deals[id]);

      if (!missing.length) return;

      const newInfo: Record<string, DealInfo> = {};
      for (const id of missing) {
        try {
          const dref = doc(db, 'deals', id);
          const dsnap = await getDoc(dref);
          if (dsnap.exists()) {
            const d = dsnap.data() as any;
            newInfo[id] = {
              title: d.title ?? d.name ?? undefined,
              imageUrl: d.imageUrl ?? d.image ?? (d.images?.[0] ?? undefined),
              sellerName: d.sellerName ?? d.companyName ?? undefined,
            };
          } else {
            newInfo[id] = {};
          }
        } catch (e) {
          console.warn('[success] could not load deal', id, e);
          newInfo[id] = {};
        }
      }
      setDeals((prev) => ({ ...prev, ...newInfo }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(session?.items)]);

  const orderDate = useMemo(() => toDate(session?.createdAt), [session?.createdAt]);

  // Totals enligt vad du sparar i Firestore
  const total = session?.totalAmountSEK ?? session?.subtotalSEK ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-2">Ingen order hittades</h1>
        <Link href="/"><Button>Till startsidan</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-1">Tack för ditt köp!</h1>
        {session.buyerEmail && (
          <p className="text-muted-foreground">Kvitto skickas till {session.buyerEmail}</p>
        )}
        {orderDate && (
          <p className="text-sm text-gray-500 mt-1">{orderDate.toLocaleString('sv-SE')}</p>
        )}
        {session.status !== 'succeeded' && (
          <p className="text-sm text-amber-600 mt-2">Betalningen behandlas…</p>
        )}
      </div>

      {/* Produkter */}
      <div className="bg-white/60 dark:bg-neutral-900/60 rounded-xl border p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Produkter</h2>
        <ul className="divide-y">
          {session.items?.map((it, i) => {
            const d = deals[it.dealId] || {};
            const lineTotal = (it.unitAmountSEK ?? 0) * (it.quantity ?? 0);
            return (
              <li key={i} className="flex items-center gap-4 py-4">
                <div className="h-14 w-14 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  {d.imageUrl ? (
                    <Image src={d.imageUrl} alt={d.title || 'Produktbild'} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-xs text-gray-500">Bild</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{d.title || it.dealId}</div>
                  {d.sellerName && (
                    <div className="text-sm text-gray-500">Säljare: {d.sellerName}</div>
                  )}
                  <div className="text-sm text-gray-500">Antal: {it.quantity}</div>
                </div>
                <div className="text-right font-medium">
                  {formatSEK(lineTotal)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Totalt */}
      <div className="bg-white/60 dark:bg-neutral-900/60 rounded-xl border p-4 md:p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Totalt</h2>
        <p className="text-2xl font-bold">{formatSEK(total)}</p>
        <p className="text-sm text-gray-500 mt-1">
          Varor: {formatSEK(session.subtotalSEK)}{session.shippingFeeSEK ? ` • Frakt: ${formatSEK(session.shippingFeeSEK)}` : ''}
        </p>
      </div>

      {/* Knappar */}
      <div className="flex flex-col items-center gap-3">
        {session.receiptUrl && (
          <Button asChild>
            <a href={session.receiptUrl} target="_blank" rel="noopener noreferrer">
              Visa kvitto
            </a>
          </Button>
        )}
        <Link href="/marketplace">
          <Button variant="outline">Fortsätt handla</Button>
        </Link>
      </div>
    </div>
  );
}
