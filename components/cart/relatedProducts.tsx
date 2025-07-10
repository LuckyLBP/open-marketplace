'use client';

import React from 'react';
import { useCartContext } from '@/components/cart/cartProvider';
import { useRelatedDeals } from '@/hooks/useRelatedDeals';
import { ProductCard } from '@/components/product-card';

export const RelatedProductsSection = () => {
  const { cartItems } = useCartContext();

  if (!cartItems || cartItems.length === 0) return null;

  const baseProduct = cartItems[0]; // välj första produktens kategori/subkategori
  const { category, subcategory, id: excludeId } = baseProduct;

  const { deals, loading } = useRelatedDeals(category, subcategory, excludeId);

  if (loading || deals.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Relaterade produkter
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {deals.map((deal) => (
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
              onBuyNow={() => { }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
