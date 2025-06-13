import { Badge } from '@/components/ui/badge';
import { Store, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProductInfoSection = ({
  title,
  category,
  companyName,
  duration,
  price,
  originalPrice,
  isOnSale,
  discountPercentage,
  t,
}: any) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="bg-purple-50">
          {duration}h
        </Badge>
        <Badge variant="outline" className="bg-gray-50 capitalize">
          {t(category)}
        </Badge>
        {isOnSale && (
          <Badge className="bg-red-600 hover:bg-red-700">
            {t('Sale')} {discountPercentage}% {t('Off')}
          </Badge>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Store className="h-4 w-4 mr-1" />
        <span>{companyName}</span>
      </div>
      <div className="flex items-center mb-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn('h-4 w-4', star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-muted-foreground">(24 {t('reviews')})</span>
      </div>
      <div className="mb-6">
        {originalPrice && (
          <div className="text-sm line-through text-muted-foreground">
            {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(originalPrice)}
          </div>
        )}
        <div className={cn('text-3xl font-bold', isOnSale && 'text-red-600')}>
          {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(price)}
        </div>
      </div>
    </div>
  );
};

export default ProductInfoSection;
