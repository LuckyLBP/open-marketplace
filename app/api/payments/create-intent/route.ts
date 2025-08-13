import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Varukorgen är tom.' }, { status: 400 });
        }

        let totalAmount = 0;
        const sellerMap: Record<string, {
            amount: number;
            stripeAccountId: string;
        }> = {};

        for (const item of items) {
            const dealSnap = await getDoc(doc(db, 'deals', item.id));
            if (!dealSnap.exists()) continue;

            const deal = dealSnap.data();
            const sellerId = deal.companyId;
            const accountType = item.accountType;

            const sellerRef = doc(db, accountType === 'company' ? 'companies' : 'customers', sellerId);
            const sellerSnap = await getDoc(sellerRef);
            if (!sellerSnap.exists()) continue;

            const { stripeAccountId } = sellerSnap.data();
            if (!stripeAccountId || typeof stripeAccountId !== 'string') continue;

            const price = item.price * (item.quantity ?? 1);
            const fee = Math.round(price * (item.feePercentage ?? 0) / 100);
            const sellerAmount = price - fee;

            totalAmount += price;

            if (!sellerMap[sellerId]) {
                sellerMap[sellerId] = {
                    amount: sellerAmount,
                    stripeAccountId,
                };
            } else {
                sellerMap[sellerId].amount += sellerAmount;
            }
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, //Stripe vill räkna ut i ören
            currency: 'sek',
            payment_method_types: ['card', 'klarna'],
            metadata: {
                integration_check: 'multi_seller',
            },
        });

        await setDoc(doc(db, 'checkoutSessions', paymentIntent.id), {
            createdAt: serverTimestamp(),
            sessionId: paymentIntent.id,
            items,
            totalAmount,
            sellerMap,
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('[create-intent] Error:', error);
        return NextResponse.json({ error: 'Något gick fel.' }, { status: 500 });
    }
}
