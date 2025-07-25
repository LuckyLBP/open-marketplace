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
            const userDoc = await getDoc(doc(db, 'customers', user.uid)); // OBS! 'customers', inte 'users'
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
                    title: data.title ?? 'Okänt erbjudande',
                    companyId: data.companyId ?? 'okänt',
                    companyName: data.companyName ?? 'okänt företag',
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
                <div className="bg-gray-100 p-4 rounded space-y-2">
                    <p><strong>Namn:</strong> {userInfo.name || 'Ej angivet'}</p>
                    <p><strong>Email:</strong> {userInfo.email || user.email}</p>

                    {!userInfo.stripeAccountId ? (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-300 mt-4">
                            <p className="mb-2 text-sm text-yellow-700">
                                För att kunna ta emot betalningar behöver du koppla ett Stripe-konto.
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/create-stripe-account', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                email: user?.email,
                                                userId: user?.uid,
                                                accountType: 'customer',
                                            }),
                                        });
                                        const data = await res.json();
                                        if (data.url) window.location.href = data.url;
                                        else alert('Något gick fel vid skapande av Stripe-länk.');
                                    } catch (err) {
                                        console.error(err);
                                        alert('Kunde inte ansluta till Stripe.');
                                    }
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                                Anslut Stripe-konto
                            </button>
                        </div>
                    ) : (
                        <p className="text-green-600 font-medium mt-2">Stripe-konto anslutet ✅</p>
                    )}
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
