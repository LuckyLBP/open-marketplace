export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM!; // t.ex. "ClickFynd <no-reply@clickfynd.se>"

async function assertSuperadmin(authHeader?: string) {
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Missing token');
  const token = authHeader.slice('Bearer '.length);
  const decoded = await adminAuth.verifyIdToken(token);

  // Kolla users/{uid}.role === 'superadmin' (enkelt & räcker här)
  const userDoc = await adminDb.doc(`users/${decoded.uid}`).get();
  if (userDoc.exists && userDoc.data()?.role === 'superadmin') return decoded.uid;
  throw new Error('Forbidden');
}

export async function POST(req: Request) {
  try {
    const superadminUid = await assertSuperadmin(req.headers.get('authorization') || undefined);
    const { companyUid, sendEmail = true } = (await req.json()) as { companyUid: string; sendEmail?: boolean };
    if (!companyUid) return NextResponse.json({ error: 'companyUid required' }, { status: 400 });

    const companyRef = adminDb.doc(`companies/${companyUid}`);
    const userRef = adminDb.doc(`users/${companyUid}`);

    const snap = await companyRef.get();
    if (!snap.exists) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    const company = snap.data() as any;

    // 1) Godkänn
    await companyRef.set(
      {
        status: 'approved',
        approvedAt: FieldValue.serverTimestamp(),
        approvedBy: superadminUid,
      },
      { merge: true }
    );

    // 2) Markera i users
    await userRef.set(
      { role: 'company', accountType: 'company', companyApproved: true, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    // 3) (valfritt) Custom claims för snabb UI (kräver ny inloggning för att slå igenom)
    await adminAuth.setCustomUserClaims(companyUid, { accountType: 'company', companyApproved: true });

    // 4) Mail via Resend
    if (sendEmail && company?.email) {
      await resend.emails.send({
        from: FROM,
        to: company.email,
        subject: 'Ditt företagskonto har godkänts',
        html: `
          <h2>Hej ${company?.companyName || ''}!</h2>
          <p>Ditt företagskonto på ClickFynd har nu godkänts.</p>
          <p>Du kan logga in och börja skapa erbjudanden.</p>
          <p>Hälsningar,<br/>ClickFynd-teamet</p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || 'Unauthorized';
    const code = msg === 'Forbidden' ? 403 : msg === 'Missing token' ? 401 : 401;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
