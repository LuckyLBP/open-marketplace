'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  Clock,
  ShoppingBag,
  Star,
  TrendingUp,
  Grid3X3,
  Filter,
  Eye,
} from 'lucide-react';
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

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  companyName: string;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
};

type CategoryData = {
  name: string;
  displayName: string;
  icon: string;
  color: string;
  bgColor: string;
  products: Product[];
};

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

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const now = Timestamp.now();

        // Fetch all active deals
        const q = query(
          collection(db, 'deals'),
          where('expiresAt', '>', now),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        const categoryGroups: Record<string, Product[]> = {};

        // Get unique company IDs
        const companyIds = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.companyId) {
            companyIds.add(data.companyId);
          }
        });

        // Fetch company names
        const companyData: Record<string, string> = {};
        for (const companyId of companyIds) {
          if (!companyId) continue;

          try {
            const companyDocRef = doc(db, 'companies', companyId);
            const companyDoc = await getDoc(companyDocRef);
            if (companyDoc.exists()) {
              companyData[companyId] =
                companyDoc.data().companyName || 'BudFynd.se';
            }
          } catch (error) {
            console.error('Error fetching company:', error);
          }
        }

        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const expiresAt = data.expiresAt.toDate();
          const now = new Date();
          const diffMs = expiresAt.getTime() - now.getTime();

          if (diffMs > 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            const product: Product = {
              id: docSnapshot.id,
              title: data.title,
              description: data.description,
              price: data.price,
              originalPrice: data.originalPrice,
              imageUrl: data.imageUrl,
              category: data.category || 'other',
              companyName: companyData[data.companyId] || 'BudFynd.se',
              timeLeft: { hours, minutes, seconds },
            };

            fetchedProducts.push(product);

            // Group by category
            const category = product.category;
            if (!categoryGroups[category]) {
              categoryGroups[category] = [];
            }
            categoryGroups[category].push(product);
          }
        });

        // Create category data
        const categoryData: CategoryData[] = Object.entries(categoryGroups).map(
          ([categoryName, products]) => ({
            name: categoryName,
            displayName:
              categoryConfig[categoryName]?.displayName || categoryName,
            icon: categoryConfig[categoryName]?.icon || '📦',
            color: categoryConfig[categoryName]?.color || 'text-gray-600',
            bgColor: categoryConfig[categoryName]?.bgColor || 'bg-gray-50',
            products: products.slice(0, 8), // Limit to 8 products per category
          })
        );

        setCategories(categoryData);
        setAllProducts(fetchedProducts.slice(0, 16)); // Show 16 products in "all" view
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();

    // Update countdown every 30 seconds (less frequent for performance)
    const interval = setInterval(() => {
      const updateProducts = (products: Product[]) =>
        products
          .map((product) => {
            const totalMs =
              product.timeLeft.hours * 3600000 +
              product.timeLeft.minutes * 60000 +
              product.timeLeft.seconds * 1000;
            const newTotalMs = totalMs - 30000; // Subtract 30 seconds

            if (newTotalMs <= 0) {
              return null;
            }

            const hours = Math.floor(newTotalMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (newTotalMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((newTotalMs % (1000 * 60)) / 1000);

            return {
              ...product,
              timeLeft: { hours, minutes, seconds },
            };
          })
          .filter((product): product is Product => product !== null);

      setAllProducts((prev) => updateProducts(prev));
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          products: updateProducts(category.products),
        }))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const ProductCard = ({ product }: { product: Product }) => {
    const discount = product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

    const isUrgent = product.timeLeft.hours < 6;

    return (
      <Link href={`/product/${product.id}`} className="group block">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
          <div className="relative">
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
              <img
                src={
                  product.imageUrl || '/placeholder.svg?height=200&width=200'
                }
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Overlays */}
            <div className="absolute top-3 left-3">
              {isUrgent && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  <Clock className="h-3 w-3 mr-1" />
                  Brådskande
                </Badge>
              )}
            </div>

            {discount > 0 && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-500 text-white">-{discount}%</Badge>
              </div>
            )}

            {/* Quick view overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                size="sm"
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <Eye className="h-4 w-4 mr-2" />
                Snabbtitt
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {product.title}
              </h3>
            </div>

            <p className="text-xs text-gray-500 mb-2">{product.companyName}</p>

            <div className="flex items-center justify-between mb-3">
              <div>
                {product.originalPrice && (
                  <div className="text-xs line-through text-gray-400">
                    {new Intl.NumberFormat('sv-SE', {
                      style: 'currency',
                      currency: 'SEK',
                    }).format(product.originalPrice)}
                  </div>
                )}
                <div className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat('sv-SE', {
                    style: 'currency',
                    currency: 'SEK',
                  }).format(product.price)}
                </div>
              </div>

              <div className="text-xs text-orange-600 font-medium">
                {product.timeLeft.hours}h {product.timeLeft.minutes}m
              </div>
            </div>

            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Köp nu
            </Button>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar produkter...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
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

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white shadow-lg border p-1 rounded-full">
              <TabsTrigger
                value="all"
                className="rounded-full px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Alla produkter
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

          {/* All Products Tab */}
          <TabsContent value="all" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {allProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🛍️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Inga produkter tillgängliga
                </h3>
                <p className="text-gray-500">
                  Kom tillbaka senare för att se nya erbjudanden!
                </p>
              </div>
            )}
          </TabsContent>

          {/* Category-specific tabs */}
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
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {category.products.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Inga produkter i {category.displayName}
                  </h3>
                  <p className="text-gray-500">
                    Kom tillbaka senare för att se nya erbjudanden!
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Call to Action */}
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Filter className="h-5 w-5 mr-2" />
                Gå till marknadsplatsen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
