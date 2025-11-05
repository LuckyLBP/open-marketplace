import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Stripe init ---
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
  });
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function json(status: number, data: any) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// Proportionell allokering i öre med rundningskorrigering
function proportionalSplit(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (total * w) / sum);
  const floored = raw.map(Math.floor);
  let remainder = total - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floored];
  for (let k = 0; k < order.length && remainder > 0; k++) {
    out[order[k].i] += 1;
    remainder--;
  }
  return out;
}

// GET: hälsokoll
export async function GET(req: Request) {
  const host = req.headers.get('host') || null;
  const present = !!process.env.STRIPE_WEBHOOK_SECRET;
  const len = process.env.STRIPE_WEBHOOK_SECRET?.length || 0;
  return json(200, {
    ok: true,
    path: '/api/webhooks/stripe',
    method: 'POST only',
    host,
    secretPresent: present,
    secretLen: len,
    runtime: 'nodejs',
  });
}

export async function POST(req: Request) {
  console.log('🎣 [webhook] Received Stripe webhook request');
  
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  if (!sig || !endpointSecret) {
    console.error('❌ [webhook] Missing signature or webhook secret');
    return json(400, { error: 'Missing signature' });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log(`✅ [webhook] Event verified: ${event.type} (${event.id})`);
  } catch (err: any) {
    console.error('❌ [webhook] Signature verification failed:', err.message);
    return json(400, { error: 'Invalid signature' });
  }

  try {
    // Use Admin SDK (bypasses Firestore rules)
    const db = adminDb;
    if (!db) {
      console.error('Admin Firestore not available in webhook');
      return json(500, { error: 'Database connection failed' });
    }

    // Idempotens: processa inte samma event två gånger
    const processedRef = db.collection('stripeWebhookEvents').doc(event.id);
    const processedSnap = await processedRef.get();
    if (processedSnap.exists) {
      return json(200, { received: true, duplicate: true });
    }

    // === Payment failed ===
    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const sessionId = pi.id;
      try {
        await db.collection('checkoutSessions').doc(sessionId).update({
          status: 'failed',
          updatedAt: FieldValue.serverTimestamp(),
          failureCode: (pi.last_payment_error as any)?.code ?? null,
          failureMessage: (pi.last_payment_error as any)?.message ?? null,
        });
      } catch (e) {
        console.warn('Could not mark session as failed:', e);
      }
      await processedRef.set({ processedAt: new Date(), type: event.type });
      return json(200, { received: true });
    }

    // === Payment succeeded ===
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const sessionId = pi.id;

      console.log(`💰 [webhook] Processing payment success for ${sessionId}`);

      try {
        const sessionRef = db.collection('checkoutSessions').doc(sessionId);
        const sessionSnap = await sessionRef.get();
        
        if (!sessionSnap.exists) {
          console.error(`❌ [webhook] Session ${sessionId} not found in Firestore`);
          throw new Error('Session not found in Firestore');
        }
        
        const s = sessionSnap.data() as any;
        console.log(`📊 [webhook] Session found: ${s.items?.length || 0} items, status: ${s.status}`);

        const items = (s.items ?? []) as Array<{
          dealId: string;
          sellerId: string;
          sellerStripeAccountId: string;
          quantity: number;
          unitAmountSEK: number;
          grossPerItemSEK: number;
          feePct: number;
          platformFeePerItemSEK: number;
        }>;

        const currency = (pi.currency || s.currency || 'sek').toLowerCase();
        const subtotalSEK = Number(s.subtotalSEK || 0);
        const shippingFeeSEK = Number(s.shippingFeeSEK || 0);
        const platformServiceFeeSEK = Number(s.serviceFeeSEK || 0);

        // 1) Hämta charge + balance transaction (+ kvitto-email)
        const chargeId =
          typeof pi.latest_charge === 'string'
            ? pi.latest_charge
            : (pi.latest_charge as any)?.id;
        if (!chargeId) throw new Error('Missing charge on PI');

        const stripe = getStripe();

        // expand balance_transaction för att kunna allokera stripe-fee
        let charge = await stripe.charges.retrieve(chargeId, { expand: ['balance_transaction'] });

        // Email att skicka kvitto till – prioritet: Firestore → PI.receipt_email → metadata
        const sBuyerEmail: string =
          (s.buyerEmail as string) ||
          ((pi as any).receipt_email as string) ||
          ((pi.metadata && (pi.metadata as any).buyer_email) as string) ||
          '';

        // Om Stripe inte redan har receipt_email, sätt den nu (best effort)
        if (!charge.receipt_email && sBuyerEmail) {
          try {
            charge = await stripe.charges.update(chargeId, { receipt_email: sBuyerEmail });
          } catch (e) {
            console.warn('Could not set receipt_email on charge:', e);
          }
        }

        // Kvitto-länk
        const receiptUrl: string | null = (charge as any)?.receipt_url || null;

        // Stripe fee i öre (från balance transaction)
        let stripeFeeOreTotal = 0;
        const btExpanded = (charge as any).balance_transaction;
        if (btExpanded && typeof btExpanded === 'object' && typeof btExpanded.fee === 'number') {
          stripeFeeOreTotal = btExpanded.fee;
        } else {
          try {
            const btId =
              typeof btExpanded === 'string'
                ? btExpanded
                : (btExpanded?.id as string | undefined);
            if (btId) {
              const bt = await stripe.balanceTransactions.retrieve(btId);
              if (bt && typeof (bt as any).fee === 'number') {
                stripeFeeOreTotal = (bt as any).fee;
              } else {
                console.warn('Balance transaction retrieved but fee missing, assuming 0.');
              }
            } else {
              console.warn('No balance_transaction id on charge, assuming fee 0.');
            }
          } catch (e) {
            console.warn('Could not retrieve balance_transaction, assuming fee 0.', e);
          }
        }

        // 2) Dela upp Stripe-fee mellan subtotal och shipping
        const subtotalOre = Math.max(0, Math.round(subtotalSEK * 100));
        const shippingOre = Math.max(0, Math.round(shippingFeeSEK * 100));
        const totalOre = subtotalOre + shippingOre || 1;

        const stripeFeeOreOnSubtotal = Math.round((subtotalOre / totalOre) * stripeFeeOreTotal);
        const stripeFeeOreOnShipping = Math.max(0, stripeFeeOreTotal - stripeFeeOreOnSubtotal);

        // Vikt per rad = bruttobelopp i öre
        const grossWeightsOre = items.map((i) =>
          Math.max(0, Math.round(Number(i.grossPerItemSEK || 0) * 100))
        );

        // Proportionerlig fördelning av subtotalens stripe-fee
        const stripeFeeAllocPerItemOre = proportionalSplit(
          stripeFeeOreOnSubtotal,
          grossWeightsOre
        );

        // 3) Payout per säljare
        type SellerAgg = Record<string, { account: string; amountOre: number }>;
        const bySeller: SellerAgg = {};

        items.forEach((it, idx) => {
          const grossOre = Math.max(0, Math.round(Number(it.grossPerItemSEK) * 100));
          const platformFeeOre = Math.max(
            0,
            Math.round(Number(it.platformFeePerItemSEK) * 100)
          );
          const stripeFeeOre = Math.max(0, stripeFeeAllocPerItemOre[idx] || 0);
          const payoutOre = Math.max(0, grossOre - platformFeeOre - stripeFeeOre);

          if (!bySeller[it.sellerId]) {
            bySeller[it.sellerId] = { account: it.sellerStripeAccountId, amountOre: 0 };
          }
          bySeller[it.sellerId].amountOre += payoutOre;
        });

        // 4) Transfers
        const transferGroup = (pi as any).transfer_group || pi.id;
        const existingTransfers = Array.isArray(s.transfers) ? s.transfers : [];
        const transferLogs: Array<{
          sellerId: string;
          stripeAccountId: string;
          amountSEK: number;
          transferId: string;
          created: number;
        }> = [];

        console.log(`[webhook] 💸 Creating transfers for ${Object.keys(bySeller).length} sellers`);
        
        for (const [sellerId, agg] of Object.entries(bySeller)) {
          const amount = Math.max(0, Math.round(agg.amountOre)); // öre
          const amountSEK = Math.round(amount / 100);
          
          if (!agg.account || amount <= 0) {
            console.warn(`[transfers.create] ❌ Skip seller ${sellerId}: invalid account (${agg.account}) or amount (${amountSEK} SEK)`);
            transferLogs.push({
              sellerId,
              stripeAccountId: agg.account || 'MISSING',
              amountSEK,
              transferId: 'SKIPPED:INVALID_DATA',
              created: Date.now(),
            });
            continue;
          }

          console.log(`[transfers.create] 💰 Attempting transfer: ${amountSEK} SEK to ${sellerId} (${agg.account.substring(0, 10)}...)`);

          try {
            const tr = await stripe.transfers.create(
              {
                amount,
                currency,
                destination: agg.account,
                transfer_group: transferGroup,
                metadata: { sessionId, sellerId, payment_intent_id: pi.id },
              },
              { idempotencyKey: `transfer_${pi.id}_${sellerId}` }
            );

            console.log(`[transfers.create] ✅ SUCCESS: Transfer ${tr.id} created for seller ${sellerId}`);
            transferLogs.push({
              sellerId,
              stripeAccountId: agg.account,
              amountSEK,
              transferId: tr.id,
              created: Date.now(),
            });
          } catch (err: any) {
            const code = err?.code || err?.type || 'unknown';
            const msg = err?.message || String(err);
            console.error(`[transfers.create] ❌ FAILED: Transfer to ${sellerId} failed:`, { 
              code, 
              message: msg,
              account: agg.account,
              amount: `${amountSEK} SEK`
            });
            
            transferLogs.push({
              sellerId,
              stripeAccountId: agg.account,
              amountSEK,
              transferId: `ERROR:${code}`,
              created: Date.now(),
            });
          }
        }
        
        const successfulTransfers = transferLogs.filter(t => !t.transferId.startsWith('ERROR:') && !t.transferId.startsWith('SKIPPED:'));
        console.log(`[webhook] 📊 Transfer summary: ${successfulTransfers.length}/${transferLogs.length} successful`);

        // 5) Plattformens rapportering
        const stripeFeeSubtotalSEK = Math.round(stripeFeeOreOnSubtotal / 100);
        const stripeFeeShippingSEK = Math.round(stripeFeeOreOnShipping / 100);
        const totalStripeFeeSEK = stripeFeeSubtotalSEK + stripeFeeShippingSEK;
        const netPlatformSEK = Math.max(0, platformServiceFeeSEK - stripeFeeShippingSEK);

        // 6) Lager-minskning med förbättrad felhantering
        const batch = db.batch();
        const stockUpdates: { dealId: string; currentStock: number; qty: number; success: boolean }[] = [];
        
        for (const it of items) {
          const dealId = it.dealId;
          const qty = Math.max(1, Number(it.quantity || 1));
          if (!dealId || qty <= 0) {
            console.warn(`[webhook] Invalid item for stock update:`, { dealId, qty });
            continue;
          }

          try {
            const dealRef = db.collection('deals').doc(dealId);
            const dealSnap = await dealRef.get();
            
            if (!dealSnap.exists) {
              console.error(`[webhook] ❌ Deal ${dealId} not found for stock update`);
              stockUpdates.push({ dealId, currentStock: 0, qty, success: false });
              continue;
            }

            const currentStock = Number(dealSnap.data()?.stockQuantity ?? 0);
            const newStock = currentStock - qty;
            
            console.log(`[webhook] 📦 Stock update for ${dealId}: ${currentStock} → ${newStock} (sold: ${qty})`);

            if (newStock > 0) {
              batch.update(dealRef, { 
                stockQuantity: FieldValue.increment(-qty),
                lastSoldAt: FieldValue.serverTimestamp()
              });
            } else {
              batch.update(dealRef, {
                stockQuantity: 0,
                inStock: false,
                status: 'sold_out',
                lastSoldAt: FieldValue.serverTimestamp()
              });
            }
            
            stockUpdates.push({ dealId, currentStock, qty, success: true });
          } catch (error) {
            console.error(`[webhook] ❌ Error updating stock for ${dealId}:`, error);
            stockUpdates.push({ dealId, currentStock: 0, qty, success: false });
          }
        }
        
        console.log(`[webhook] 📦 Stock update summary:`, stockUpdates);

        // 7) Uppdatera session + idempotensmarkering
        const mergedTransfers = (() => {
          const merged = [...existingTransfers, ...transferLogs];
          const byKey = new Map<string, (typeof merged)[number]>();
          for (const t of merged) {
            const key = t.transferId || `${t.sellerId}:${t.amountSEK}`;
            if (!byKey.has(key)) byKey.set(key, t);
           }
          return Array.from(byKey.values());
        })();

        batch.update(sessionRef, {
          status: 'succeeded',
          succeededAt: FieldValue.serverTimestamp(),          // ← tydlig succeeded-timestamp
          currency,
          transfers: mergedTransfers,
          transferGroup,
          paymentIntentId: pi.id,
          serviceFeeSEK: platformServiceFeeSEK,
          stripeFeeSEK: totalStripeFeeSEK,
          stripeFeeSubtotalSEK,
          stripeFeeShippingSEK,
          netPlatformSEK,
          receiptUrl,                              // ← kvittolänk
          updatedAt: FieldValue.serverTimestamp(),
        });

        await processedRef.set({ processedAt: new Date(), type: event.type });
        await batch.commit();

        // Final summary log
        console.log(`[webhook] ✅ Payment ${pi.id} processed successfully:`, {
          totalAmount: `${Math.round(pi.amount_received / 100)} SEK`,
          itemCount: items.length,
          transferCount: successfulTransfers.length,
          stockUpdatesSuccess: stockUpdates.filter(u => u.success).length,
          buyerEmail: sBuyerEmail || 'Unknown'
        });

        return json(200, { received: true });
      } catch (err: any) {
        console.error('[webhook] Handler error:', err);
        await processedRef.set({
          processedAt: new Date(),
          type: event.type,
          error: String(err?.message ?? err),
        });
        return json(200, { received: true });
      }
    }

    // Övriga events (logga lätt)
    console.log(`ℹ️ [webhook] Unhandled event type: ${event.type} (${event.id})`);
    
    await db.collection('webhookLogs').add({
      eventType: event.type,
      receivedAt: new Date().toISOString(),
      eventId: event.id,
    });
    await db.collection('stripeWebhookEvents').doc(event.id).set({
      processedAt: new Date(),
      type: event.type,
    });

    return json(200, { received: true });
  } catch (outerErr: any) {
    console.error('[webhook] Outer error:', outerErr);
    return json(500, { error: outerErr?.message ?? 'Unhandled webhook error' });
  }
}
