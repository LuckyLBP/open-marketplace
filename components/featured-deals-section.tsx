'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  limit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  duration: number;
  imageUrl: string;
  category: string;
  companyName: string;
  expiresAt: Date;
  stockQuantity?: number;
  inStock?: boolean;
};

export function FeaturedDealsSection() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleProductClick = (id: string) => {
    router.push(`/product/${id}`);
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => checkScrollButtons();
    const handleResize = () => checkScrollButtons();

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);

      // Initial check
      setTimeout(checkScrollButtons, 100);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [deals]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, 'deals'),
          where('status', '==', 'approved'),
          where('expiresAt', '>', now), // Filter out expired products
          orderBy('expiresAt', 'asc'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const fetchedDeals: Deal[] = [];

        const companyIds = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.companyId) companyIds.add(data.companyId);
        });

        const companyData: Record<string, string> = {};
        for (const companyId of companyIds) {
          try {
            const companyDoc = await getDoc(doc(db, 'companies', companyId));
            if (companyDoc.exists()) {
              companyData[companyId] =
                companyDoc.data().companyName || 'BudFynd.se';
            }
          } catch (error) {
            console.error('Error fetching company:', error);
          }
        }

        const nowDate = new Date();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const expiresAt = data.expiresAt.toDate();
          const timeDiff = expiresAt.getTime() - nowDate.getTime();

          // Only include non-expired deals
          if (timeDiff > 0) {
            fetchedDeals.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              price: data.price,
              originalPrice: data.originalPrice,
              duration: data.duration || Math.ceil(timeDiff / (1000 * 60 * 60)),
              imageUrl: data.imageUrl,
              category: data.category || 'other',
              companyName: companyData[data.companyId] || 'BudFynd.se',
              expiresAt,
              stockQuantity: data.stockQuantity,
              inStock: data.inStock,
            });
          }
        });

        const visible = fetchedDeals.filter(
          (d) => d.inStock !== false && (d.stockQuantity ?? 0) > 0
        );

        setDeals(visible);
      } catch (error) {
        console.error('Error fetching latest products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  if (loading || deals.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Senaste produkter
        </h2>
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors hidden md:flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors hidden md:flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            onScroll={checkScrollButtons}
          >
            {deals.map((deal) => (
              <div key={deal.id} className="flex-shrink-0 w-56">
                <ProductCard
                  id={deal.id}
                  title={deal.title}
                  description={deal.description}
                  price={deal.price}
                  originalPrice={deal.originalPrice || undefined}
                  imageUrl={deal.imageUrl}
                  category={deal.category}
                  companyName={deal.companyName}
                  duration={deal.duration}
                  expiresAt={deal.expiresAt}
                  stockQuantity={deal.stockQuantity}
                  inStock={deal.inStock}
                  onAddToWishlist={() => {}}
                  onBuyNow={() => handleProductClick(deal.id)}
                  compact={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
