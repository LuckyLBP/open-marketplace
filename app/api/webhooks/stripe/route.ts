import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc
} from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const sig = req.headers.get('stripe-signature');
    const rawBody = await req.text();

    if (!sig || !endpointSecret) {
        console.error('Missing signature or webhook secret');
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const sessionId = paymentIntent.id;

        try {
            const sessionSnap = await getDoc(doc(db, 'checkoutSessions', sessionId));
            if (!sessionSnap.exists()) throw new Error('Session not found in Firestore');

            const sessionData = sessionSnap.data();
            const sellerMap = sessionData.sellerMap || {};

            const transferLogs = [];

            for (const sellerId of Object.keys(sellerMap)) {
                const { amount, stripeAccountId } = sellerMap[sellerId];

                const transfer = await stripe.transfers.create({
                    amount: amount * 100,
                    currency: 'sek',
                    destination: stripeAccountId,
                    description: `Utbetalning för säljare ${sellerId}`,
                    metadata: {
                        sessionId,
                        sellerId,
                    },
                });

                transferLogs.push({
                    sellerId,
                    stripeAccountId,
                    amount,
                    transferId: transfer.id,
                    created: Date.now(),
                });

                console.log(` Transfer to ${stripeAccountId}: ${amount} SEK`);
            }

            await updateDoc(doc(db, 'checkoutSessions', sessionId), {
                transfers: transferLogs,
            });

            return NextResponse.json({ received: true });
        } catch (err) {
            console.error('[webhook] Transfer error:', err);
            return NextResponse.json({ error: 'Transfer error' }, { status: 500 });
        }
    }

    await addDoc(collection(db, 'webhookLogs'), {
        eventType: event.type,
        receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
}
