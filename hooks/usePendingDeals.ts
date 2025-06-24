import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PendingDeal {
    id: string;
    title: string;
    companyId: string;
    companyName: string;
    [key: string]: any;
}

export function usePendingDeals() {
    const [pendingDeals, setPendingDeals] = useState<PendingDeal[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPendingDeals = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'deals'), where('status', '==', 'pending'));
                const snapshot = await getDocs(q);

                const results: PendingDeal[] = snapshot.docs.map((docSnap) => {
                    const data = docSnap.data();
                    return {
                        id: docSnap.id,
                        title: data.title ?? 'Okänt erbjudande',
                        companyId: data.companyId ?? 'okänt',
                        companyName: data.companyName ?? 'okänt',
                        ...data,
                    };
                });

                setPendingDeals(results);
            } catch (error) {
                console.error('Fel vid hämtning av pending deals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingDeals();
    }, []);

    return { pendingDeals, loading };
}
