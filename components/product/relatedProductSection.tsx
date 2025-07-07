'use client';

import { useRelatedDeals } from '@/hooks/useRelatedDeals';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface Props {
  t: (key: string) => string;
  category: string;
  subcategory?: string;
  excludeId?: string;
}

const RelatedProductsSection = ({ t, category, subcategory, excludeId }: Props) => {
  const router = useRouter(); 
  const { deals, loading } = useRelatedDeals(category, subcategory, excludeId);

  if (!loading && deals.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t('Relaterade produkter')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-video w-full rounded-md" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))
          : deals.map((deal) => (
            <ProductCard
              key={deal.id}
              id={deal.id}
              title={deal.title}
              description={deal.description}
              price={deal.price}
              originalPrice={deal.originalPrice}
              imageUrl={deal.imageUrl}
              category={deal.category}
              companyName={deal.companyName}
              duration={deal.duration}
              expiresAt={deal.expiresAt}
              compact
              onAddToWishlist={() => { }}
              onBuyNow={() => router.push(`/product/${deal.id}`)}
            />
          ))}
      </div>
    </div>
  );
};

export default RelatedProductsSection;
