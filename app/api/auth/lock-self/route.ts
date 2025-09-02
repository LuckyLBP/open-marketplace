export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }
    const token = authHeader.slice('Bearer '.length);
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    // Måste finnas companies/{uid} och vara pending
    const companyRef = adminDb.doc(`companies/${uid}`);
    const snap = await companyRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    const company = snap.data() as any;
    const status = company?.status ?? 'pending';
    if (status !== 'pending') {
      // redan godkänd, hoppa över
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Lås kontot (blockerar inloggning)
    await adminAuth.updateUser(uid, { disabled: true });

    // Markera i doc (bra för felsökning/visning)
    await companyRef.set(
      { locked: true, lockedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 400 });
  }
}
