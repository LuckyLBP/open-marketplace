'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function CheckoutIntentPage() {
  const { t } = useLanguage();
  const { cartItems } = useCartContext();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useFirebase(); // ← för buyer

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        // Alltid skapa nytt PI i detta flöde (varukorg)
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
        if (!emailToUse) {
          toast({
            title: t('Saknar e-post'),
            description: t('Vi kunde inte hitta din e-post. Komplettera din profil och försök igen.'),
            variant: 'destructive',
          });
          router.push('/dashboard/settings');
          return;
        }

        const res = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            buyer: user ? { id: user.uid, email: user.email } : undefined,
          }),
        });
        
        console.log('[checkout/intent] sending buyer =', user?.uid, user?.email); // 👈 lägg till här

        const data = await res.json();
        console.log('[checkout/intent] response =', data); // 👈 lägg till här


        if (res.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error(data?.error || 'Något gick fel vid betalning.');
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
  }, [cartItems, router, t, toast, user?.uid, user?.email]);

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
