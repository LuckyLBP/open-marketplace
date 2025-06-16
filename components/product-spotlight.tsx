'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, Crown, ShoppingCart, Zap, Award } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

type ProductSpotlightProps = {
  className?: string;
};

type SpotlightProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  category: string;
  companyName: string;
  link: string;
  features: string[];
  rating: number;
  reviews: number;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  badge: {
    text: string;
    color: string;
    icon: React.ComponentType<any>;
  };
};

// Premium spotlight products - highest paying advertisers
const spotlightProducts: SpotlightProduct[] = [
  {
    id: 'spotlight-1',
    title: 'Lamborghini Huracán EVO',
    description:
      'Upplev den ultimata prestandan med Lamborghinis senaste mästerverk. Nu med 10% rabatt för första köparen.',
    price: 2890000,
    originalPrice: 3200000,
    imageUrl:
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop&q=60',
    category: 'Lyxbilar',
    companyName: 'Lamborghini Stockholm',
    link: '/product/lamborghini-huracan-evo',
    features: [
      'V10 motor',
      '630 hk',
      '0-100 km/h på 3.2s',
      'Kolfiber interiör',
    ],
    rating: 5,
    reviews: 12,
    timeLeft: { hours: 23, minutes: 45, seconds: 30 },
    badge: {
      text: 'EXKLUSIV',
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      icon: Crown,
    },
  },
  {
    id: 'spotlight-2',
    title: 'Patek Philippe Nautilus',
    description:
      'En av världens mest eftertraktade klockor. Begränsad tillgång - endast för seriösa samlare.',
    price: 850000,
    originalPrice: 950000,
    imageUrl:
      'https://images.unsplash.com/photo-1523170335258-f5c54a6d7421?w=800&auto=format&fit=crop&q=60',
    category: 'Lyxklockor',
    companyName: 'Chronos Exclusive',
    link: '/product/patek-philippe-nautilus',
    features: [
      'Automatisk urerk',
      '18k guld',
      'Safirkristall',
      'Vattentät 120m',
    ],
    rating: 5,
    reviews: 8,
    timeLeft: { hours: 47, minutes: 12, seconds: 8 },
    badge: {
      text: 'PREMIUM',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600',
      icon: Award,
    },
  },
];

export function ProductSpotlight({ className = '' }: ProductSpotlightProps) {
  const { t } = useLanguage();
  const [currentProduct, setCurrentProduct] = useState<SpotlightProduct>(
    spotlightProducts[0]
  );
  const [productIndex, setProductIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Rotate products every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProductIndex((prev) => (prev + 1) % spotlightProducts.length);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentProduct(spotlightProducts[productIndex]);
  }, [productIndex]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProduct((prev) => {
        const totalMs =
          prev.timeLeft.hours * 3600000 +
          prev.timeLeft.minutes * 60000 +
          prev.timeLeft.seconds * 1000;
        const newTotalMs = totalMs - 1000;

        if (newTotalMs <= 0) {
          return prev; // Keep the same if expired
        }

        const hours = Math.floor(newTotalMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (newTotalMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((newTotalMs % (1000 * 60)) / 1000);

        return {
          ...prev,
          timeLeft: { hours, minutes, seconds },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  const discount = Math.round(
    ((currentProduct.originalPrice - currentProduct.price) /
      currentProduct.originalPrice) *
      100
  );
  const BadgeIcon = currentProduct.badge.icon;

  return (
    <div
      className={`fixed top-1/2 right-0 transform -translate-y-1/2 z-50 hidden xl:block ${className}`}
    >
      <div className="w-96 bg-white rounded-l-3xl shadow-2xl border-l border-t border-b border-gray-200 overflow-hidden">
        {/* Premium Header */}
        <div
          className={`${currentProduct.badge.color} text-white p-4 relative`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BadgeIcon className="h-5 w-5 mr-2" />
              <span className="font-bold text-sm uppercase tracking-wide">
                {currentProduct.badge.text} SPOTLIGHT
              </span>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Discount Badge */}
          <div className="absolute -bottom-3 left-4">
            <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-bold">
              SPARA {discount}%
            </Badge>
          </div>
        </div>

        {/* Product Image */}
        <div className="relative">
          <div className="aspect-video bg-gray-100">
            <img
              src={currentProduct.imageUrl}
              alt={currentProduct.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Countdown Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg">
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-red-400" />
              <span className="font-mono">
                {currentProduct.timeLeft.hours.toString().padStart(2, '0')}:
                {currentProduct.timeLeft.minutes.toString().padStart(2, '0')}:
                {currentProduct.timeLeft.seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6 space-y-4">
          {/* Title & Rating */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
              {currentProduct.title}
            </h3>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < currentProduct.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({currentProduct.reviews} recensioner)
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3">
            {currentProduct.description}
          </p>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-900">
              Nyckelspecifikationer:
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {currentProduct.features.slice(0, 4).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-xs text-gray-600"
                >
                  <Zap className="h-3 w-3 mr-1 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <span>{currentProduct.companyName}</span>
            <span className="capitalize">{currentProduct.category}</span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="text-sm line-through text-gray-500">
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: 'SEK',
              }).format(currentProduct.originalPrice)}
            </div>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: 'SEK',
              }).format(currentProduct.price)}
            </div>
          </div>

          {/* Action Button */}
          <Link href={currentProduct.link} className="block">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Visa detaljer
            </Button>
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{
              width: `${
                ((productIndex + 1) / spotlightProducts.length) * 100
              }%`,
            }}
          />
        </div>

        {/* Sponsored Label */}
        <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Sponsrat premiuminnehåll
          </span>
        </div>
      </div>
    </div>
  );
}
