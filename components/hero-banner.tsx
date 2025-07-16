'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Clock,
  Star,
  TrendingUp,
  ShoppingBag,
  Timer,
  Zap,
} from 'lucide-react';
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
import { TimeLeftLabel } from './deals/timeLeftLabel';
import { ProductCard } from './components/product-card';

type FeaturedDeal = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  companyName: string;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
};

export function HeroBanner() {
  const { t } = useLanguage();
  const [featuredDeals, setFeaturedDeals] = useState<FeaturedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUrgentDeals, setHasUrgentDeals] = useState(false);

  useEffect(() => {
    const fetchFeaturedDeals = async () => {
      try {
        const now = Timestamp.now();

        // Fetch 3 featured deals with short time left for urgency
        const q = query(
          collection(db, 'deals'),
          where('status', '==', 'approved'),
          where('expiresAt', '>', now),
          orderBy('expiresAt', 'asc'),
          limit(3)
        );

        const querySnapshot = await getDocs(q);
        const fetchedDeals: FeaturedDeal[] = [];

        // Get unique company IDs
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

        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const expiresAt = data.expiresAt.toDate();
          const now = new Date();
          const diffMs = expiresAt.getTime() - now.getTime();

          if (diffMs > 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            // Only show deals with less than 12 hours left for maximum urgency
            if (hours < 12) {
              fetchedDeals.push({
                id: docSnapshot.id,
                title: data.title,
                price: data.price,
                originalPrice: data.originalPrice,
                imageUrl: data.imageUrl,
                companyName: companyData[data.companyId] || 'BudFynd.se',
                timeLeft: { hours, minutes, seconds },
              });
            }
          }
        });

        // Check if we found urgent deals
        const foundUrgentDeals = fetchedDeals.length > 0;
        setHasUrgentDeals(foundUrgentDeals);

        // If no urgent deals found, fetch some regular deals
        if (fetchedDeals.length === 0) {
          const regularDealsQuery = query(
            collection(db, 'deals'),
            where('status', '==', 'approved'),
            where('expiresAt', '>', now),
            orderBy('createdAt', 'desc'),
            limit(3)
          );

          const regularSnapshot = await getDocs(regularDealsQuery);

          regularSnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
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
                id: docSnapshot.id,
                title: data.title,
                price: data.price,
                originalPrice: data.originalPrice,
                imageUrl: data.imageUrl,
                companyName: companyData[data.companyId] || 'BudFynd.se',
                timeLeft: { hours, minutes, seconds },
              });
            }
          });
        }

        setFeaturedDeals(fetchedDeals);
      } catch (error) {
        console.error('Error fetching featured deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDeals();

    // Update countdown every second
    const interval = setInterval(() => {
      setFeaturedDeals((prevDeals) =>
        prevDeals
          .map((deal) => {
            const totalMs =
              deal.timeLeft.hours * 3600000 +
              deal.timeLeft.minutes * 60000 +
              deal.timeLeft.seconds * 1000;
            const newTotalMs = totalMs - 1000;

            if (newTotalMs <= 0) {
              return null; // Mark for removal
            }

            const hours = Math.floor(newTotalMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (newTotalMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((newTotalMs % (1000 * 60)) / 1000);

            return {
              ...deal,
              timeLeft: { hours, minutes, seconds },
            };
          })
          .filter((deal): deal is FeaturedDeal => deal !== null)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="hidden md:block absolute top-6 right-6 text-purple-200">
        <TrendingUp className="h-24 w-24" />
      </div>
      <div className="hidden md:block absolute bottom-6 left-6 text-pink-200">
        <Clock className="h-20 w-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Main content */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-lg border">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Över 10,000+ nöjda kunder
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-xl mx-auto lg:mx-0 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 leading-tight break-words">
              Hitta de bästa tidsbegränsade erbjudandena
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
              Upptäck exklusiva erbjudanden från ledande företag med begränsad tid.
              <span className="font-semibold text-purple-600">
                {' '}Ju kortare tid, desto bättre pris!
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-6 py-4 sm:px-8 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Utforska erbjudanden
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 text-lg px-6 py-4 sm:px-8 sm:py-6 rounded-full"
              >
                Så fungerar det
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
                  500+
                </div>
                <div className="text-sm text-gray-600">Aktiva erbjudanden</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-pink-600 mb-1">
                  24h
                </div>
                <div className="text-sm text-gray-600">Genomsnittlig tid</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
                  85%
                </div>
                <div className="text-sm text-gray-600">Genomsnittlig rabatt</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-pink-600 mb-1">
                  10k+
                </div>
                <div className="text-sm text-gray-600">Nöjda kunder</div>
              </div>
            </div>
          </div>

          {/* Right side - Featured products showcase */}
          <div className="relative max-w-full overflow-hidden">
            {/* Floating urgency badge - only show for urgent deals */}
            {featuredDeals.length > 0 && hasUrgentDeals && (
              <div className="absolute top-2 left-2 z-20 hidden sm:block">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    <span className="text-sm font-bold">SNART SLUT!</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {hasUrgentDeals
                    ? '🔥 Hetaste erbjudandena'
                    : '✨ Senaste erbjudandena'}
                </h3>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Live
                </Badge>
              </div>

              {/* Product cards list using your reusable component */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredDeals.map((deal) => (
                  <ProductCard
                    key={deal.id}
                    id={deal.id}
                    title={deal.title}
                    description="Exklusivt erbjudande från utvalt företag"
                    price={deal.price}
                    originalPrice={deal.originalPrice}
                    imageUrl={deal.imageUrl}
                    category="elektronik" // replace with actual category if available
                    companyName={deal.companyName}
                    duration={
                      Math.ceil(
                        (deal.timeLeft.hours * 60 + deal.timeLeft.minutes) / 60
                      ) || 1
                    }
                    expiresAt={
                      new Date(
                        Date.now() +
                        deal.timeLeft.hours * 3600000 +
                        deal.timeLeft.minutes * 60000 +
                        deal.timeLeft.seconds * 1000
                      )
                    }
                    onBuyNow={(id) => {
                      window.location.href = `/checkout/${id}`;
                    }}
                    onAddToWishlist={(id) => {
                      console.log('wishlist:', id);
                    }}
                    compact={true}
                  />
                ))}
              </div>
            </div>

            {/* Decorative floating blobs - only show on larger screens */}
            <div className="hidden md:block absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl pointer-events-none"></div>
            <div className="hidden md:block absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-30 blur-lg pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );


}
