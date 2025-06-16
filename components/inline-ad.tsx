'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Star,
  Flame,
  ShoppingCart,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  X,
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

type InlineAdProps = {
  className?: string;
  adSlot:
    | 'homepage-middle'
    | 'homepage-bottom'
    | 'categories-after'
    | 'deals-between';
};

type InlineAdData = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  companyName: string;
  timeLeft?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  isSponsored?: boolean;
};

export function InlineAd({ className = '', adSlot }: InlineAdProps) {
  const { t } = useLanguage();
  const [ad, setAd] = useState<InlineAdData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsoredDeal = async () => {
      try {
        const now = Timestamp.now();

        // Fetch a high-value deal for the inline ad
        const q = query(
          collection(db, 'deals'),
          where('expiresAt', '>', now),
          orderBy('price', 'desc'), // Highest priced items for premium ads
          limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          const data = docSnapshot.data();

          // Fetch company name
          let companyName = 'BudFynd.se';
          if (data.companyId) {
            try {
              const companyDocRef = doc(db, 'companies', data.companyId);
              const companyDoc = await getDoc(companyDocRef);
              if (companyDoc.exists()) {
                companyName = companyDoc.data().companyName || 'BudFynd.se';
              }
            } catch (error) {
              console.error('Error fetching company:', error);
            }
          }

          // Calculate time left
          const expiresAt = data.expiresAt.toDate();
          const diffMs = expiresAt.getTime() - new Date().getTime();

          let timeLeft = undefined;
          if (diffMs > 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            timeLeft = { hours, minutes, seconds };
          }

          setAd({
            id: docSnapshot.id,
            title: data.title,
            description: data.description,
            price: data.price,
            originalPrice: data.originalPrice,
            imageUrl: data.imageUrl,
            category: data.category || 'other',
            companyName,
            timeLeft,
            isSponsored: true,
          });
        }
      } catch (error) {
        console.error('Error fetching sponsored deal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsoredDeal();
  }, [adSlot]);

  // Update countdown every second if there's a time limit
  useEffect(() => {
    if (!ad || !ad.timeLeft) return;

    const interval = setInterval(() => {
      setAd((prevAd) => {
        if (!prevAd || !prevAd.timeLeft) return prevAd;

        const totalMs =
          prevAd.timeLeft.hours * 3600000 +
          prevAd.timeLeft.minutes * 60000 +
          prevAd.timeLeft.seconds * 1000;
        const newTotalMs = totalMs - 1000;

        if (newTotalMs <= 0) {
          return null; // Remove expired ad
        }

        const hours = Math.floor(newTotalMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (newTotalMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((newTotalMs % (1000 * 60)) / 1000);

        return {
          ...prevAd,
          timeLeft: { hours, minutes, seconds },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ad]);

  const handleAdClick = () => {
    // Track ad click
    console.log(`Inline ad clicked: ${ad?.id} in slot: ${adSlot}`);
  };

  if (loading || !ad || !isVisible) {
    return null;
  }

  const discount = ad.originalPrice
    ? Math.round(((ad.originalPrice - ad.price) / ad.originalPrice) * 100)
    : 0;

  // Get background colors based on category
  const getCategoryColors = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      electronics: { bg: 'from-blue-600 to-purple-700', text: 'text-white' },
      fashion: { bg: 'from-pink-500 to-rose-600', text: 'text-white' },
      home: { bg: 'from-green-600 to-emerald-700', text: 'text-white' },
      cars: { bg: 'from-slate-900 to-black', text: 'text-white' },
      sports: { bg: 'from-orange-500 to-red-600', text: 'text-white' },
      books: { bg: 'from-amber-600 to-yellow-700', text: 'text-white' },
      other: { bg: 'from-indigo-600 to-blue-700', text: 'text-white' },
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const categoryColors = getCategoryColors(ad.category);

  return (
    <div className={`w-full my-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Sponsored Label */}
        <div className="flex justify-center mb-4">
          <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
            <Star className="h-3 w-3 mr-1" />
            Sponsrat innehåll
          </Badge>
        </div>

        {/* Ad Content */}
        <div
          className={`relative bg-gradient-to-r ${categoryColors.bg} rounded-2xl overflow-hidden shadow-2xl`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />

          <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
            {/* Content */}
            <div className={`${categoryColors.text} space-y-6`}>
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    <Flame className="h-3 w-3 mr-1" />
                    Exklusivt erbjudande
                  </Badge>
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      Spara {discount}%
                    </Badge>
                  )}
                  {ad.timeLeft && (
                    <Badge className="bg-red-600 text-white font-mono">
                      <Clock className="h-3 w-3 mr-1" />
                      {ad.timeLeft.hours.toString().padStart(2, '0')}:
                      {ad.timeLeft.minutes.toString().padStart(2, '0')}:
                      {ad.timeLeft.seconds.toString().padStart(2, '0')}
                    </Badge>
                  )}
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {ad.title}
                </h2>

                <p className="text-lg opacity-90 leading-relaxed line-clamp-3">
                  {ad.description}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                {ad.originalPrice && (
                  <div className="text-lg line-through opacity-75">
                    {new Intl.NumberFormat('sv-SE', {
                      style: 'currency',
                      currency: 'SEK',
                    }).format(ad.originalPrice)}
                  </div>
                )}
                <div className="text-4xl font-bold">
                  {new Intl.NumberFormat('sv-SE', {
                    style: 'currency',
                    currency: 'SEK',
                  }).format(ad.price)}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span>{ad.companyName}</span>
                <span>•</span>
                <span className="capitalize">{ad.category}</span>
                <span>•</span>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>Populärt val</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href={`/product/${ad.id}`}
                  onClick={handleAdClick}
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Köp nu
                  </Button>
                </Link>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    className={`${categoryColors.text} hover:bg-white/20 backdrop-blur-sm px-6 py-6 rounded-full`}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    className={`${categoryColors.text} hover:bg-white/20 backdrop-blur-sm px-6 py-6 rounded-full`}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="aspect-video lg:aspect-square rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                <img
                  src={ad.imageUrl || '/placeholder.svg?height=400&width=400'}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />

                {/* Overlay badges */}
                <div className="absolute top-4 right-4 space-y-2">
                  <Badge className="bg-white/90 text-gray-900">
                    <Eye className="h-3 w-3 mr-1" />
                    Exklusiv
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className={`absolute top-4 right-4 ${categoryColors.text} hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Ad disclaimer */}
        <div className="text-center mt-4">
          <span className="text-xs text-gray-400">
            Detta är sponsrat innehåll
          </span>
        </div>
      </div>
    </div>
  );
}
