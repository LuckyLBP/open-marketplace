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
import { ShoppingCart, Heart, Store } from 'lucide-react';
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
  const soldOut = (inStock === false) || ((stockQuantity ?? 0) <= 0);

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-lg flex flex-col group relative',
        compact ? 'text-sm' : 'h-full',
        soldOut ? 'opacity-75' : ''
      )}
    >
      <Link href={`/product/${id}`} className="group relative block">
        <div className="relative w-full bg-gray-100 aspect-[2/1] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg?height=200&width=400';
            }}
          />
          <div className="absolute top-2 left-2">
            <TimeLeftLabel expiresAt={expiresAt} />
          </div>

          {isOnSale && (
            <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
              -{discountPercentage}%
            </Badge>
          )}

          {/* 🔽 Slut i lager-badge */}
          {soldOut && (
            <Badge className="absolute bottom-2 left-2 bg-red-600 hover:bg-red-700">
              {t('Slut i lager')}
            </Badge>
          )}
        </div>
      </Link>

      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex justify-start gap-2 mb-2">
          <Badge variant="outline" className="bg-purple-50 text-xs">
            {duration}h
          </Badge>
          <Badge variant="outline" className="bg-gray-50 capitalize text-xs">
            {t(category.charAt(0).toUpperCase() + category.slice(1))}
          </Badge>
        </div>
        <Link href={`/product/${id}`}>
          <CardTitle className="text-base line-clamp-2 hover:text-purple-600 transition-colors min-h-[2.5rem]">
            {title}
          </CardTitle>
        </Link>
        <div className="flex items-center mt-1">
          <Store className="h-3 w-3 mr-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{companyName}</p>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col px-4 pt-0 pb-3">
        <p className="text-xs text-muted-foreground mb-auto min-h-[3rem]">
          {description}
        </p>
        {isOnSale && (
          <div className="text-xs line-through text-muted-foreground text-left mt-2">
            {new Intl.NumberFormat('sv-SE', {
              style: 'currency',
              currency: 'SEK',
            }).format(originalPrice)}
          </div>
        )}
        <div className="text-lg font-bold mt-1 text-purple-600">
          {new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK',
          }).format(price)}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 px-4 pb-4 pt-2">
        <Button
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-8 text-sm"
          onClick={() => onBuyNow(id)}
          disabled={soldOut}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          {soldOut ? t('Slut i lager') : t('Buy Now')}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full border-purple-200 hover:bg-purple-50"
          onClick={() => onAddToWishlist && onAddToWishlist(id)}
          disabled={soldOut}
        >
          <Heart className="h-3.5 w-3.5 text-purple-600" />
          <span className="sr-only">{t('Add to Wishlist')}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
