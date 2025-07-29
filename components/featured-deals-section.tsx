'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Timer, Package, ShoppingBag } from 'lucide-react';
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

type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  companyName: string;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
};

export function FeaturedDealsSection() {
  const { t } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedDeals = async () => {
      try {
        const now = Timestamp.now();

        // Fetch deals with short time left (urgent deals)
        const q = query(
          collection(db, 'deals'),
          where('expiresAt', '>', now),
          orderBy('expiresAt', 'asc'),
          limit(6)
        );

        const querySnapshot = await getDocs(q);
        const fetchedDeals: Deal[] = [];

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

            // Only show deals with less than 24 hours left for urgency
            if (hours < 24) {
              fetchedDeals.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                price: data.price,
                originalPrice: data.originalPrice,
                imageUrl: data.imageUrl,
                category: data.category || 'other',
                companyName: companyData[data.companyId] || 'BudFynd.se',
                timeLeft: { hours, minutes, seconds },
              });
            }
          }
        });

        setDeals(fetchedDeals.slice(0, 3)); // Show only 3 featured deals
      } catch (error) {
        console.error('Error fetching featured deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDeals();

    // Update countdown every second
    const interval = setInterval(() => {
      setDeals((prevDeals) =>
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
          .filter((deal): deal is Deal => deal !== null)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading || deals.length === 0) {
    return null; // Don't show section if no urgent deals
  }

  return (
    <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50 border-y border-red-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full mr-4 animate-pulse">
              <Timer className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                Sint aute esse elit cillum laboris id incididunt. Exercitation
                ipsum laborum sit nulla. Nisi aute est et ea exercitation quis
                aute pariatur deserunt ut cupidatat sunt veniam in. Nulla ut
                reprehenderit reprehenderit qui voluptate occaecat laborum
                deserunt incididunt mollit.Sint aute esse elit cillum laboris id
                incididunt. Exercitation ipsum laborum sit nulla. Nisi aute est
                et ea exercitation quis aute pariatur deserunt ut cupidatat sunt
                veniam in. Nulla ut reprehenderit reprehenderit qui voluptate
                occaecat laborum deserunt incididunt mollit.Sint aute esse elit
                cillum laboris id incididunt. Exercitation ipsum laborum sit
                nulla. Nisi aute est et ea exercitation quis aute pariatur
                deserunt ut cupidatat sunt veniam in. Nulla ut reprehenderit
                reprehenderit qui voluptate occaecat laborum deserunt incididunt
                mollit.Sint aute esse elit cillum laboris id incididunt.
                Exercitation ipsum laborum sit nulla. Nisi aute est et ea
                exercitation quis aute pariatur deserunt ut cupidatat sunt
                veniam in. Nulla ut reprehenderit reprehenderit qui voluptate
                occaecat laborum deserunt incididunt mollit.Sint aute esse elit
                cillum laboris id incididunt. Exercitation ipsum laborum sit
                nulla. Nisi aute est et ea exercitation quis aute pariatur
                deserunt ut cupidatat sunt veniam in. Nulla ut reprehenderit
                reprehenderit qui voluptate occaecat laborum deserunt incididunt
                mollit.Sint aute esse elit cillum laboris id incididunt.
                Exercitation ipsum laborum sit nulla. Nisi aute est et ea
                exercitation quis aute pariatur deserunt ut cupidatat sunt
                veniam in. Nulla ut reprehenderit reprehenderit qui voluptate
                occaecat laborum deserunt incididunt mollit.Sint aute esse elit
                cillum laboris id incididunt. Exercitation ipsum laborum sit
                nulla. Nisi aute est et ea exercitation quis aute pariatur
                deserunt ut cupidatat sunt veniam in. Nulla ut reprehenderit
                reprehenderit qui voluptate occaecat laborum deserunt incididunt
                mollit.Sint aute esse elit cillum laboris id incididunt.
                Exercitation ipsum laborum sit nulla. Nisi aute est et ea
                exercitation quis aute pariatur deserunt ut cupidatat sunt
                veniam in. Nulla ut reprehenderit reprehenderit qui voluptate
                occaecat laborum deserunt incididunt mollit.Sint aute esse elit
                cillum laboris id incididunt. Exercitation ipsum laborum sit
                nulla. Nisi aute est et ea exercitation quis aute pariatur
                deserunt ut cupidatat sunt veniam in. Nulla ut reprehenderit
                reprehenderit qui voluptate occaecat laborum deserunt incididunt
                mollit.Sint aute esse elit cillum laboris id incididunt.
                Exercitation ipsum laborum sit nulla. Nisi aute est et ea
                exercitation quis aute pariatur deserunt ut cupidatat sunt
                veniam in. Nulla ut reprehenderit reprehenderit qui voluptate
                occaecat laborum deserunt incididunt mollit.Sint aute esse elit
                cillum laboris id incididunt. Exercitation ipsum laborum sit
                nulla. Nisi aute est et ea exercitation quis aute pariatur
                deserunt ut cupidatat sunt veniam in. Nulla ut reprehenderit
                reprehenderit qui voluptate occaecat laborum deserunt incididunt
                mollit.Sint aute esse elit cillum laboris id incididunt.
                Exercitation ipsum laborum sit nulla. Nisi aute est et ea
                exercitation quis aute pariatur deserunt ut cupidatat sunt
                veniam in. Nulla ut reprehenderit reprehenderit qui voluptate
                occaecat laborum deserunt incididunt mollit.Sint aute esse elit
                cillum laboris id incididunt. Exercitation ipsum laborum sit
                nulla. Nisi aute est et ea exercitation quis aute pariatur
                deserunt ut cupidatat sunt veniam in. Nulla ut reprehenderit
                reprehenderit qui voluptate occaecat laborum deserunt incididunt
                mollit.
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gray-900">
                Sista chansen!
              </h2>
              <p className="text-gray-600">
                Dessa erbjudanden försvinner snart
              </p>
            </div>
          </div>
          <Link
            href="/marketplace?sort=time-left"
            className="text-red-600 hover:text-red-800 flex items-center font-medium transition-colors"
          >
            Se alla brådskande
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {deals.map((deal) => {
            const isUrgent = deal.timeLeft.hours < 6;
            const discount = deal.originalPrice
              ? Math.round(
                  ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
                )
              : 0;

            return (
              <Link
                key={deal.id}
                href={`/product/${deal.id}`}
                className="group"
              >
                <div
                  className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 ${
                    isUrgent
                      ? 'border-red-200 ring-2 ring-red-100'
                      : 'border-orange-200'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={
                        deal.imageUrl || '/placeholder.svg?height=200&width=400'
                      }
                      alt={deal.title}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />

                    {/* Countdown overlay */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-bold ${
                        isUrgent ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                      }`}
                    >
                      🔥
                      {deal.timeLeft.hours.toString().padStart(2, '0')}:
                      {deal.timeLeft.minutes.toString().padStart(2, '0')}:
                      {deal.timeLeft.seconds.toString().padStart(2, '0')}
                    </div>

                    {discount > 0 && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {deal.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {deal.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="h-4 w-4 mr-1" />
                        <span>{deal.companyName}</span>
                      </div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                        {deal.category}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {deal.originalPrice && (
                          <div className="text-sm line-through text-gray-500">
                            {new Intl.NumberFormat('sv-SE', {
                              style: 'currency',
                              currency: 'SEK',
                            }).format(deal.originalPrice)}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-red-600">
                          {new Intl.NumberFormat('sv-SE', {
                            style: 'currency',
                            currency: 'SEK',
                          }).format(deal.price)}
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium group-hover:from-red-600 group-hover:to-orange-600 transition-all">
                        <ShoppingBag className="h-4 w-4 inline mr-1" />
                        Köp nu
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
