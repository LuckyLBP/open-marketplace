'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Store } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';
import { TimeLeftLabel } from '@/components/deals/timeLeftLabel';

export type ProductCardProps = {
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
  onBuyNow: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
  compact?: boolean;
  // 🔽 Nya props för lager
  stockQuantity?: number;
  inStock?: boolean;
};

export function ProductCard({
  id,
  title,
  description,
  price,
  originalPrice,
  imageUrl,
  category,
  companyName,
  duration,
  expiresAt,
  onBuyNow,
  onAddToWishlist,
  compact = false,
  stockQuantity,
  inStock,
}: ProductCardProps) {
  const { t } = useLanguage();

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const isOnSale = !!originalPrice && originalPrice > price;

  // 🔽 Slut i lager-logik
  const soldOut = inStock === false || (stockQuantity ?? 0) <= 0;
  return (
    <Card
      className={cn(
        'overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all flex flex-col group relative',
        compact ? 'text-sm max-w-[220px]' : 'text-base max-w-[300px]',
        soldOut ? 'opacity-80' : ''
      )}
    >
      {/* Image */}
      <div className="relative w-full bg-gray-50 aspect-[3/2] overflow-hidden">
        <Link href={`/product/${id}`} className="absolute inset-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg?height=200&width=400';
            }}
          />
        </Link>

        <div className="absolute top-3 left-3">
          <TimeLeftLabel expiresAt={expiresAt} />
        </div>

        {isOnSale && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Badge className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
              -{discountPercentage}%
            </Badge>
          </div>
        )}

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <Badge className="bg-red-600 text-white text-sm px-3 py-1 rounded-full">
              {t('Slut i lager')}
            </Badge>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-3 py-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-purple-50 text-[10px] px-1 py-0.5"
            >
              {duration}h
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-50 text-[10px] px-1 py-0.5 capitalize"
            >
              {t(category.charAt(0).toUpperCase() + category.slice(1))}
            </Badge>
          </div>
        </div>

        <Link href={`/product/${id}`} className="hover:underline">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
        </Link>

        <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-2">
          <Store className="h-3 w-3 text-muted-foreground" />
          <span className="truncate">{companyName}</span>
        </p>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
          {description}
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            {isOnSale && (
              <div className="text-xs text-muted-foreground line-through">
                {new Intl.NumberFormat('sv-SE', {
                  style: 'currency',
                  currency: 'SEK',
                }).format(originalPrice)}
              </div>
            )}
            <div className="text-lg font-extrabold text-purple-600">
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: 'SEK',
              }).format(price)}
            </div>
          </div>

          <div className="flex items-center">
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md px-3 py-1 text-sm flex items-center gap-2"
              onClick={() => onBuyNow(id)}
              disabled={soldOut}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">
                {soldOut ? t('Slut i lager') : t('Köp')}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
