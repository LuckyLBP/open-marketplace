import React from 'react';
import Image from 'next/image';

interface RoundedBannerProps {
  /** URL to the background image. If omitted a local placeholder is used. */
  imageUrl?: string;
  className?: string;
}

export const RoundedBanner: React.FC<RoundedBannerProps> = ({
  imageUrl = '/banners/bg-banner-clickfynd.jpg',
  className = '',
}) => {
  return (
    <div className="relative h-44 sm:h-56 md:h-64 lg:h-72 my-4 overflow-hidden">
      <Image
        src={imageUrl}
        alt="Promotional banner background"
        fill
        className="object-cover"
        sizes="(max-width: 640px) 1280px, (max-width: 1024px) 2048px, 2560px"
        priority
      />

      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" />

      <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
        <h2 className="max-w-4xl text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white drop-shadow-lg">
          Sveriges snabbaste väg från fynd till affär
        </h2>
      </div>
    </div>
  );
};

export default RoundedBanner;
