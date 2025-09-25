'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: 'header' | 'sidebar' | 'footer' | 'inline';
  createdAt: Date;
  updatedAt: Date;
}

interface DynamicBannerProps {
  position: Banner['position'];
  className?: string;
  maxBanners?: number;
  rounded?: boolean;
}

export default function DynamicBanner({
  position,
  className = '',
  maxBanners = 1,
  rounded = true,
}: DynamicBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const snapshot = await getDocs(
          query(
            collection(db, 'banners'),
            where('position', '==', position),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc')
          )
        );

        const bannersData = snapshot.docs.slice(0, maxBanners).map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Banner[];
        setBanners(bannersData);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [position, maxBanners]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="h-32 w-full flex items-center justify-center">
          <span className="text-gray-500 text-sm">Laddar banners...</span>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't render anything if no banners
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block group hover:opacity-90 transition-opacity duration-200"
        >
          <div
            className={`relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${
              rounded ? 'rounded-lg' : ''
            }`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                // Fallback to a placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.jpg';
              }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}

// Specialized components for different positions
export function HeaderBanner({ className = '' }: { className?: string }) {
  return (
    <DynamicBanner
      position="header"
      className={className}
      maxBanners={1}
      rounded={false}
    />
  );
}

export function SidebarBanner({ className = '' }: { className?: string }) {
  return (
    <DynamicBanner position="sidebar" className={className} maxBanners={3} />
  );
}

export function FooterBanner({ className = '' }: { className?: string }) {
  return (
    <DynamicBanner position="footer" className={className} maxBanners={2} />
  );
}

export function InlineBanner({ className = '' }: { className?: string }) {
  return (
    <DynamicBanner position="inline" className={className} maxBanners={1} />
  );
}
