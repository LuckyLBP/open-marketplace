'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, Flame, ShoppingCart, Eye } from 'lucide-react';
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

type SponsoredDeal = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  companyName: string;
  duration: number;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  isSponsored?: boolean;
};

type SidebarAdProps = {
  position: 'left' | 'right';
  className?: string;
};

export function SidebarAd({ position, className = '' }: SidebarAdProps) {
  const { t } = useLanguage();
  const [deals, setDeals] = useState<SponsoredDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsoredDeals = async () => {
      try {
        const now = Timestamp.now();

        // Fetch high-value deals that could be sponsored
        const q = query(
          collection(db, 'deals'),
          where('expiresAt', '>', now),
          orderBy('price', 'desc'), // Higher priced items for ads
          limit(3)
        );

        const querySnapshot = await getDocs(q);
        const fetchedDeals: SponsoredDeal[] = [];

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
                companyDoc.data().companyName || 'ClickFynd.se';
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
              imageUrl: data.imageUrl,
              category: data.category || 'other',
              companyName: companyData[data.companyId] || 'ClickFynd.se',
              duration: data.duration,
              timeLeft: { hours, minutes, seconds },
              isSponsored: true,
            });
          }
        });

        setDeals(fetchedDeals);
      } catch (error) {
        console.error('Error fetching sponsored deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsoredDeals();

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
          .filter((deal): deal is SponsoredDeal => deal !== null)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading || deals.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed ${
        position === 'left' ? 'left-4' : 'right-4'
      } top-1/2 transform -translate-y-1/2 z-40 hidden xl:block ${className}`}
    >
      <div className="w-80 space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-t-xl">
          <div className="flex items-center justify-center">
            <Flame className="h-4 w-4 mr-2" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Sponsrade erbjudanden
            </span>
          </div>
        </div>

        {/* Sponsored Deals */}
        <div className="bg-white rounded-b-xl shadow-2xl border border-gray-200 overflow-hidden">
          {deals.slice(0, 2).map((deal, index) => {
            const discount = deal.originalPrice
              ? Math.round(
                  ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
                )
              : 0;

            return (
              <div
                key={deal.id}
                className={`p-4 ${index > 0 ? 'border-t border-gray-100' : ''}`}
              >
                {/* Sponsored Badge */}
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Sponsrad
                  </Badge>
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Product Image */}
                <Link href={`/product/${deal.id}`} className="block mb-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden group">
                    <img
                      src={
                        deal.imageUrl || '/placeholder.svg?height=120&width=200'
                      }
                      alt={deal.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Countdown overlay */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                      {deal.timeLeft.hours.toString().padStart(2, '0')}:
                      {deal.timeLeft.minutes.toString().padStart(2, '0')}:
                      {deal.timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="space-y-2">
                  <Link href={`/product/${deal.id}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-purple-600 transition-colors">
                      {deal.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {deal.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{deal.companyName}</span>
                    <span className="capitalize">{deal.category}</span>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    {deal.originalPrice && (
                      <div className="text-xs line-through text-gray-500">
                        {new Intl.NumberFormat('sv-SE', {
                          style: 'currency',
                          currency: 'SEK',
                        }).format(deal.originalPrice)}
                      </div>
                    )}
                    <div className="text-lg font-bold text-red-600">
                      {new Intl.NumberFormat('sv-SE', {
                        style: 'currency',
                        currency: 'SEK',
                      }).format(deal.price)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/product/${deal.id}`} className="flex-1">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Köp nu
                      </Button>
                    </Link>
                    <Link href={`/product/${deal.id}`}>
                      <Button variant="outline" size="sm" className="px-3">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* View More Link */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <Link href="/marketplace?sponsored=true" className="block">
              <Button
                variant="ghost"
                className="w-full text-sm text-purple-600 hover:text-purple-800"
              >
                Se fler sponsrade erbjudanden →
              </Button>
            </Link>
          </div>
        </div>

        {/* Ad disclaimer */}
        <div className="text-center">
          <span className="text-xs text-gray-400">Sponsrat innehåll</span>
        </div>
      </div>
    </div>
  );
}
