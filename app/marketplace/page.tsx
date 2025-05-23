'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/components/language-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterSidebar } from '@/components/filter-sidebar';
import { ProductCard } from '@/components/product-card';
import { useMobile } from '@/hooks/use-mobile';
import { generateDummyProducts } from '@/lib/dummy-data';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number;
  imageUrl: string;
  companyId: string;
  companyName: string;
  category: string;
  subcategory?: string;
  feePercentage: number;
  expiresAt: Date;
  createdAt: Date;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
};

const categoryDisplayNames: Record<string, string> = {
  elektronik: 'Elektronik',
  mode: 'Mode',
  hemmet: 'Hemmet',
  'halsa-skonhet': 'Hälsa & Skönhet',
  'hobby-fritid': 'Hobby & Fritid',
  other: 'Annat',
};

export default function Marketplace() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useMobile();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const searchParams = useSearchParams();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [selectedDurations, setSelectedDurations] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortOption, setSortOption] = useState('newest');
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Get category and subcategory from URL
  useEffect(() => {
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');

    if (category) {
      setSelectedCategory(category);
    }

    if (subcategory) {
      setSelectedSubcategory(subcategory);
    }

    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const now = Timestamp.now();

        // Check if we need to generate dummy data
        await generateDummyProducts();

        const q = query(
          collection(db, 'deals'),
          where('expiresAt', '>', now),
          orderBy('expiresAt', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedDeals: Deal[] = [];
        const uniqueCategories = new Set<string>();
        const uniqueSubcategories = new Set<string>();
        let highestPrice = 0;

        const companyIds = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          companyIds.add(data.companyId);

          // Track categories and subcategories
          if (data.category) {
            uniqueCategories.add(data.category);
          }

          if (data.subcategory) {
            uniqueSubcategories.add(data.subcategory);
          }

          if (data.price > highestPrice) {
            highestPrice = data.price;
          }
        });

        // Fetch company names
        const companyData: Record<string, string> = {};
        for (const companyId of companyIds) {
          try {
            const companyDoc = await getDocs(
              query(
                collection(db, 'companies'),
                where('__name__', '==', companyId)
              )
            );
            if (!companyDoc.empty) {
              companyData[companyId] = companyDoc.docs[0].data().companyName;
            }
          } catch (error) {
            console.error('Error fetching company:', error);
          }
        }

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const expiresAt = data.expiresAt.toDate();
          const now = new Date();
          const diffMs = expiresAt.getTime() - now.getTime();

          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

          fetchedDeals.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            price: data.price,
            originalPrice: data.originalPrice,
            duration: data.duration,
            imageUrl: data.imageUrl,
            companyId: data.companyId,
            companyName: companyData[data.companyId] || 'Unknown Company',
            category: data.category || 'other',
            subcategory: data.subcategory || null,
            feePercentage: data.feePercentage,
            expiresAt: expiresAt,
            createdAt: data.createdAt?.toDate() || new Date(),
            timeLeft: {
              hours,
              minutes,
              seconds,
            },
          });
        });

        // Set the max price for the filter
        setMaxPrice(Math.ceil(highestPrice / 100) * 100 || 10000);
        setPriceRange([0, Math.ceil(highestPrice / 100) * 100 || 10000]);

        // Set categories and subcategories
        setCategories(Array.from(uniqueCategories));
        setSubcategories(Array.from(uniqueSubcategories));

        setDeals(fetchedDeals);
        setFilteredDeals(fetchedDeals);
      } catch (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: t('Error'),
          description: t('Failed to load deals. Please try again.'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();

    // Update countdown every second
    const interval = setInterval(() => {
      setDeals((prevDeals) =>
        prevDeals
          .map((deal) => {
            const now = new Date();
            const diffMs = deal.expiresAt.getTime() - now.getTime();

            if (diffMs <= 0) {
              return {
                ...deal,
                timeLeft: { hours: 0, minutes: 0, seconds: 0 },
              };
            }

            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            return {
              ...deal,
              timeLeft: { hours, minutes, seconds },
            };
          })
          .filter((deal) => {
            const now = new Date();
            return deal.expiresAt.getTime() > now.getTime();
          })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [t, toast]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...deals];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (deal) =>
          deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((deal) => deal.category === selectedCategory);

      // Apply subcategory filter if a subcategory is selected
      if (selectedSubcategory) {
        filtered = filtered.filter(
          (deal) => deal.subcategory === selectedSubcategory
        );
      }
    }

    // Apply duration filter
    if (selectedDurations.length > 0) {
      filtered = filtered.filter((deal) =>
        selectedDurations.includes(deal.duration)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (deal) => deal.price >= priceRange[0] && deal.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'time-left':
        filtered.sort((a, b) => {
          const aTimeLeft =
            a.timeLeft.hours * 3600 +
            a.timeLeft.minutes * 60 +
            a.timeLeft.seconds;
          const bTimeLeft =
            b.timeLeft.hours * 3600 +
            b.timeLeft.minutes * 60 +
            b.timeLeft.seconds;
          return aTimeLeft - bTimeLeft;
        });
        break;
      default:
        break;
    }

    setFilteredDeals(filtered);
  }, [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedDurations,
    priceRange,
    sortOption,
    deals,
  ]);

  const handleBuyNow = (dealId: string) => {
    router.push(`/product/${dealId}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory when category changes

    // Update URL when category changes
    const params = new URLSearchParams();
    if (category !== 'all') {
      params.set('category', category);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    const newUrl = `/marketplace${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    router.push(newUrl);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);

    // Update URL when subcategory changes
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    params.set('subcategory', subcategory);
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    const newUrl = `/marketplace${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    router.push(newUrl);
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDurations((prev) => {
      if (prev.includes(duration)) {
        return prev.filter((d) => d !== duration);
      } else {
        return [...prev, duration];
      }
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    setSelectedDurations([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery('');

    // Clear URL params
    router.push('/marketplace');
  };

  // To show a category label in the UI
  const getCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Alla kategorier';

    return (
      categoryDisplayNames[selectedCategory] ||
      selectedCategory
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {selectedCategory !== 'all' ? getCategoryLabel() : t('Marknadsplats')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {selectedCategory !== 'all' && selectedSubcategory
              ? `Bläddrar i ${selectedSubcategory} inom ${getCategoryLabel()}`
              : t(
                  'Utforska vår marknadsplats för exklusiva erbjudanden med begränsad tid. Klockan tickar!'
                )}
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs
            value={sortOption}
            onValueChange={setSortOption}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="newest">{t('Senaste')}</TabsTrigger>
              <TabsTrigger value="price-asc">
                {t('Pris: Lågt till Högt')}
              </TabsTrigger>
              <TabsTrigger value="price-desc">
                {t('Pris: Högt till Lågt')}
              </TabsTrigger>
              <TabsTrigger value="time-left">{t('Tid kvar')}</TabsTrigger>
            </TabsList>
          </Tabs>

          {isMobile && (
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isMobile && (
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            maxPrice={maxPrice}
            onPriceRangeChange={handlePriceRangeChange}
            durations={[12, 24, 48]}
            selectedDurations={selectedDurations}
            onDurationChange={handleDurationChange}
            onClearFilters={handleClearFilters}
            onApplyFilters={() => {}}
            isMobile={true}
            subcategories={subcategories}
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={handleSubcategoryChange}
          />
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {!isMobile && (
            <div className="w-64 shrink-0">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                maxPrice={maxPrice}
                onPriceRangeChange={handlePriceRangeChange}
                durations={[12, 24, 48]}
                selectedDurations={selectedDurations}
                onDurationChange={handleDurationChange}
                onClearFilters={handleClearFilters}
                onApplyFilters={() => {}}
                subcategories={subcategories}
                selectedSubcategory={selectedSubcategory}
                onSubcategoryChange={handleSubcategoryChange}
              />
            </div>
          )}

          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredDeals.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDeals.map((deal) => (
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
                    timeLeft={deal.timeLeft}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">
                  {t('Inga produkter hittades')}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery ||
                  selectedCategory !== 'all' ||
                  selectedDurations.length > 0 ||
                  priceRange[0] > 0 ||
                  priceRange[1] < maxPrice
                    ? t(
                        'Inga produkter matchar dina filter. Försök att ändra dina sökkriterier.'
                      )
                    : t(
                        'Det finns inga aktiva erbjudanden just nu. Kom tillbaka senare.'
                      )}
                </p>
                {(searchQuery ||
                  selectedCategory !== 'all' ||
                  selectedDurations.length > 0 ||
                  priceRange[0] > 0 ||
                  priceRange[1] < maxPrice) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleClearFilters}
                  >
                    {t('Rensa filter')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
