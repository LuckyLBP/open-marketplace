import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function POST(req: Request) {
    try {
        const { items } = await req.json();

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Saknar items-array' }, { status: 400 });
        }


        for (const item of items) {
            const quantity = Number(item.quantity);
            const dealRef = doc(db, 'deals', item.id);
            const dealSnap = await getDoc(dealRef);


            if (!dealSnap.exists()) {
                console.warn(`⚠️ Deal ${item.id} hittades ej – hoppar över`);
                continue;
            }

            const currentStock = dealSnap.data().stockQuantity ?? 0;

            if (currentStock < quantity) {
                console.warn(`⚠️ Otillräckligt lager för ${item.id}: nuvarande ${currentStock}, begärt ${quantity}`);
                continue;
            }

            await updateDoc(dealRef, {
                stockQuantity: increment(-quantity),
            });

        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internt fel' }, { status: 500 });
    }
}
