'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselBannerProps {
  /** Custom banner configurations */
  banners?: BannerConfig[];
  /** Auto-rotate interval in milliseconds */
  autoRotateInterval?: number;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dots indicator */
  showDots?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface BannerConfig {
  id: string;
  imageUrl: string;
  link: string;
}

export const CarouselBanner: React.FC<CarouselBannerProps> = ({
  banners,
  autoRotateInterval = 5000,
  showArrows = true,
  showDots = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Default banner configurations if none provided
  const defaultBanners: BannerConfig[] = [
    {
      id: 'banner-1',
      imageUrl: '/assets/banners/header/Bocker.jpg',
      link: '/marketplace',
    },
    {
      id: 'banner-3',
      imageUrl: '/assets/banners/header/koket.jpg',
      link: '/marketplace',
    },
    {
      id: 'banner-4',
      imageUrl: '/assets/banners/header/sport-fitness.jpg',
      link: '/marketplace',
    },
  ];

  const bannerList = banners || defaultBanners;

  // Auto-rotate banners
  useEffect(() => {
    if (!isAutoRotating || bannerList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerList.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [isAutoRotating, bannerList.length, autoRotateInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? bannerList.length - 1 : prevIndex - 1
    );
    setIsAutoRotating(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerList.length);
    setIsAutoRotating(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoRotating(false);
  };

  if (bannerList.length === 0) {
    return null;
  }

  const currentBanner = bannerList[currentIndex];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{ aspectRatio: '1920/600' }}
      onMouseEnter={() => setIsAutoRotating(false)}
      onMouseLeave={() => setIsAutoRotating(true)}
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <Link href={currentBanner.link} className="block w-full h-full">
          <Image
            src={currentBanner.imageUrl}
            alt={`Banner ${currentIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            priority={currentIndex === 0}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
        </Link>
      </div>

      {/* Navigation Arrows */}
      {showArrows && bannerList.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 h-10 w-10 sm:h-12 sm:w-12"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 h-10 w-10 sm:h-12 sm:w-12"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && bannerList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {bannerList.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselBanner;
