'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ExternalLink } from 'lucide-react';

type BannerAdProps = {
  position: 'top' | 'bottom';
  className?: string;
};

export function BannerAd({ position, className = '' }: BannerAdProps) {
  const [ads, setAds] = useState<any[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      const now = new Date();
      const q = query(
        collection(db, 'deals'),
        where('isBoosted', '==', true),
        where('boostType', '==', 'banner'),
        where('boostStart', '<=', now),
        where('boostEnd', '>=', now),
        orderBy('boostEnd', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAds(results);
    };

    fetchAds();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (ads.length > 0) {
        setAdIndex((prev) => (prev + 1) % ads.length);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [ads]);

  const currentAd = ads[adIndex];
  if (!isVisible || !currentAd) return null;

  const discount =
    currentAd.originalPrice && currentAd.originalPrice > currentAd.price
      ? Math.round(((currentAd.originalPrice - currentAd.price) / currentAd.originalPrice) * 100)
      : 0;

  return (
    <div className={`w-full ${position === 'top' ? 'order-first' : 'order-last'} ${className}`}>
      <div className="relative bg-gradient-to-r from-black to-gray-800 overflow-hidden">
        {currentAd.imageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img src={currentAd.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="relative container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Sponsrat
              </Badge>

              <div className="text-white flex-1">
                <h3 className="font-bold text-lg mb-1">{currentAd.title}</h3>
                <p className="text-sm opacity-90 max-w-2xl">{currentAd.description}</p>
                {discount > 0 && (
                  <p className="mt-1 text-xs text-green-300 font-semibold">
                    Nu {discount}% billigare än ord. pris
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href={`/product/${currentAd.id}`}
                className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
              >
                Visa erbjudande
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-white hover:bg-white/20 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress indikator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-300 ease-linear"
            style={{
              width: `${((adIndex + 1) / (ads.length || 1)) * 100}%`,
              animation: 'progress 10s linear infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
