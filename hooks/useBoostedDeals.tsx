import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useBoostedDeals(boostType: "floating" | "banner") {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const now = new Date();

                const dealsRef = collection(db, "deals");
                const q = query(
                    dealsRef,
                    where("isBoosted", "==", true),
                    where("boostType", "==", boostType),
                    where("boostStart", "<=", now),
                    where("boostEnd", ">=", now)
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setDeals(data);
            } catch (error) {
                console.error("Fel vid hämtning av boostade deals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, [boostType]);

    return { deals, loading };
}
