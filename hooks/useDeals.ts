import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface Feature {
  id: string;
  text: string;
}

export interface Specification {
  id: string;
  key: string;
  value: string;
}

export type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  duration: number;

  images: ProductImage[];
  imageUrl?: string;

  companyId: string;
  companyName: string;

  category: string;
  subcategory?: string;

  feePercentage: number;

  createdAt?: Date;
  expiresAt: Date;

  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };

  specifications?: Specification[];
  features?: Feature[];

  inStock?: boolean;
  stockQuantity?: number;
  sku?: string;
};

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
    const now = new Date();

    const fetchDeals = async () => {
      const constraints: QueryConstraint[] = [];

      if (options.onlyActive)
        constraints.push(where('expiresAt', '>', Timestamp.fromDate(now)));
      if (options.category)
        constraints.push(where('category', '==', options.category));
      if (options.subcategory)
        constraints.push(where('subcategory', '==', options.subcategory));

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, 'deals'), ...constraints);
      const snapshot = await getDocs(q);

      const results: Deal[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const expiresAt: Date = data.expiresAt?.toDate?.() || now;
        const diffMs = expiresAt.getTime() - now.getTime();

        const hours = Math.floor(diffMs / 3_600_000);
        const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
        const seconds = Math.floor((diffMs % 60_000) / 1_000);

        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice ?? null,

          duration: data.duration,
          images: data.images || [],
          imageUrl:
            data.imageUrl ||
            data.images?.find((img: any) => img.isPrimary)?.url ||
            '',

          companyId: data.companyId,
          companyName: data.companyName || 'Okänt företag',

          category: data.category,
          subcategory: data.subcategory ?? '',

          feePercentage: data.feePercentage || 0,
          createdAt: data.createdAt?.toDate() || now,
          expiresAt,

          specifications: (data.specifications ?? []) as Specification[],
          features: (data.features ?? []) as Feature[],

          inStock: data.inStock ?? true,
          stockQuantity: data.stockQuantity ?? 0,

          timeLeft: {
            hours: Math.max(0, hours),
            minutes: Math.max(0, minutes),
            seconds: Math.max(0, seconds),
          },
          sku: data.sku ?? '',
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
          const hours = Math.floor(diffMs / 3_600_000);
          const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
          const seconds = Math.floor((diffMs % 60_000) / 1_000);

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
    }, 1_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [
    options.category,
    options.subcategory,
    options.onlyActive,
    options.companyId,
  ]);

  return { deals, loading };
}
