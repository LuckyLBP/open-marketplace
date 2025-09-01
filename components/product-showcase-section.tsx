'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, TrendingUp, Grid3X3, Filter } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
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
import { ProductCard } from '@/components/product-card';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  companyName: string;
  expiresAt: Date;
  duration: number;
  // 🔽 nya fält
  stockQuantity?: number;
  inStock?: boolean;
}

interface CategoryData {
  name: string;
  displayName: string;
  icon: string;
  color: string;
  bgColor: string;
  products: Product[];
}

const categoryConfig: Record<
  string,
  { displayName: string; icon: string; color: string; bgColor: string }
> = {
  elektronik: {
    displayName: 'Elektronik',
    icon: '📱',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  mode: {
    displayName: 'Mode',
    icon: '👕',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  hemmet: {
    displayName: 'Hemmet',
    icon: '🏠',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  'halsa-skonhet': {
    displayName: 'Hälsa & Skönhet',
    icon: '💄',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  'hobby-fritid': {
    displayName: 'Hobby & Fritid',
    icon: '🎯',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  other: {
    displayName: 'Annat',
    icon: '📦',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

export function ProductShowcaseSection() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const now = Timestamp.now();
      const q = query(
        collection(db, 'deals'),
        where('status', '==', 'approved'),
        where('expiresAt', '>', now),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const products: Product[] = [];
      const categories: Record<string, Product[]> = {};
      const companyNames: Record<string, string> = {};
      const companyIds = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.companyId) companyIds.add(data.companyId);
      });

      for (const id of companyIds) {
        const docRef = doc(db, 'companies', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists())
          companyNames[id] = docSnap.data().companyName || 'ClickFynd.se';
      }

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const expiresAt = data.expiresAt.toDate();

        const product: Product = {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          imageUrl: data.imageUrl,
          category: data.category || 'other',
          companyName: companyNames[data.companyId] || 'ClickFynd.se',
          expiresAt,
          duration: data.duration || 24,
          // 🔽 hämta lagerfält
          stockQuantity: data.stockQuantity,
          inStock: data.inStock,
        };

        products.push(product);
        if (!categories[product.category]) categories[product.category] = [];
        categories[product.category].push(product);
      });

      // 🔽 Filtrera bort slut-i-lager
      const inStockFilter = (p: Product) =>
        p.inStock !== false && (p.stockQuantity ?? 0) > 0;

      const categoryArray: CategoryData[] = Object.entries(categories).map(
        ([name, products]) => {
          const filtered = products.filter(inStockFilter);
          return {
            name,
            displayName: categoryConfig[name]?.displayName || name,
            icon: categoryConfig[name]?.icon || '📦',
            color: categoryConfig[name]?.color || 'text-gray-600',
            bgColor: categoryConfig[name]?.bgColor || 'bg-gray-50',
            products: filtered.slice(0, 8),
          };
        }
      );

      setCategories(categoryArray);
      setAllProducts(products.filter(inStockFilter).slice(0, 16));
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleBuyNow = (id: string) => {
    router.push(`/product/${id}`);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-lg border">
              <Grid3X3 className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Produktutställning
              </span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Upptäck alla produkter
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bläddra igenom vårt breda utbud av produkter från olika kategorier.
            Hitta exklusiva erbjudanden och tidsbegränsade deals.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white shadow-lg border p-1 rounded-full">
              <TabsTrigger
                value="all"
                className="rounded-full px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" /> Alla produkter
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.name}
                  value={category.name}
                  className="rounded-full px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.displayName}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-5 gap-4">
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onBuyNow={handleBuyNow}
                  compact
                />
              ))}
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent
              key={category.name}
              value={category.name}
              className="mt-8"
            >
              <div className="mb-6">
                <div
                  className={`inline-flex items-center ${category.bgColor} rounded-full px-4 py-2 mb-4`}
                >
                  <span className="text-2xl mr-2">{category.icon}</span>
                  <span className={`font-semibold ${category.color}`}>
                    {category.displayName}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {category.products.length} produkter i {category.displayName}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onBuyNow={handleBuyNow}
                    compact
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Vill du se fler produkter?
            </h3>
            <p className="text-gray-600 mb-6">
              Utforska hela vårt sortiment på marknadsplatsen med avancerade
              filter och sorteringsalternativ.
            </p>
            <Link href="/marketplace">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl"
              >
                <Filter className="h-5 w-5 mr-2" /> Gå till marknadsplatsen{' '}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
