'use client';

import { useEffect, useState } from "react";
import { collection, doc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirebase } from "@/components/firebase-provider";

export interface Deal {
    id: string;
    title: string;
    companyId: string;
    expiresAt: Date;
    [key: string]: any;
}

export function useAdminDeals() {
    const { user, userType, loading } = useFirebase();
    const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
    const [expiredDeals, setExpiredDeals] = useState<Deal[]>([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchDeals = async () => {
            if (!user || loading || userType === 'customer') return;

            setFetching(true);

            try {
                let q;

                if (userType === 'superadmin') {
                    q = query(collection(db, 'deals'));
                } else if (userType === 'company') {
                    q = query(collection(db, 'deals'), where('companyId', '==', user.uid));
                }

                const snapshot = await getDocs(q!);
                const now = new Date();

                const active: Deal[] = [];
                const expired: Deal[] = [];

                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const expiresAt: Date = data.expiresAt?.toDate?.() || new Date(0);

                    const deal: Deal = {
                        id: docSnap.id,
                        title: data.title ?? "Okänt erbjudande",
                        companyId: data.companyId ?? "okänt",
                        expiresAt,

                        ...data, 
                    };

                    if (expiresAt > new Date()) {
                        active.push(deal);
                    } else {
                        expired.push(deal);
                    }
                });

                setActiveDeals(active);
                setExpiredDeals(expired);
            } catch (error) {
                console.error('Kunde ej hämta deals:', error);
            } finally {
                setFetching(false);
            }
        };

        fetchDeals();
    }, [user, userType, loading]);

    return { activeDeals, expiredDeals, fetching };
}
