'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/components/firebase-provider';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DealList } from '../dealList';
import { Deal } from '@/components/types/deal';

export default function CustomerPanel() {
    const { user, loading } = useFirebase();
    const [tab, setTab] = useState<'active' | 'expired'>('active');
    const [userInfo, setUserInfo] = useState<any>(null);
    const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
    const [expiredDeals, setExpiredDeals] = useState<Deal[]>([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchUserInfo = async () => {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUserInfo(userDoc.data());
            }
        };

        fetchUserInfo();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const fetchDeals = async () => {
            setFetching(true);
            const dealsSnapshot = await getDocs(
                query(collection(db, 'deals'), where('companyId', '==', user.uid))
            );
            const allDeals: Deal[] = dealsSnapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title ?? "Okänt erbjudande",
                    companyId: data.companyId ?? "okänt",
                    companyName: data.companyName ?? "okänt företag",
                    expiresAt: data.expiresAt?.toDate?.() ?? new Date(0),
                    ...data,
                };
            });


            const now = new Date();
            setActiveDeals(allDeals.filter((deal) => deal.expiresAt > now));
            setExpiredDeals(allDeals.filter((deal) => deal.expiresAt <= now));
            setFetching(false);
        };

        fetchDeals();
    }, [user]);

    if (loading || !user) {
        return <p>Laddar...</p>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Min profil</h2>

            {userInfo ? (
                <div className="bg-gray-100 p-4 rounded">
                    <p><strong>Namn:</strong> {userInfo.name || 'Ej angivet'}</p>
                    <p><strong>Email:</strong> {userInfo.email || user.email}</p>
                </div>
            ) : (
                <p className="text-muted-foreground">Ingen användarinformation hittades.</p>
            )}

            <div className="flex gap-4 border-b pt-4">
                <button
                    onClick={() => setTab('active')}
                    className={tab === 'active' ? 'border-b-2 font-semibold' : ''}
                >
                    Aktiva
                </button>
                <button
                    onClick={() => setTab('expired')}
                    className={tab === 'expired' ? 'border-b-2 font-semibold' : ''}
                >
                    Utgångna
                </button>
            </div>

            {tab === 'active' && (
                <DealList title="Aktiva erbjudanden" deals={activeDeals} loading={fetching} />
            )}
            {tab === 'expired' && (
                <DealList title="Utgångna erbjudanden" deals={expiredDeals} loading={fetching} />
            )}
        </div>
    );
}
