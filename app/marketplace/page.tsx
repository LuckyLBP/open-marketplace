'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/language-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterSidebar } from '@/components/filter-sidebar';
import { ProductCard } from '@/components/product-card';
import { useMobile } from '@/hooks/use-mobile';
import { useDeals, Deal } from '@/hooks/useDeals';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const categoryDisplayNames: Record<string, string> = {
  elektronik: 'Elektronik',
  mode: 'Mode',
  hemmet: 'Hemmet',
  'halsa-skonhet': 'Hälsa & Skönhet',
  'hobby-fritid': 'Hobby & Fritid',
  other: 'Annat',
};

export default function Marketplace() {
  const t = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useMobile();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedDurations, setSelectedDurations] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortOption, setSortOption] = useState('newest');
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  const { deals, loading } = useDeals({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    subcategory: selectedSubcategory || undefined,
    onlyActive: true,
  });

  useEffect(() => {
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');

    if (category) setSelectedCategory(category);
    if (subcategory) setSelectedSubcategory(subcategory);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    const uniqueCategories = new Set<string>();
    const uniqueSubcategories = new Set<string>();
    let highestPrice = 0;

    deals.forEach((deal) => {
      if (deal.category) uniqueCategories.add(deal.category);
      if (deal.subcategory) uniqueSubcategories.add(deal.subcategory);
      if (deal.price > highestPrice) highestPrice = deal.price;
    });

    setCategories(Array.from(uniqueCategories));
    setSubcategories(Array.from(uniqueSubcategories));
    setMaxPrice(Math.ceil(highestPrice / 100) * 100 || 10000);

    if (priceRange[1] !== Math.ceil(highestPrice / 100) * 100 && highestPrice > 0) {
      setPriceRange([0, Math.ceil(highestPrice / 100) * 100]);
    }
  }, [deals]);

  useEffect(() => {
    let filtered = [...deals];

    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (deal) =>
          deal.title.toLowerCase().includes(lowerSearch) ||
          deal.description.toLowerCase().includes(lowerSearch) ||
          (deal.companyName?.toLowerCase().includes(lowerSearch) ?? false)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((deal) => deal.category === selectedCategory);

      if (selectedSubcategory) {
        filtered = filtered.filter((deal) => deal.subcategory === selectedSubcategory);
      }
    }

    if (selectedDurations.length > 0) {
      filtered = filtered.filter((deal) => selectedDurations.includes(deal.duration));
    }

    filtered = filtered.filter(
      (deal) => deal.price >= priceRange[0] && deal.price <= priceRange[1]
    );

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
            a.timeLeft.hours * 3600 + a.timeLeft.minutes * 60 + a.timeLeft.seconds;
          const bTimeLeft =
            b.timeLeft.hours * 3600 + b.timeLeft.minutes * 60 + b.timeLeft.seconds;
          return aTimeLeft - bTimeLeft;
        });
        break;
    }

   
    setFilteredDeals(filtered);

  }, [
    deals,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedDurations,
    priceRange,
    sortOption,
  ]);


  const handleBuyNow = (dealId: string) => {
    router.push(`/product/${dealId}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);

    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (searchQuery) params.set('search', searchQuery);

    router.push(`/marketplace?${params.toString()}`);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);

    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    params.set('subcategory', subcategory);
    if (searchQuery) params.set('search', searchQuery);

    router.push(`/marketplace?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    setSelectedDurations([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery('');

    router.push('/marketplace');
  };

  const getCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Alla kategorier';
    return categoryDisplayNames[selectedCategory] || selectedCategory;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {selectedCategory !== 'all' ? getCategoryLabel() : t.t('Marknadsplats')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {selectedCategory !== 'all' && selectedSubcategory
              ? `Bläddrar i ${selectedSubcategory} inom ${getCategoryLabel()}`
              : t.t('Utforska vår marknadsplats för exklusiva erbjudanden med begränsad tid. Klockan tickar!')}
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs value={sortOption} onValueChange={setSortOption} className="w-auto">
            <TabsList>
              <TabsTrigger value="newest">{t.t('Senaste')}</TabsTrigger>
              <TabsTrigger value="price-asc">{t.t('Pris: Lågt till Högt')}</TabsTrigger>
              <TabsTrigger value="price-desc">{t.t('Pris: Högt till Lågt')}</TabsTrigger>
              <TabsTrigger value="time-left">{t.t('Tid kvar')}</TabsTrigger>
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
            onPriceRangeChange={setPriceRange}
            durations={[12, 24, 48]}
            selectedDurations={selectedDurations}
            onDurationChange={(d) => {
              if (selectedDurations.includes(d)) {
                setSelectedDurations(selectedDurations.filter(x => x !== d));
              } else {
                setSelectedDurations([...selectedDurations, d]);
              }
            }}
            onClearFilters={handleClearFilters}
            onApplyFilters={() => { }}
            isMobile
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
                onPriceRangeChange={setPriceRange}
                durations={[12, 24, 48]}
                selectedDurations={selectedDurations}
                onDurationChange={(d) => {
                  if (selectedDurations.includes(d)) {
                    setSelectedDurations(selectedDurations.filter(x => x !== d));
                  } else {
                    setSelectedDurations([...selectedDurations, d]);
                  }
                }}
                onClearFilters={handleClearFilters}
                onApplyFilters={() => { }}
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
                    imageUrl={deal.imageUrl}
                    category={deal.category}
                    companyName={deal.companyName || ''}
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
                <h3 className="text-xl font-medium mb-2">Inga produkter hittades</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery ||
                    selectedCategory !== 'all' ||
                    selectedDurations.length > 0 ||
                    priceRange[0] > 0 ||
                    priceRange[1] < maxPrice
                    ? 'Inga produkter matchar dina filter. Försök att ändra dina sökkriterier.'
                    : 'Det finns inga aktiva erbjudanden just nu. Kom tillbaka senare.'}
                </p>
                {(searchQuery ||
                  selectedCategory !== 'all' ||
                  selectedDurations.length > 0 ||
                  priceRange[0] > 0 ||
                  priceRange[1] < maxPrice) && (
                    <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                      Rensa filter
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
