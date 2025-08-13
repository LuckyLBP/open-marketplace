'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeWrapper({ children, clientSecret }: { children: React.ReactNode, clientSecret: string }) {
    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as 'stripe',
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            {children}
        </Elements>
    );
}
