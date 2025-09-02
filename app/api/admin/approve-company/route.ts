// app/api/admin/approve-company/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM = process.env.RESEND_FROM;

/** Verifiera att anroparen är superadmin (claims eller profiler i users/companies/customers) */
async function assertSuperadmin(authHeader?: string): Promise<string> {
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Missing token');
  const token = authHeader.slice('Bearer '.length);
  const decoded = await adminAuth.verifyIdToken(token);
  const uid = decoded.uid;

  const claimRole = (decoded as any).role || (decoded as any).accountType;
  if (claimRole === 'superadmin') return uid;

  const [u, c, cu] = await Promise.all([
    adminDb.doc(`users/${uid}`).get(),
    adminDb.doc(`companies/${uid}`).get(),
    adminDb.doc(`customers/${uid}`).get(),
  ]);

  const getRole = (d: FirebaseFirestore.DocumentSnapshot) =>
    d.exists ? (d.data()?.role || d.data()?.accountType) : undefined;

  if ([getRole(u), getRole(c), getRole(cu)].includes('superadmin')) return uid;

  throw new Error('Forbidden');
}

/** Försök hitta e-post för companyUid */
async function resolveCompanyEmail(companyUid: string): Promise<string | undefined> {
  const [companySnap, userSnap] = await Promise.all([
    adminDb.doc(`companies/${companyUid}`).get(),
    adminDb.doc(`users/${companyUid}`).get(),
  ]);
  const fromDocs = (companySnap.data()?.email as string | undefined) || (userSnap.data()?.email as string | undefined);
  if (fromDocs) return fromDocs;
  try {
    const authUser = await adminAuth.getUser(companyUid);
    return authUser.email || undefined;
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const superadminUid = await assertSuperadmin(req.headers.get('authorization') || undefined);
    const { companyUid, sendEmail = true } = (await req.json()) as { companyUid: string; sendEmail?: boolean };
    if (!companyUid) return NextResponse.json({ error: 'companyUid required' }, { status: 400 });

    const companyRef = adminDb.doc(`companies/${companyUid}`);
    const snap = await companyRef.get();
    if (!snap.exists) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    const company = snap.data() as any;

    // 1) Sätt status: approved + metadata
    await companyRef.set(
      {
        status: 'approved',
        approvedAt: FieldValue.serverTimestamp(),
        approvedBy: superadminUid,
        locked: false,
        unlockedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2) Lås upp Auth-kontot så de kan logga in
    await adminAuth.updateUser(companyUid, { disabled: false });

    // 3) (valfritt) markera i users/{uid}
    await adminDb.doc(`users/${companyUid}`).set(
      {
        role: 'company',
        accountType: 'company',
        companyApproved: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 4) (valfritt) set custom claims (kräver ny inloggning för att slå igenom i klienten)
    try {
      await adminAuth.setCustomUserClaims(companyUid, { accountType: 'company', companyApproved: true });
    } catch {
      /* ignore if not used yet */
    }

    // 5) Skicka mail via Resend (om möjligt)
    const canSend = !!process.env.RESEND_API_KEY && !!FROM;
    if (sendEmail && canSend) {
      const toEmail = await resolveCompanyEmail(companyUid);
      if (toEmail) {
        await resend.emails.send({
          from: FROM!,
          to: toEmail,
          subject: 'Ditt företagskonto har godkänts',
          html: `
            <h2>Hej ${company?.companyName || ''}!</h2>
            <p>Ditt företagskonto på ClickFynd har nu godkänts och är upplåst.</p>
            <p>Du kan logga in och börja skapa erbjudanden.</p>
            <p>Hälsningar,<br/>ClickFynd-teamet</p>
          `,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || 'Unauthorized';
    const code = msg === 'Forbidden' ? 403 : msg === 'Missing token' ? 401 : 401;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
