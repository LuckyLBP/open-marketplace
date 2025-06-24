'use client';

import { useParams } from 'next/navigation';
import { useDeals } from '@/hooks/useDeals';
import { Loader } from 'lucide-react';
import ProductPageLayout from '@/components/product/productPageLayout';
import ImageGallerySection from '@/components/product/imageGallerySection';
import ProductInfoSection from '@/components/product/productInfoSection';
import StockQuantitySection from '@/components/product/stockQuantitySection';
import BuyActionButtons from '@/components/product/buyActionButtons';
import ProductDetailsTabs from '@/components/product/productDetailsTab';
import RelatedProductsSection from '@/components/product/relatedProductSection';
import { useLanguage } from '@/components/language-provider';
import { TimeLeftLabel } from '@/components/deals/timeLeftLabel';

const ProductPage = () => {
  const { id } = useParams();
  const { deals, loading } = useDeals();
  const { t } = useLanguage();

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
      <div className="grid gap-8 md:grid-cols-2">
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
