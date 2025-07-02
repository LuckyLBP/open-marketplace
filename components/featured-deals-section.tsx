'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Timer } from 'lucide-react';
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

type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  companyName: string;
  duration: number;
  expiresAt: Date;
};

export function FeaturedDealsSection() {
  const { t } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

 const handleBuyNow = (id: string) => {
  router.push(`/product/${id}`);
};


  useEffect(() => {
    const fetchFeaturedDeals = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, 'deals'),
          where('status', '==', 'approved'),
          where('expiresAt', '>', now),
          orderBy('expiresAt', 'asc'),
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
          try {
            const companyDoc = await getDoc(doc(db, 'companies', companyId));
            if (companyDoc.exists()) {
              companyData[companyId] =
                companyDoc.data().companyName || 'BudFynd.se';
            }
          } catch (error) {
            console.error('Error fetching company:', error);
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
            imageUrl: data.imageUrl,
            category: data.category || 'other',
            companyName: companyData[data.companyId] || 'BudFynd.se',
            duration,
            expiresAt,
          });
        });

        setDeals(fetchedDeals.slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDeals();
  }, []);

  if (loading || deals.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50 border-y border-red-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full mr-4 animate-pulse text-sm">
              <Timer className="h-4 w-4 mr-1" />
              SNART SLUT
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 text-gray-900">Sista chansen!</h2>
              <p className="text-gray-600 text-sm">Dessa erbjudanden försvinner snart</p>
            </div>
          </div>
          <Link
            href="/marketplace?sort=time-left"
            className="text-red-600 hover:text-red-800 flex items-center font-medium text-sm"
          >
            Se alla brådskande
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-7 md:grid-cols-7 gap-4 justify-center">
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
