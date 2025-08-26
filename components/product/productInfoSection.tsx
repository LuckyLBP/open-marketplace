import { Store, Check } from 'lucide-react';
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
  inStock,
  stockQuantity,
  t,
}: any) => {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold leading-tight mb-1">{title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Store className="h-4 w-4 mr-2" />
            <span>{companyName}</span>
          </div>
          <div className="hidden sm:block">•</div>
          <div className="text-sm">{duration}h</div>
          <div className="text-sm">• {t(category)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div>
          {originalPrice && (
            <div className="text-sm text-muted-foreground line-through mb-1">
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: 'SEK',
              }).format(originalPrice)}
            </div>
          )}

          <div className={cn('text-2xl font-bold', isOnSale && 'text-red-600')}>
            {new Intl.NumberFormat('sv-SE', {
              style: 'currency',
              currency: 'SEK',
            }).format(price)}
          </div>

          {isOnSale && (
            <div className="mt-2 inline-flex items-center rounded-full bg-red-50 text-red-700 px-3 py-0.5 text-sm font-medium">
              {discountPercentage}% {t('Billigare')}
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>{t('Säker betalning')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>{t('Snabb och skyddad checkout')}</span>
            </div>
          </div>
        </div>

        <div className="ml-4">
          {inStock ? (
            <div className="inline-flex items-center rounded-full bg-green-50 text-green-800 px-3 py-1 text-sm font-medium">
              {t('I lager')} • {stockQuantity ?? 0} {t('kvar')}
            </div>
          ) : (
            <div className="inline-flex items-center rounded-full bg-red-50 text-red-800 px-3 py-1 text-sm font-medium">
              {t('Slut i lager')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfoSection;
