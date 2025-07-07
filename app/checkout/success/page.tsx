'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartContext } from '@/components/cart/cartProvider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCartContext();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processOrder = async () => {
      if (!sessionId) return;

      clearCart();

      try {
        const sessionRef = doc(db, 'checkoutSessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
          console.warn('Kunde inte hitta session i Firestore');
          return;
        }

        const { items } = sessionSnap.data();


        if (!items || !Array.isArray(items)) {
          console.warn('Session saknar giltiga produkter');
          return;
        }

        await fetch('/api/verify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });

        toast({
          title: 'Tack för ditt köp!',
          description: 'Din beställning är bekräftad. Kvitto skickas via e-post.',
        });
      } catch (error) {
        console.error('Fel vid orderverifiering:', error);
      }
    };

    processOrder();
  }, [clearCart, toast, sessionId]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-3xl font-bold mb-4">Tack för ditt köp!</h1>
      <p className="text-muted-foreground mb-6">
        Din betalning har slutförts. Du kommer få en bekräftelse via e-post.
      </p>

      <p className="text-sm text-gray-500 mb-6">
        Orderreferens: <span className="font-mono">{sessionId}</span>
      </p>

      <Link href="/marketplace">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Fortsätt handla
        </Button>
      </Link>
    </div>
  );
}
