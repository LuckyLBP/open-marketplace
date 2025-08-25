'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  limit as firestoreLimit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/product-card';

type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  duration: number;
  imageUrl: string;
  category: string;
  companyName: string;
  expiresAt: Date;
  stockQuantity?: number;
  inStock?: boolean;
};

const categories = {
  elektronik: '📱 Elektronik',
  mode: '👗 Mode',
  hemmet: '🏠 Hemmet',
  'halsa-skonhet': '💄 Hälsa & Skönhet',
  'hobby-fritid': '🎯 Hobby & Fritid',
};

interface CategoryProductsSectionProps {
  categoryKey: keyof typeof categories;
  limit?: number;
}

export function CategoryProductsSection({
  categoryKey,
  limit = 10,
}: CategoryProductsSectionProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const categoryName = categories[categoryKey];

  const handleProductClick = (id: string) => {
    router.push(`/product/${id}`);
  };

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, 'deals'),
          where('status', '==', 'approved'),
          where('category', '==', categoryKey),
          where('expiresAt', '>', now),
          orderBy('expiresAt', 'asc'),
          firestoreLimit(limit)
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
          try {
            const companyDoc = await getDoc(doc(db, 'companies', companyId));
            if (companyDoc.exists()) {
              companyData[companyId] =
                companyDoc.data().companyName || 'ClickFynd.se';
            }
          } catch (error) {
            console.error('Error fetching company:', error);
          }
        }

        const nowDate = new Date();
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const expiresAt = data.expiresAt.toDate();
          const timeDiff = expiresAt.getTime() - nowDate.getTime();

          // Only include non-expired deals
          if (timeDiff > 0) {
            fetchedDeals.push({
              id: docSnapshot.id,
              title: data.title,
              description: data.description,
              price: data.price,
              originalPrice: data.originalPrice,
              duration: data.duration || Math.ceil(timeDiff / (1000 * 60 * 60)),
              imageUrl: data.imageUrl,
              category: data.category || categoryKey,
              companyName: companyData[data.companyId] || 'ClickFynd.se',
              expiresAt,
              stockQuantity: data.stockQuantity,
              inStock: data.inStock,
            });
          }
        });

        const visible = fetchedDeals.filter(
          (d) => d.inStock !== false && (d.stockQuantity ?? 0) > 0
        );

        setDeals(visible);
      } catch (error) {
        console.error('Error fetching products by category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categoryKey, limit]);

  if (loading) {
    return (
      <div className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-64 h-96 bg-gray-300 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (deals.length === 0) return null;

  return (
    <div className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {categoryName}
            </h2>
            <button
              onClick={() =>
                router.push(`/marketplace?category=${categoryKey}`)
              }
              className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline"
            >
              Se alla →
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {deals.map((deal) => (
              <div key={deal.id} className="flex-shrink-0 w-64">
                <ProductCard
                  id={deal.id}
                  title={deal.title}
                  description={deal.description}
                  price={deal.price}
                  originalPrice={deal.originalPrice || undefined}
                  imageUrl={deal.imageUrl}
                  category={deal.category}
                  companyName={deal.companyName}
                  duration={deal.duration}
                  expiresAt={deal.expiresAt}
                  stockQuantity={deal.stockQuantity}
                  inStock={deal.inStock}
                  onAddToWishlist={() => {}}
                  onBuyNow={() => handleProductClick(deal.id)}
                  compact={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
