import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  feePercentage: number;
  category: string;
  subcategory: string;
  companyId: string;
  companyName?: string;
  imageUrl: string;
  duration: number;
  createdAt: Date;
  expiresAt: Date;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface UseDealsOptions {
  category?: string;
  subcategory?: string;
  companyId?: string;
  onlyActive?: boolean;
}

export function useDeals(options: UseDealsOptions = {}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchDeals = async () => {
      const now = new Date();
      const constraints: QueryConstraint[] = [];

      if (options.onlyActive) {
        constraints.push(where("expiresAt", ">", Timestamp.fromDate(now)));
      }
      if (options.category) {
        constraints.push(where("category", "==", options.category));
      }
      if (options.subcategory) {
        constraints.push(where("subcategory", "==", options.subcategory));
      }

      constraints.push(orderBy("createdAt", "desc"));

      const q = query(collection(db, "deals"), ...constraints);
      const snapshot = await getDocs(q);

      const results: Deal[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toDate?.() || now;
        const diffMs = expiresAt.getTime() - now.getTime();

        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);

        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          feePercentage: data.feePercentage || 0,
          category: data.category,
          subcategory: data.subcategory ?? "",
          companyId: data.companyId,
          companyName: data.companyName || "Okänt företag",
          imageUrl: data.imageUrl || data.images?.find((img: any) => img.isPrimary)?.url || "",
          duration: data.duration,
          createdAt: data.createdAt?.toDate() || now,
          expiresAt,
          timeLeft: { hours: Math.max(0, hours), minutes: Math.max(0, minutes), seconds: Math.max(0, seconds) }
        };
      });

      if (active) {
        setDeals(results);
        setLoading(false);
      }
    };

    fetchDeals();

    const interval = setInterval(() => {
      setDeals((prev) =>
        prev.map((deal) => {
          const now = new Date();
          const diffMs = deal.expiresAt.getTime() - now.getTime();

          const hours = Math.floor(diffMs / 3600000);
          const minutes = Math.floor((diffMs % 3600000) / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);

          return {
            ...deal,
            timeLeft: {
              hours: Math.max(0, hours),
              minutes: Math.max(0, minutes),
              seconds: Math.max(0, seconds),
            },
          };
        })
      );
    }, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [options.category, options.subcategory, options.onlyActive]);

  return { deals, loading };
}
