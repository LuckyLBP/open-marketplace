import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Deal } from '@/components/types/deal';

export const useRelatedDeals = (
  category: string,
  subcategory?: string,
  excludeId?: string,
  limitCount = 4
) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const dealsRef = collection(db, 'deals');

      const q = query(
        dealsRef,
        where('status', '==', 'approved'),
        where('expiresAt', '>', new Date()),
        where('category', '==', category),
        orderBy('expiresAt', 'asc'),
        limit(20)
      );

      const snapshot = await getDocs(q);

      let fetched: Deal[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const expiresAt = data.expiresAt?.toDate?.() || new Date();
          return {
            id: docSnap.id,
            ...data,
            expiresAt,
          } as Deal;
        })
        .filter((deal) => deal.id !== excludeId);

      if (subcategory) {
        const subFiltered = fetched.filter((deal) => deal.subcategory === subcategory);
        if (subFiltered.length >= limitCount) {
          fetched = subFiltered;
        }
      }

      const companyIds = Array.from(new Set(fetched.map((deal) => deal.companyId)));
      const companyData: Record<string, string> = {};
      for (const companyId of companyIds) {
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          companyData[companyId] = companySnap.data().companyName || 'Okänt företag';
        }
      }

      const filtered = fetched.filter((d: any) => {
        if (typeof d?.stockQuantity === 'number') return d.stockQuantity > 0;
        return true;
      });

      const enriched = filtered.map((deal) => ({
        ...deal,
        companyName: companyData[deal.companyId] || 'BudFynd.se',
      }));

      setDeals(enriched.slice(0, limitCount));
      setLoading(false);
    };

    fetchDeals();
  }, [category, subcategory, excludeId, limitCount]);

  return { deals, loading };
};
