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

  const filtered = (deals || []).filter((d: any) => {
    if (typeof d?.inStock === 'undefined' && typeof d?.stockQuantity === 'undefined') return true;

    const inStock = d?.inStock !== false;
    const qtyOk = (d?.stockQuantity ?? 0) > 0;
    return inStock && qtyOk;
  });

  if (!loading && filtered.length === 0) return null;

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
          : filtered.map((deal: any) => (
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
              stockQuantity={deal.stockQuantity}
              inStock={deal.inStock}
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
