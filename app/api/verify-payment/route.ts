import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/lib/firebase';
import { getDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    // Initialize Firebase and get db instance
    const { db } = initializeFirebase();

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

    const dealRef = doc(db, 'deals', dealId);
    const dealSnap = await getDoc(dealRef);

    if (!dealSnap.exists()) {
      return NextResponse.json(
        { error: 'Erbjudandet hittades ej' },
        { status: 404 }
      );
    }

    const now = Timestamp.now();
    const end = Timestamp.fromDate(
      new Date(now.toDate().getTime() + duration * 60 * 60 * 1000)
    );

    await updateDoc(dealRef, {
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
