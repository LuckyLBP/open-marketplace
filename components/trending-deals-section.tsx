'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  limit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductCard } from '@/components/product-card';
import { useRouter } from 'next/navigation';

interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number;
  imageUrl: string;
  companyId: string;
  companyName: string;
  category: string;
  expiresAt: Date;
}

export function TrendingDealsSection() {
  const { t } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleBuyNow = (id: string) => {
    router.push(`/product/${id}`);
  };

  useEffect(() => {
    const fetchTrendingDeals = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, 'deals'),
          where('status', '==', 'approved'),
          where('expiresAt', '>', now),
          orderBy('createdAt', 'desc'),
          limit(6)
        );

        const querySnapshot = await getDocs(q);
        const fetchedDeals: Deal[] = [];
        const companyIds = new Set<string>();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.companyId) companyIds.add(data.companyId);
        });

        const companyData: Record<string, string> = {};
        for (const companyId of companyIds) {
          const companyDocRef = doc(db, 'companies', companyId);
          const companyDoc = await getDoc(companyDocRef);
          if (companyDoc.exists()) {
            companyData[companyId] = companyDoc.data().companyName || 'BudFynd.se';
          }
        }

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const expiresAt = data.expiresAt.toDate();
          const now = new Date();
          const duration =
            data.duration || Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

          fetchedDeals.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            price: data.price,
            originalPrice: data.originalPrice,
            duration,
            imageUrl: data.imageUrl,
            companyId: data.companyId,
            companyName: companyData[data.companyId] || 'BudFynd.se',
            category: data.category || 'other',
            expiresAt,
            // 🔽 lagerfält:
            // @ts-ignore – om din Deal-typ saknar dessa i filen, lägg gärna till i interfacet.
            stockQuantity: data.stockQuantity,
            inStock: data.inStock,
          } as any);
        });

        // 🔽 filtrera bort slut i lager
        const visible = fetchedDeals.filter(
          (d: any) => d.inStock !== false && ((d.stockQuantity ?? 0) > 0)
        );

        setDeals(visible);
      } catch (error) {
        console.error('Error fetching trending deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingDeals();
  }, []);

  if (loading || deals.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* ...header */}
        <div className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-5 gap-3">
          {deals.map((deal: any) => (
            <ProductCard
              key={deal.id}
              id={deal.id}
              title={deal.title}
              description={deal.description}
              price={deal.price}
              originalPrice={deal.originalPrice}
              imageUrl={deal.imageUrl}
              category={deal.category}
              companyName={deal.companyName}
              duration={deal.duration}
              expiresAt={deal.expiresAt}
              stockQuantity={deal.stockQuantity}   // 🔽 pass through
              inStock={deal.inStock}               // 🔽 pass through
              onAddToWishlist={() => { }}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

