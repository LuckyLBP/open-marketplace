'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryBannerProps {
  /** The category key for the banner */
  category: string;
  /** Custom image URL (overrides default category image) */
  imageUrl?: string;
  /** Custom link (overrides default category link) */
  link?: string;
  /** Additional CSS classes */
  className?: string;
}

export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  category,
  imageUrl,
  link,
  className = '',
}) => {
  // Default values based on category
  const defaultImageUrl = `/assets/banners/categories/${category}.jpg`;
  const defaultLink = `/marketplace?category=${category}`;

  const bannerImageUrl = imageUrl || defaultImageUrl;
  const bannerLink = link || defaultLink;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{ aspectRatio: '1920/600' }}
    >
      {/* Banner Image as Link */}
      <Link href={bannerLink} className="block w-full h-full">
        <Image
          src={bannerImageUrl}
          alt={`${category} category banner`}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.jpg';
          }}
        />
      </Link>
    </div>
  );
};

export default CategoryBanner;
