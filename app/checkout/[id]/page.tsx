'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useCartContext } from '@/components/cart/cartProvider';
import { StripeWrapper } from '@/components/stripeWrapper';
import CheckoutForm from '@/components/checkout-form';
import { useLanguage } from '@/components/language-provider';
import { useFirebase } from '@/components/firebase-provider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// 👇 Tillåt null i signaturen (Firebase kan ge null för email)
async function getBuyerEmail(
  uid?: string | null,
  authEmail?: string | null
): Promise<string> {
  if (authEmail) return authEmail;
  if (!uid) return '';
  try {
    const snap = await getDoc(doc(db, 'customers', uid));
    return (snap.exists() && (snap.data() as any).email) || '';
  } catch {
    return '';
  }
}

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { cartItems } = useCartContext();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const paymentIntentId = params?.id as string | undefined;

  const { user } = useFirebase(); // för buyer
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  const ensureReceiptEmailOnExistingPI = useCallback(
    async (piId: string) => {
      const emailToUse = await getBuyerEmail(user?.uid, user?.email);
      if (!emailToUse) return;
      try {
        await fetch('/api/payments/set-receipt-email', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ pi: piId, email: emailToUse }),
        });
      } catch (e) {
        console.warn('Could not set receipt_email for existing PI:', e);
      }
    },
    [user?.uid, user?.email]
  );

  useEffect(() => {
    const run = async () => {
      try {
        // 🔹 Fall 1: Direktköp ("Köp nu") → hämta befintligt PI via id i URL
        if (paymentIntentId) {
          const res = await fetch(`/api/payments/retrieve-intent?id=${paymentIntentId}`);
          const data = await res.json();

          if (res.ok && data.clientSecret) {
            setClientSecret(data.clientSecret);
            // Säkerställ kvitto-mail på befintligt PI (med fallback från Firestore)
            await ensureReceiptEmailOnExistingPI(paymentIntentId);
          } else {
            throw new Error(data?.error || 'Kunde inte hämta betalningen.');
          }
          return;
        }

        // 🔹 Fall 2: Vanligt flöde via varukorg → skapa nytt PI
        if (!cartItems.length) {
          toast({
            title: t('Varukorgen är tom'),
            description: t('Vänligen lägg till produkter innan du går vidare till betalning.'),
            variant: 'destructive',
          });
          router.push('/marketplace');
          return;
        }

        const emailToUse = await getBuyerEmail(user?.uid, user?.email);

        const res2 = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            // skickar buyer så Stripe kan mejla kvitto + för orderhistorik
            buyer: user ? { id: user.uid, email: user.email } : undefined,
          }),
        });
        console.log('[checkout/[id]] sending buyer =', user?.uid, user?.email); // 👈 lägg till här


        const data2 = await res2.json();
        console.log('[checkout/[id]] response =', data2); // 👈 lägg till här


        if (res2.ok && data2.clientSecret) {
          setClientSecret(data2.clientSecret);
        } else {
          throw new Error(data2?.error || 'Något gick fel vid betalning.');
        }
      } catch (error) {
        console.error('checkout error:', error);
        toast({
          title: t('Fel'),
          description: t('Kunde inte initiera betalningen.'),
          variant: 'destructive',
        });
        router.push('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    run();
    // kör igen om auth-email eller uid laddas in efterhand
  }, [cartItems, paymentIntentId, router, t, toast, ensureReceiptEmailOnExistingPI]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full"></div>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t('Slutför betalning')}</h2>
        <StripeWrapper clientSecret={clientSecret}>
          <CheckoutForm />
        </StripeWrapper>
      </div>
    </div>
  );
}
