'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Clock, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';

interface FloatingAdProps {
  className?: string;
}

interface FloatingAd {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  link: string;
  timeLeft: string;
  tag: string;
  tagColor: string;
}

export function FloatingAd({ className = '' }: FloatingAdProps) {
  const { t } = useLanguage();
  const [ads, setAds] = useState<FloatingAd[]>([]);
  const [currentAd, setCurrentAd] = useState<FloatingAd | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      const now = Timestamp.now();
      const q = query(
        collection(db, 'deals'),
        where('isBoosted', '==', true),
        where('boostType', '==', 'floating'),
        where('boostEnd', '>', now),
        orderBy('boostEnd', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const results: FloatingAd[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const expiresAt = data.boostEnd.toDate();
        const nowDate = new Date();
        const timeDiff = Math.max(0, expiresAt.getTime() - nowDate.getTime());
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        return {
          id: docSnap.id,
          title: data.title,
          subtitle: data.description || '',
          price: data.price,
          originalPrice: data.originalPrice || null,
          imageUrl: data.imageUrl || data.images?.[0]?.url || '',
          link: `/product/${docSnap.id}`,
          timeLeft: `${hours}h ${minutes}m`,
          tag: 'BOOST',
          tagColor: 'bg-gradient-to-r from-rose-500 to-pink-500',
        };
      });

      setAds(results);
      setCurrentAd(results[0] || null);
    };

    fetchAds();
  }, []);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      if (ads.length > 0) setIsVisible(true);
    }, 1500);

    const rotateTimer = setInterval(() => {
      if (ads.length > 0) {
        setAdIndex((prev) => (prev + 1) % ads.length);
      }
    }, 6000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(rotateTimer);
    };
  }, [ads]);

  useEffect(() => {
    if (ads.length > 0) setCurrentAd(ads[adIndex]);
  }, [adIndex, ads]);

  if (!isVisible || !currentAd) return null;

  const discount = currentAd.originalPrice
    ? Math.round(((currentAd.originalPrice - currentAd.price) / currentAd.originalPrice) * 100)
    : 0;

  return (
    <div className={`fixed bottom-4 left-4 z-50 hidden lg:block ${className}`}>
      <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-500 hover:scale-105">
        <div className={`${currentAd.tagColor} text-white px-4 py-2 text-center relative`}>
          <div className="flex items-center justify-center">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="font-bold text-sm uppercase tracking-wide">
              {currentAd.tag} ERBJUDANDE
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={currentAd.imageUrl}
                alt={currentAd.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-gray-900 truncate">
                    {currentAd.title}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {currentAd.subtitle}
                  </p>
                </div>

                {discount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs ml-2 flex-shrink-0">
                    -{discount}%
                  </Badge>
                )}
              </div>

              <div className="mb-2">
                {currentAd.originalPrice && (
                  <div className="text-xs line-through text-gray-500">
                    {new Intl.NumberFormat('sv-SE', {
                      style: 'currency',
                      currency: 'SEK',
                    }).format(currentAd.originalPrice)}
                  </div>
                )}
                <div className="text-lg font-bold text-red-600">
                  {new Intl.NumberFormat('sv-SE', {
                    style: 'currency',
                    currency: 'SEK',
                  }).format(currentAd.price)}
                </div>
              </div>

              <div className="flex items-center text-xs text-orange-600 mb-3">
                <Clock className="h-3 w-3 mr-1" />
                <span className="font-medium">
                  Endast {currentAd.timeLeft} kvar!
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Link href={currentAd.link} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Köp nu
              </Button>
            </Link>

            <Link href={currentAd.link}>
              <Button variant="outline" className="px-4 text-sm">
                <TrendingUp className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100">
          <span className="text-xs text-gray-400">Sponsrat innehåll</span>
        </div>
      </div>
    </div>
  );
}