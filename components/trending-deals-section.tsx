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
          if (data.companyId) {
            companyIds.add(data.companyId);
          }
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
          });
        });

        setDeals(fetchedDeals);
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full mr-4">
              <Flame className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">HOT</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 text-gray-900">Trending erbjudanden</h2>
              <p className="text-gray-600 text-sm">De mest populära erbjudandena just nu</p>
            </div>
          </div>
          <Link
            href="/marketplace?sort=newest"
            className="text-purple-600 hover:text-purple-800 flex items-center font-medium text-sm"
          >
            Visa alla erbjudanden
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-5 gap-3">
          {deals.map((deal) => (
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
              onAddToWishlist={() => { }}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
