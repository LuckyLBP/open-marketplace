// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  writeBatch,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';

export const runtime = 'nodejs'; // Stripe SDK kräver Node runtime
export const dynamic = 'force-dynamic'; // undvik cache i Vercel

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function json(status: number, data: any) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  if (!sig || !endpointSecret) {
    console.error('Missing signature or webhook secret');
    return json(400, { error: 'Missing signature' });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    return json(400, { error: 'Invalid signature' });
  }

  try {
    // --- Idempotens: kör inte samma event två gånger ---
    const processedRef = doc(collection(db, 'stripeWebhookEvents'), event.id);
    const processedSnap = await getDoc(processedRef);
    if (processedSnap.exists()) {
      return json(200, { received: true, duplicate: true });
    }

    // === FAILED ===
    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const sessionId = pi.id;

      try {
        await updateDoc(doc(db, 'checkoutSessions', sessionId), {
          status: 'failed',
          updatedAt: serverTimestamp(),
          failureCode: (pi.last_payment_error as any)?.code ?? null,
          failureMessage: (pi.last_payment_error as any)?.message ?? null,
        });
      } catch (e) {
        console.warn('Could not mark session as failed:', e);
      }

      await setDoc(processedRef, { processedAt: new Date(), type: event.type });
      return json(200, { received: true });
    }

    // === SUCCEEDED ===
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const sessionId = pi.id; // du använder PI-id som session-id i Firestore

      try {
        const sessionRef = doc(db, 'checkoutSessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (!sessionSnap.exists())
          throw new Error('Session not found in Firestore');
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
        console.log(
          `Total Amount (SEK): ${Number.isFinite(totalSEK) ? totalSEK : 'N/A'}`
        );
        console.log(`Sellers in this order:`, sellerIds);

        for (const sellerId of sellerIds) {
          const entry = rawSellerMap[sellerId] || {};
          const stripeAccountId: string | undefined = entry.stripeAccountId;
          const amountSEK = Number(entry.amountSEK ?? entry.amount ?? 0);
          if (
            !stripeAccountId ||
            !Number.isFinite(amountSEK) ||
            amountSEK <= 0
          ) {
            console.warn(`Skip transfer for seller ${sellerId}`, entry);
            continue;
          }

          console.log(
            `→ Sending ${amountSEK} SEK to seller ${sellerId} (${stripeAccountId})`
          );
          const idempotencyKey = `transfer_${pi.id}_${sellerId}`;
          const stripe = getStripe();
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
            sellerId,
            stripeAccountId,
            amountSEK,
            transferId: transfer.id,
            created: Date.now(),
          });
        }

        // Plattformens serviceavgift (brutto)
        const sumTransfersSEK = transferLogs.reduce(
          (a, t) => a + t.amountSEK,
          0
        );
        const serviceFeeSEK = Number(
          s.serviceFeeSEK ?? Math.max(0, totalSEK - sumTransfersSEK)
        );

        // Stripe processing fee (SEK)
        let stripeFeeSEK = 0;
        try {
          const chargeId =
            typeof pi.latest_charge === 'string'
              ? pi.latest_charge
              : (pi.latest_charge as any)?.id;
          if (chargeId) {
            const stripe = getStripe();
            const charge = await stripe.charges.retrieve(chargeId, {
              expand: ['balance_transaction'],
            });
            const bt: any = charge.balance_transaction;
            if (bt && typeof bt.fee === 'number') {
              stripeFeeSEK = Math.round(bt.fee) / 100; // öre → SEK
            }
          }
        } catch (e) {
          console.warn(
            'Could not fetch Stripe fee from balance_transaction:',
            e
          );
        }
        const netPlatformSEK = Math.max(0, serviceFeeSEK - stripeFeeSEK);

        // Lager-minskning (batch)
        const items: Array<{
          id?: string;
          dealId?: string;
          quantity?: number;
        }> = Array.isArray(s.items) ? s.items : [];
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

        // Uppdatera session
        batch.update(sessionRef, {
          status: 'succeeded',
          currency,
          transfers: transferLogs,
          transferGroup,
          paymentIntentId: pi.id,
          serviceFeeSEK, // bruttoavgift (enligt duration)
          stripeFeeSEK, // Stripe processing fee (SEK)
          netPlatformSEK, // faktisk intäkt = serviceFee - stripeFee
          updatedAt: serverTimestamp(),
        });

        // Markera event som processat
        await setDoc(processedRef, {
          processedAt: new Date(),
          type: event.type,
        });

        await batch.commit();

        console.log(
          `=== All transfers done | Service fee (SEK): ${serviceFeeSEK} | Stripe fee (SEK): ${stripeFeeSEK} | Net platform (SEK): ${netPlatformSEK} ===\n`
        );
        return json(200, { received: true });
      } catch (err: any) {
        console.error('[webhook] Handler error:', err);
        // svara 200 för att undvika ev. retry-loopar (transfers är idempotenta)
        await setDoc(processedRef, {
          processedAt: new Date(),
          type: event.type,
          error: String(err?.message ?? err),
        });
        return json(200, { received: true });
      }
    }

    // Övriga events: lätt loggning
    await addDoc(collection(db, 'webhookLogs'), {
      eventType: event.type,
      receivedAt: new Date().toISOString(),
    });

    await setDoc(doc(collection(db, 'stripeWebhookEvents'), event.id), {
      processedAt: new Date(),
      type: event.type,
    });

    return json(200, { received: true });
  } catch (outerErr: any) {
    console.error('[webhook] Outer error:', outerErr);
    return json(500, { error: outerErr?.message ?? 'Unhandled webhook error' });
  }
}
