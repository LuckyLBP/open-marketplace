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
            {t('')} {discountPercentage}% {t('Billigare')}
          </Badge>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Store className="h-4 w-4 mr-1" />
        <span>{companyName}</span>
      </div>
      <div className="flex items-center mb-4">
       
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
