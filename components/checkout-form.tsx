'use client';

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements || loading) return;

        setLoading(true);

        // För kort → undvik full redirect ("if_required").
        // För metoder som kräver redirect (t.ex. Klarna) gör Stripe redirect till return_url.
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
            confirmParams: {
                // fallback för metoder som kräver redirect
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        setLoading(false);

        if (error) {
            toast({
                title: 'Betalning misslyckades',
                description: error.message ?? 'Försök igen.',
                variant: 'destructive',
            });
            return;
        }

        // Om ingen redirect krävdes och vi fick PI direkt:
        if (paymentIntent?.status === 'succeeded') {
            router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
            return;
        }

        // Annars: för t.ex. Klarna kommer Stripe ha redirectat till return_url
        // med query ?payment_intent=... — din success-sida hanterar det redan.
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <Button type="submit" disabled={!stripe || !elements || loading} className="w-full">
                {loading ? 'Bearbetar...' : 'Betala nu'}
            </Button>
        </form>
    );
}
