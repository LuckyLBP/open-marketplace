'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDeals } from '@/hooks/useDeals';
import { Loader, Home } from 'lucide-react';
import ProductPageLayout from '@/components/product/productPageLayout';
import ImageGallerySection from '@/components/product/imageGallerySection';
import ProductInfoSection from '@/components/product/productInfoSection';
import StockQuantitySection from '@/components/product/stockQuantitySection';
import BuyActionButtons from '@/components/product/buyActionButtons';
import ProductDetailsTabs from '@/components/product/productDetailsTab';
import RelatedProductsSection from '@/components/product/relatedProductSection';
import { useLanguage } from '@/components/language-provider';
import { TimeLeftLabel } from '@/components/deals/timeLeftLabel';
import { Button } from '@/components/ui/button';

const ProductPage = () => {
  const { id } = useParams();
  const { deals, loading } = useDeals();
  const { t } = useLanguage();
  const router = useRouter();

  const deal = deals.find((d) => d.id === id);

  const isOnSale =
    !!deal?.originalPrice && deal.originalPrice > deal.price;

  const discountPercentage =
    isOnSale && deal?.originalPrice
      ? Math.round(
        ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
      )
      : 0;

  const handleAddToWishlist = () =>
    console.log('Wishlist:', deal?.title);
  const handleShare = () =>
    navigator.clipboard.writeText(window.location.href);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );

  if (!deal)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">{t('Product Not Found')}</p>
      </div>
    );

  return (
    <ProductPageLayout>
      {/* Tillbaka till startsidan knapp */}
      <div className="container mx-auto px-4 mt-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="flex items-center text-sm text-muted-foreground hover:text-purple-600"
        >
          <Home className="h-4 w-4 mr-2" />
          Tillbaka till startsidan
        </Button>
      </div>

      {/* Produktdetaljer */}
      <div className="grid gap-8 md:grid-cols-2 px-4">
        <ImageGallerySection images={deal.images} title={deal.title} />

        <div>
          <ProductInfoSection
            title={deal.title}
            category={deal.category}
            companyName={deal.companyName}
            duration={deal.duration}
            price={deal.price}
            originalPrice={deal.originalPrice ?? undefined}
            isOnSale={isOnSale}
            discountPercentage={discountPercentage}
            t={t}
          />

          <TimeLeftLabel expiresAt={deal.expiresAt} />

          <StockQuantitySection
            inStock={deal.inStock}
            stockQuantity={deal.stockQuantity}
            t={t}
          />

          <BuyActionButtons
            t={t}
            handleAddToWishlist={handleAddToWishlist}
            handleShare={handleShare}
            deal={deal}
          />
        </div>
      </div>

      <ProductDetailsTabs
        description={deal.description}
        specifications={deal.specifications}
        t={t}
      />

      <RelatedProductsSection t={t} />
    </ProductPageLayout>
  );
};

export default ProductPage;
