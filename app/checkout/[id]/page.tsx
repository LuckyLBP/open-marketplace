'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useCartContext } from '@/components/cart/cartProvider';
import { StripeWrapper } from '@/components/stripeWrapper';
import CheckoutForm from '@/components/checkout-form';
import { useLanguage } from '@/components/language-provider';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { cartItems } = useCartContext();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const paymentIntentId = params?.id as string | undefined;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        // 🔹 Fall 1: Direktköp ("Köp nu") → använd paymentIntentId från URL
        if (paymentIntentId) {
          const res = await fetch(`/api/payments/retrieve-intent?id=${paymentIntentId}`);
          const data = await res.json();

          if (res.ok && data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            throw new Error(data?.error || 'Kunde inte hämta betalningen.');
          }

          return;
        }

        // 🔹 Fall 2: Vanligt flöde via varukorg
        if (!cartItems.length) {
          toast({
            title: t('Varukorgen är tom'),
            description: t('Vänligen lägg till produkter innan du går vidare till betalning.'),
            variant: 'destructive',
          });
          router.push('/marketplace');
          return;
        }

        const res = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems }),
        });

        const data = await res.json();

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

    fetchClientSecret();
  }, [cartItems, paymentIntentId, router, t, toast]);

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
