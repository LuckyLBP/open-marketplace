'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Clock, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

type FloatingAdProps = {
  className?: string;
};

type FloatingAd = {
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
};

// Mock floating ads - premium placements
const floatingAds: FloatingAd[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max',
    subtitle: 'Senaste modellen med titanium',
    price: 12999,
    originalPrice: 15999,
    imageUrl:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=60',
    link: '/product/premium-iphone',
    timeLeft: '2h 15m',
    tag: 'PREMIUM',
    tagColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  },
  {
    id: '2',
    title: 'MacBook Pro M3',
    subtitle: '14" med M3-chip',
    price: 19999,
    originalPrice: 24999,
    imageUrl:
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&auto=format&fit=crop&q=60',
    link: '/product/macbook-pro-m3',
    timeLeft: '5h 43m',
    tag: 'EXKLUSIV',
    tagColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
];

export function FloatingAd({ className = '' }: FloatingAdProps) {
  const { t } = useLanguage();
  const [currentAd, setCurrentAd] = useState<FloatingAd>(floatingAds[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  // Show ad after 3 seconds, rotate every 15 seconds
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    const rotateTimer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % floatingAds.length);
    }, 15000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(rotateTimer);
    };
  }, []);

  useEffect(() => {
    setCurrentAd(floatingAds[adIndex]);
  }, [adIndex]);

  if (!isVisible) {
    return null;
  }

  const discount = currentAd.originalPrice
    ? Math.round(
        ((currentAd.originalPrice - currentAd.price) /
          currentAd.originalPrice) *
          100
      )
    : 0;

  return (
    <div className={`fixed bottom-4 left-4 z-50 hidden lg:block ${className}`}>
      <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-500 hover:scale-105">
        {/* Premium Badge */}
        <div
          className={`${currentAd.tagColor} text-white px-4 py-2 text-center relative`}
        >
          <div className="flex items-center justify-center">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="font-bold text-sm uppercase tracking-wide">
              {currentAd.tag} ERBJUDANDE
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={currentAd.imageUrl}
                alt={currentAd.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
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

              {/* Price */}
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

              {/* Time left */}
              <div className="flex items-center text-xs text-orange-600 mb-3">
                <Clock className="h-3 w-3 mr-1" />
                <span className="font-medium">
                  Endast {currentAd.timeLeft} kvar!
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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

        {/* Sponsored label */}
        <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100">
          <span className="text-xs text-gray-400">Sponsrat innehåll</span>
        </div>
      </div>
    </div>
  );
}
