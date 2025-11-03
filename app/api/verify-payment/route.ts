import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    // Use Admin SDK (bypasses Firestore rules)
    const db = adminDb;

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { dealId, type, duration } = await req.json();

    const allowedTypes = ['floating', 'banner'];
    if (!dealId || !type || !duration || !allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Ogiltig eller ofullständig data' },
        { status: 400 }
      );
    }

    const dealRef = db.collection('deals').doc(dealId);
    const dealSnap = await dealRef.get();

    if (!dealSnap.exists) {
      return NextResponse.json(
        { error: 'Erbjudandet hittades ej' },
        { status: 404 }
      );
    }

    const now = FieldValue.serverTimestamp();
    const end = new Date(Date.now() + duration * 60 * 60 * 1000);

    await dealRef.update({
      isBoosted: true,
      boostType: type,
      boostStart: now,
      boostEnd: end,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('verify-payment error:', error);
    return NextResponse.json(
      { error: 'Internt fel vid verifiering' },
      { status: 500 }
    );
  }
}
