'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirebase } from "@/components/firebase-provider";
import { Deal } from "@/components/types/deal";



export interface CompanyInfo {
    id: string;
    email: string;
    companyName: string;
}

export function useAdminDeals() {
    const { user, userType, loading } = useFirebase();
    const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
    const [expiredDeals, setExpiredDeals] = useState<Deal[]>([]);
    const [companies, setCompanies] = useState<CompanyInfo[]>([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchDeals = async () => {
            if (!user || loading || userType === 'customer') return;

            setFetching(true);
            try {
                const q =
                    userType === 'superadmin'
                        ? query(collection(db, 'deals'))
                        : query(
                            collection(db, 'deals'),
                            where('companyId', '==', user.uid),
                            where('status', '==', 'approved')
                        );

                const snapshot = await getDocs(q);
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
                        companyName: data.companyName ?? "okänt",
                        expiresAt,
                        ...data,
                    };

                    if (expiresAt > now) {
                        active.push(deal);
                    } else {
                        expired.push(deal);
                    }
                });

                setActiveDeals(active);
                setExpiredDeals(expired);
            } catch (error) {
                console.error("Kunde inte hämta deals:", error);
            } finally {
                setFetching(false);
            }
        };

        const fetchCompanies = async () => {
            if (userType !== 'superadmin') return;

            try {
                const companySnap = await getDocs(collection(db, 'companies'));
                const companyList: CompanyInfo[] = companySnap.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        email: data.email ?? 'okänd',
                        companyName: data.companyName ?? 'okänt företag',
                    };
                });
                setCompanies(companyList);
            } catch (error) {
                console.error('Kunde inte hämta företag:', error);
            }
        };

        fetchDeals();
        fetchCompanies();
    }, [user, userType, loading]);

    return { activeDeals, expiredDeals, companies, fetching };
}
