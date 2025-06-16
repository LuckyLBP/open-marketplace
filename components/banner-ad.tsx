'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

type BannerAdProps = {
  position: 'top' | 'bottom';
  className?: string;
};

type AdBanner = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  link: string;
  backgroundColor: string;
  textColor: string;
};

// Mock banner ads - in a real app, these would come from an ads management system
const bannerAds: AdBanner[] = [
  {
    id: '1',
    title: 'Exklusiva Elektroniska-erbjudanden!',
    description: 'Upp till 70% rabatt på elektronik och mode. Begränsad tid!',
    imageUrl:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop&q=60',
    ctaText: 'Shoppa nu',
    link: '/marketplace?category=elektronik',
    backgroundColor: 'from-black to-gray-800',
    textColor: 'text-white',
  },
  {
    id: '2',
    title: 'Ny kollektionen från Premium Brands',
    description: 'Upptäck de senaste trenderna inom mode och livsstil',
    imageUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=60',
    ctaText: 'Utforska',
    link: '/marketplace?category=mode',
    backgroundColor: 'from-purple-600 to-pink-600',
    textColor: 'text-white',
  },
  {
    id: '3',
    title: 'Smarta hem-produkter med 50% rabatt',
    description: 'Automatisera ditt hem med de senaste IoT-enheterna',
    imageUrl:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=60',
    ctaText: 'Se erbjudanden',
    link: '/marketplace?category=hemmet',
    backgroundColor: 'from-blue-500 to-teal-500',
    textColor: 'text-white',
  },
];

export function BannerAd({ position, className = '' }: BannerAdProps) {
  const { t } = useLanguage();
  const [currentAd, setCurrentAd] = useState<AdBanner>(bannerAds[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [adIndex, setAdIndex] = useState(0);

  // Rotate ads every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % bannerAds.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentAd(bannerAds[adIndex]);
  }, [adIndex]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`w-full ${
        position === 'top' ? 'order-first' : 'order-last'
      } ${className}`}
    >
      <div
        className={`relative bg-gradient-to-r ${currentAd.backgroundColor} overflow-hidden`}
      >
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src={currentAd.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Sponsored Badge */}
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Sponsrat
              </Badge>

              {/* Ad Content */}
              <div className={`${currentAd.textColor} flex-1`}>
                <h3 className="font-bold text-lg mb-1">{currentAd.title}</h3>
                <p className="text-sm opacity-90 max-w-2xl">
                  {currentAd.description}
                </p>
              </div>
            </div>

            {/* CTA and Close */}
            <div className="flex items-center space-x-4">
              <a
                href={currentAd.link}
                className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
              >
                {currentAd.ctaText}
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className={`${currentAd.textColor} hover:bg-white/20 p-2`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-300 ease-linear"
            style={{
              width: `${((adIndex + 1) / bannerAds.length) * 100}%`,
              animation: 'progress 10s linear infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
