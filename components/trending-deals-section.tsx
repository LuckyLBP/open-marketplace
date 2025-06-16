'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, TrendingUp } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
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
import { useRouter } from 'next/navigation';

type Deal = {
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
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
};

export function TrendingDealsSection() {
  const { t } = useLanguage();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingDeals = async () => {
      try {
        const now = Timestamp.now();

        // Fetch recent deals that are still active
        const q = query(
          collection(db, 'deals'),
          where('expiresAt', '>', now),
          orderBy('createdAt', 'desc'),
          limit(8)
        );

        const querySnapshot = await getDocs(q);
        const fetchedDeals: Deal[] = [];

        // Get unique company IDs for fetching company names
        const companyIds = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.companyId) {
            companyIds.add(data.companyId);
          }
        });

        // Fetch company names
        const companyData: Record<string, string> = {};
        for (const companyId of companyIds) {
          if (!companyId) continue;

          try {
            const companyDocRef = doc(db, 'companies', companyId);
            const companyDoc = await getDoc(companyDocRef);
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
          const diffMs = expiresAt.getTime() - now.getTime();

          if (diffMs > 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            fetchedDeals.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              price: data.price,
              originalPrice: data.originalPrice,
              duration: data.duration,
              imageUrl: data.imageUrl,
              companyId: data.companyId,
              companyName: companyData[data.companyId] || 'BudFynd.se',
              category: data.category || 'other',
              timeLeft: { hours, minutes, seconds },
            });
          }
        });

        setDeals(fetchedDeals);
      } catch (error) {
        console.error('Error fetching trending deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingDeals();

    // Update countdown every second
    const interval = setInterval(() => {
      setDeals((prevDeals) =>
        prevDeals
          .map((deal) => {
            const now = new Date();
            const diffMs =
              deal.timeLeft.hours * 3600000 +
              deal.timeLeft.minutes * 60000 +
              deal.timeLeft.seconds * 1000 -
              1000;

            if (diffMs <= 0) {
              return null; // Mark for removal
            }

            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            return {
              ...deal,
              timeLeft: { hours, minutes, seconds },
            };
          })
          .filter((deal): deal is Deal => deal !== null)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBuyNow = (dealId: string) => {
    router.push(`/product/${dealId}`);
  };

  const handleAddToWishlist = (dealId: string) => {
    // Add to wishlist logic here
    console.log('Add to wishlist:', dealId);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar trendiga erbjudanden...</p>
          </div>
        </div>
      </section>
    );
  }

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
              <h2 className="text-3xl font-bold mb-2">Trending erbjudanden</h2>
              <p className="text-gray-600">
                De mest populära erbjudandena just nu
              </p>
            </div>
          </div>
          <Link
            href="/marketplace?sort=newest"
            className="text-purple-600 hover:text-purple-800 flex items-center font-medium transition-colors"
          >
            Visa alla erbjudanden
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {deals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {deals.slice(0, 4).map((deal) => (
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
                timeLeft={deal.timeLeft}
                onBuyNow={handleBuyNow}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Inga trendiga erbjudanden just nu
            </h3>
            <p className="text-gray-500 mb-6">
              Kom tillbaka senare för att se de senaste erbjudandena!
            </p>
            <Link href="/marketplace">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                Utforska alla erbjudanden
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
