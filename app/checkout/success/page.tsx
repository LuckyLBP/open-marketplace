'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/components/cart/cartProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

type CheckoutItem = {
  dealId: string;
  title: string;
  price: number;     // SEK (major units)
  quantity: number;
  imageUrl?: string;
  sellerName?: string;
};

type CheckoutSession = {
  id: string;        // == payment_intent id
  status: string;
  buyer?: { email?: string };
  items: CheckoutItem[];
  totalAmount: number;
  receiptUrl?: string;
  createdAt?: Timestamp | { seconds: number; nanoseconds: number };
};

function formatSEK(v?: number) {
  if (typeof v !== 'number') return '—';
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(v);
}

function toDate(ts?: CheckoutSession['createdAt']) {
  if (!ts) return null;
  return ts instanceof Timestamp ? ts.toDate() : new Date((ts as any).seconds * 1000);
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartContext();

  const paymentIntentId = searchParams.get('payment_intent') || '';

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CheckoutSession | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      clearCart();
      if (!paymentIntentId) { setLoading(false); return; }

      try {
        const ref = doc(db, 'checkoutSessions', paymentIntentId);
        const snap = await getDoc(ref);
        if (snap.exists() && mounted) {
          setSession({ id: snap.id, ...(snap.data() as any) } as CheckoutSession);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [paymentIntentId, clearCart]);

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

  const orderDate = toDate(session.createdAt);

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Tack för ditt köp!</h1>
        {session.buyer?.email && (
          <p className="text-muted-foreground">Kvitto skickas till {session.buyer.email}</p>
        )}
        {orderDate && (
          <p className="text-sm text-gray-500 mt-1">{orderDate.toLocaleString('sv-SE')}</p>
        )}
      </div>

      {/* Produkter */}
      <div className="bg-white/60 dark:bg-neutral-900/60 rounded-xl border p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Produkter</h2>
        <ul className="divide-y">
          {session.items?.map((it, i) => (
            <li key={i} className="flex items-center gap-4 py-4">
              <div className="h-14 w-14 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={it.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-xs text-gray-500">Bild</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{it.title}</div>
                {it.sellerName && (
                  <div className="text-sm text-gray-500">Säljare: {it.sellerName}</div>
                )}
                <div className="text-sm text-gray-500">Antal: {it.quantity}</div>
              </div>
              <div className="text-right font-medium">
                {formatSEK(it.price * it.quantity)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Totalt */}
      <div className="bg-white/60 dark:bg-neutral-900/60 rounded-xl border p-4 md:p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Totalt</h2>
        <p className="text-2xl font-bold">{formatSEK(session.totalAmount)}</p>
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
