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
import { Clock, ShoppingCart, Heart, Store } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';
import { TimeLeftLabel } from '@/components/deals/timeLeftLabel';


type ProductCardProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number; // Added original price for sale calculation
  imageUrl: string;
  category: string;
  companyName: string;
  duration: number;
  expiresAt: Date;
  onBuyNow: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
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
}: ProductCardProps) {
  const { t } = useLanguage();

  // Calculate discount percentage if original price exists
  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const isOnSale = originalPrice && originalPrice > price;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col group relative">
      <Link href={`/product/${id}`} className="group relative">
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl || '/placeholder.svg?height=200&width=400'}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        {isOnSale && (
          <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700">
            -{discountPercentage}%
          </Badge>
        )}
      </Link>
      <CardHeader className="pb-2 pt-3">
        <div className="flex flex-col">
          <div className="flex justify-start gap-1.5 mb-2">
            <Badge
              variant="outline"
              className="bg-purple-50 whitespace-nowrap text-xs"
            >
              {duration}h
            </Badge>
            <Badge variant="outline" className="bg-gray-50 capitalize text-xs">
              {t(category.charAt(0).toUpperCase() + category.slice(1))}
            </Badge>
          </div>
          <div>
            <Link href={`/product/${id}`}>
              <CardTitle className="text-base hover:text-purple-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                {title}
              </CardTitle>
            </Link>
            <div className="flex items-center mt-1">
              <Store className="h-3 w-3 mr-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{companyName}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-0 flex-grow flex flex-col">
        <p className="text-xs text-muted-foreground mb-auto min-h-[3rem]">
          {description}
        </p>

        <div className="flex flex-col mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <TimeLeftLabel expiresAt={expiresAt} /> {/* ✅ korrekt komponent används */}
            </div>
            <div className="text-right">
              {isOnSale && (
                <div className="text-xs line-through text-muted-foreground">
                  {new Intl.NumberFormat('sv-SE', {
                    style: 'currency',
                    currency: 'SEK',
                  }).format(originalPrice)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div
              className={cn(
                'text-lg font-bold',
                isOnSale ? 'text-red-600' : 'text-purple-600'
              )}
            >
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: 'SEK',
              }).format(price)}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 flex gap-2">
        <Button
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-8 text-sm"
          onClick={() => onBuyNow(id)}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          {t('Buy Now')}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full border-purple-200 hover:bg-purple-50"
          onClick={() => onAddToWishlist && onAddToWishlist(id)}
        >
          <Heart className="h-3.5 w-3.5 text-purple-600" />
          <span className="sr-only">{t('Add to Wishlist')}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}