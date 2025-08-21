import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, writeBatch, increment, serverTimestamp, collection, addDoc, updateDoc,
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
    const pi = event.data.object as Stripe.PaymentIntent;
    const sessionId = pi.id;

    try {
      const sessionRef = doc(db, 'checkoutSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) throw new Error('Session not found in Firestore');
      const s = sessionSnap.data() as any;

      const currency = (pi.currency || s.currency || 'sek').toLowerCase();
      const totalSEK = Number(s.totalAmountSEK ?? s.totalAmount ?? 0);

      // Transfers per säljare
      const rawSellerMap = s.sellerMap || {};
      const sellerIds = Object.keys(rawSellerMap);
      const transferGroup = `pi_${pi.id}`;
      const transferLogs: Array<{
        sellerId: string;
        stripeAccountId: string;
        amountSEK: number;
        transferId: string;
        created: number;
      }> = [];

      console.log(`\n=== Payment Intent Succeeded ===`);
      console.log(`Session ID: ${sessionId}`);
      console.log(`Total Amount (SEK): ${Number.isFinite(totalSEK) ? totalSEK : 'N/A'}`);
      console.log(`Sellers in this order:`, sellerIds);

      for (const sellerId of sellerIds) {
        const entry = rawSellerMap[sellerId] || {};
        const stripeAccountId: string | undefined = entry.stripeAccountId;
        const amountSEK = Number(entry.amountSEK ?? entry.amount ?? 0);
        if (!stripeAccountId || !Number.isFinite(amountSEK) || amountSEK <= 0) {
          console.warn(`Skip transfer for seller ${sellerId}`, entry);
          continue;
        }

        console.log(`→ Sending ${amountSEK} SEK to seller ${sellerId} (${stripeAccountId})`);
        const idempotencyKey = `transfer_${pi.id}_${sellerId}`;
        const transfer = await stripe.transfers.create(
          {
            amount: Math.round(amountSEK * 100), // SEK → öre
            currency,
            destination: stripeAccountId,
            transfer_group: transferGroup,
            metadata: { sessionId, sellerId, payment_intent_id: pi.id },
          },
          { idempotencyKey }
        );

        console.log(`✓ Transfer succeeded: ${transfer.id}`);
        transferLogs.push({
          sellerId, stripeAccountId, amountSEK, transferId: transfer.id, created: Date.now(),
        });
      }

      // Plattformens serviceavgift (brutto) – från sessionen om den finns, annars total - transfers
      const sumTransfersSEK = transferLogs.reduce((a, t) => a + t.amountSEK, 0);
      const serviceFeeSEK = Number(s.serviceFeeSEK ?? Math.max(0, totalSEK - sumTransfersSEK));

      // Hämta Stripe processing fee från BT (i ören) och räkna fram netto för plattformen
      let stripeFeeSEK = 0;
      try {
        const chargeId =
          typeof pi.latest_charge === 'string'
            ? pi.latest_charge
            : (pi.latest_charge as any)?.id;
        if (chargeId) {
          const charge = await stripe.charges.retrieve(chargeId, { expand: ['balance_transaction'] });
          const bt: any = charge.balance_transaction;
          if (bt && typeof bt.fee === 'number') {
            stripeFeeSEK = Math.round(bt.fee) / 100; // öre → SEK
          }
        }
      } catch (e) {
        console.warn('Could not fetch Stripe fee from balance_transaction:', e);
      }
      const netPlatformSEK = Math.max(0, serviceFeeSEK - stripeFeeSEK);

      // Lager-minskning (batch)
      const items: Array<{ id?: string; dealId?: string; quantity?: number }> = Array.isArray(s.items) ? s.items : [];
      const batch = writeBatch(db);

      for (const item of items) {
        const dealId = item.dealId || item.id;
        if (!dealId) continue;
        const qty = Math.max(1, Number(item.quantity || 1));
        const dealRef = doc(db, 'deals', dealId);
        const dealSnap = await getDoc(dealRef);
        if (!dealSnap.exists()) continue;

        const currentStock = Number(dealSnap.data().stockQuantity ?? 0);
        const newStock = currentStock - qty;

        if (newStock > 0) {
          batch.update(dealRef, { stockQuantity: increment(-qty) });
        } else {
          batch.update(dealRef, {
            stockQuantity: 0,
            inStock: false,
            status: 'sold_out',
          });
        }
      }


      // Uppdatera session med allt vi nu vet
      batch.update(sessionRef, {
        status: 'succeeded',
        currency,
        transfers: transferLogs,
        transferGroup,
        paymentIntentId: pi.id,
        serviceFeeSEK,     // din bruttoavgift (enligt duration)
        stripeFeeSEK,      // Stripe processing fee (sek)
        netPlatformSEK,    // din faktiska intäkt = serviceFee - stripeFee
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      console.log(`=== All transfers done | Service fee (SEK): ${serviceFeeSEK} | Stripe fee (SEK): ${stripeFeeSEK} | Net platform (SEK): ${netPlatformSEK} ===\n`);
      return NextResponse.json({ received: true });
    } catch (err) {
      console.error('[webhook] Handler error:', err);
      // svara 200 för att undvika ev. retry-loopar (transfers är idempotenta)
      return NextResponse.json({ received: true });
    }
  }

  // Logga andra events enkelt
  await addDoc(collection(db, 'webhookLogs'), {
    eventType: event.type,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ received: true });
}
