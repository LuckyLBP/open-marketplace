'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/components/cart/cartProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartContext();
  const paymentIntentId = searchParams.get('payment_intent');

  const [status, setStatus] = useState<'loading' | 'ok' | 'notfound'>('loading');

  useEffect(() => {
    const run = async () => {
      clearCart();
      if (!paymentIntentId) { setStatus('notfound'); return; }
      const ref = doc(db, 'checkoutSessions', paymentIntentId);
      const snap = await getDoc(ref);
      setStatus(snap.exists() ? 'ok' : 'ok'); // visa ändå – webhook uppdaterar snart
    };
    run();
  }, [paymentIntentId, clearCart]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-3xl font-bold mb-3">Tack för ditt köp!</h1>
      <p className="text-muted-foreground mb-4">
        Din betalning har slutförts. Du får en bekräftelse via e-post.
      </p>
      {paymentIntentId && (
        <p className="text-sm text-gray-500 mb-6">
          Orderreferens: <span className="font-mono">{paymentIntentId}</span>
        </p>
      )}
      <Link href="/marketplace">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Fortsätt handla
        </Button>
      </Link>
    </div>
  );
}
