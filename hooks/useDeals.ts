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
import { Deal, ProductImage, Specification, Feature } from '@/components/types/deal';

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

    const toDateSafe = (input: any): Date => {
      if (input instanceof Date) return input;
      if (input?.toDate) return input.toDate();
      return new Date(0);
    };

    const fetchDeals = async () => {
      const constraints: QueryConstraint[] = [];

      if (options.onlyActive)
        constraints.push(where('expiresAt', '>', Timestamp.fromDate(now)));
      if (options.companyId)
        constraints.push(where('companyId', '==', options.companyId));
      if (options.category)
        constraints.push(where('category', '==', options.category));
      if (options.subcategory)
        constraints.push(where('subcategory', '==', options.subcategory));

      constraints.push(where('status', '==', 'approved'));
      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, 'deals'), ...constraints);
      const snapshot = await getDocs(q);

      const results: Deal[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        // Här sätter vi accountType robust:
        const accountType: 'company' | 'customer' =
          data.accountType ??
          (data.role === 'customer' ? 'customer' : 'company');

        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice ?? null,
          duration: data.duration,
          images: (data.images ?? []) as ProductImage[],
          imageUrl:
            data.imageUrl ||
            data.images?.find((img: any) => img.isPrimary)?.url ||
            '',
          companyId: data.companyId,
          companyName: data.companyName || 'Okänt företag',
          category: data.category,
          subcategory: data.subcategory ?? '',
          feePercentage: data.feePercentage || 0,
          createdAt: toDateSafe(data.createdAt),
          expiresAt: toDateSafe(data.expiresAt),
          boostStart: data.boostStart ? toDateSafe(data.boostStart) : undefined,
          boostEnd: data.boostEnd ? toDateSafe(data.boostEnd) : undefined,
          boostType: data.boostType || undefined,
          specifications: (data.specifications ?? []) as Specification[],
          features: (data.features ?? []) as Feature[],
          inStock: data.inStock ?? true,
          stockQuantity: data.stockQuantity ?? 0,
          sku: data.sku ?? '',
          accountType,       // <= VIKTIGT
          role: data.role,   // valfritt, kan hjälpa vid fallback
        };
      });

      if (active) {
        setDeals(results);
        setLoading(false);
      }
    };

    fetchDeals();
    return () => {
      active = false;
    };
  }, [
    options.category,
    options.subcategory,
    options.onlyActive,
    options.companyId,
  ]);

  return { deals, loading };
}
