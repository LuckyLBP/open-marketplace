'use client';

import { CardFooter } from '@/components/ui/card';

import { CardTitle } from '@/components/ui/card';

import { CardHeader } from '@/components/ui/card';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Clock,
  ShoppingCart,
  Store,
  Heart,
  Eye,
  Share2,
  Check,
  Star,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductSpecifications } from '@/components/product-specifications';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type ProductImage = {
  url: string;
  alt: string;
  isPrimary?: boolean;
};

type SpecificationGroup = {
  title: string;
  specifications: {
    name: string;
    value: string;
  }[];
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number;
  images: ProductImage[];
  companyId: string;
  companyName: string;
  category: string;
  feePercentage: number;
  expiresAt: Date;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  specifications?: SpecificationGroup[];
  features?: string[];
  inStock?: boolean;
  stockQuantity?: number;
  sku?: string;
};

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'deals', id));

        if (!productDoc.exists()) {
          toast({
            title: t('Error'),
            description: t('Product not found or has expired.'),
            variant: 'destructive',
          });
          router.push('/marketplace');
          return;
        }

        const data = productDoc.data();

        // Fetch company name
        let companyName = 'BudFynd.se';
        try {
          const companyDoc = await getDoc(doc(db, 'companies', data.companyId));
          if (companyDoc.exists()) {
            companyName = companyDoc.data().companyName;
          }
        } catch (error) {
          console.error('Error fetching company:', error);
        }

        const expiresAt = data.expiresAt.toDate();
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();

        if (diffMs <= 0) {
          toast({
            title: t('Error'),
            description: t('This product has expired.'),
            variant: 'destructive',
          });
          router.push('/marketplace');
          return;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        // Create mock data for the new fields
        // In a real app, these would come from your database
        const mockImages: ProductImage[] = [
          {
            url: data.imageUrl || '/placeholder.svg?height=600&width=600',
            alt: data.title,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            alt: `${data.title} - Angle 2`,
          },
          {
            url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            alt: `${data.title} - Angle 3`,
          },
          {
            url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            alt: `${data.title} - Detail`,
          },
        ];

        const mockSpecifications: SpecificationGroup[] = [
          {
            title: 'Technical Specifications',
            specifications: [
              { name: 'Brand', value: 'TechBrand' },
              { name: 'Model', value: 'X-2000' },
              { name: 'Color', value: 'Black/Silver' },
              { name: 'Weight', value: '250g' },
              { name: 'Dimensions', value: '15 x 7 x 2 cm' },
              { name: 'Material', value: 'Aluminum, Plastic' },
            ],
          },
          {
            title: 'Features',
            specifications: [
              { name: 'Connectivity', value: 'Bluetooth 5.0, WiFi' },
              { name: 'Battery Life', value: 'Up to 20 hours' },
              { name: 'Water Resistance', value: 'IPX7' },
              { name: 'Warranty', value: '2 years' },
            ],
          },
          {
            title: 'Package Contents',
            specifications: [
              { name: 'Main Unit', value: '1x' },
              { name: 'Charging Cable', value: '1x' },
              { name: 'User Manual', value: '1x' },
              { name: 'Warranty Card', value: '1x' },
            ],
          },
        ];

        const mockFeatures = [
          'High-quality sound with noise cancellation',
          '20-hour battery life on a single charge',
          'Quick charge: 5 minutes for 1 hour of playback',
          'Bluetooth 5.0 for stable connection',
          'Built-in microphone for calls',
          'Compatible with voice assistants',
        ];

        setProduct({
          id: productDoc.id,
          title: data.title,
          description: data.description,
          price: data.price,
          originalPrice: data.price * 1.25, // Mock original price (25% higher)
          duration: data.duration,
          images: mockImages,
          companyId: data.companyId,
          companyName: companyName,
          category: data.category || 'other',
          feePercentage: data.feePercentage,
          expiresAt: expiresAt,
          timeLeft: {
            hours,
            minutes,
            seconds,
          },
          specifications: mockSpecifications,
          features: mockFeatures,
          inStock: true,
          stockQuantity: 15,
          sku: `SKU-${Math.floor(Math.random() * 10000)}`,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: t('Error'),
          description: t('Failed to load product information.'),
          variant: 'destructive',
        });
        router.push('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Update countdown every second
    const interval = setInterval(() => {
      setProduct((prevProduct) => {
        if (!prevProduct) return null;

        const now = new Date();
        const diffMs = prevProduct.expiresAt.getTime() - now.getTime();

        if (diffMs <= 0) {
          clearInterval(interval);
          toast({
            title: t('Error'),
            description: t('This product has expired.'),
            variant: 'destructive',
          });
          router.push('/marketplace');
          return prevProduct;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        return {
          ...prevProduct,
          timeLeft: { hours, minutes, seconds },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [id, router, t, toast]);

  const handleBuyNow = () => {
    router.push(`/checkout/${id}?quantity=${quantity}`);
  };

  const handleAddToCart = () => {
    toast({
      title: t('Added to Cart'),
      description: `${product?.title} (${quantity}) ${t(
        'has been added to your cart'
      )}`,
    });
  };

  const handleAddToWishlist = () => {
    toast({
      title: t('Added to Wishlist'),
      description: `${product?.title} ${t('has been added to your wishlist')}`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('Link Copied'),
        description: t('Product link has been copied to clipboard'),
      });
    }
  };

  const isOnSale =
    product?.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isOnSale
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">
              {t('Product Not Found')}
            </h1>
            <p className="mb-6 text-muted-foreground">
              {t('This product may have expired or been removed.')}
            </p>
            <Link href="/marketplace">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('Back to Marketplace')}
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-purple-50 to-white py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t('Home')}
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t('Marketplace')}
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li>
                <Link
                  href={`/marketplace?category=${product.category}`}
                  className="text-muted-foreground hover:text-foreground capitalize"
                >
                  {t(product.category)}
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-foreground font-medium truncate max-w-[200px]">
                {product.title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Product Images */}
            <div>
              <ProductImageGallery
                images={product.images}
                title={product.title}
              />
            </div>

            {/* Product Info */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-purple-50">
                    {product.duration}h
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 capitalize">
                    {t(
                      product.category.charAt(0).toUpperCase() +
                        product.category.slice(1)
                    )}
                  </Badge>
                  {isOnSale && (
                    <Badge className="bg-red-600 hover:bg-red-700">
                      {t('Sale')} {discountPercentage}% {t('Off')}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Store className="h-4 w-4 mr-1" />
                  <span>{product.companyName}</span>
                </div>

                {/* Product Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          star <= 4
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    (24 {t('reviews')})
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {isOnSale && (
                    <div className="text-sm line-through text-muted-foreground">
                      {new Intl.NumberFormat('sv-SE', {
                        style: 'currency',
                        currency: 'SEK',
                      }).format(product.originalPrice)}
                    </div>
                  )}
                  <div
                    className={cn(
                      'text-3xl font-bold',
                      isOnSale && 'text-red-600'
                    )}
                  >
                    {new Intl.NumberFormat('sv-SE', {
                      style: 'currency',
                      currency: 'SEK',
                    }).format(product.price)}
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center mb-6 p-3 bg-purple-50 rounded-md">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-purple-600">
                      {t('Limited Time Offer')}
                    </div>
                    <div className="text-lg font-bold">
                      {product.timeLeft.hours.toString().padStart(2, '0')}:
                      {product.timeLeft.minutes.toString().padStart(2, '0')}:
                      {product.timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center mb-4">
                  {product.inStock ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        {t('In Stock')} ({product.stockQuantity}{' '}
                        {t('available')})
                      </span>
                    </div>
                  ) : (
                    <div className="text-red-600 font-medium">
                      {t('Out of Stock')}
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium mb-2"
                  >
                    {t('Quantity')}
                  </label>
                  <div className="flex items-center">
                    <button
                      className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center hover:bg-gray-100"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stockQuantity || 99}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            product.stockQuantity || 99,
                            Math.max(1, Number.parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="w-16 h-10 border-y border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-100"
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stockQuantity || 99, quantity + 1)
                        )
                      }
                      disabled={quantity >= (product.stockQuantity || 99)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg"
                      onClick={handleBuyNow}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {t('Buy Now')}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                      onClick={handleAddToWishlist}
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="h-12"
                    onClick={handleAddToCart}
                  >
                    {t('Add to Cart')}
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          {t('Quick Preview')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{product.title}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 md:grid-cols-2">
                          <div>
                            <img
                              src={
                                product.images[0]?.url ||
                                '/placeholder.svg?height=300&width=300'
                              }
                              alt={product.title}
                              className="w-full h-auto rounded-md"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">
                              {product.title}
                            </h3>
                            <div className="mb-2">
                              {isOnSale && (
                                <span className="text-sm line-through text-muted-foreground mr-2">
                                  {new Intl.NumberFormat('sv-SE', {
                                    style: 'currency',
                                    currency: 'SEK',
                                  }).format(product.originalPrice)}
                                </span>
                              )}
                              <span
                                className={cn(
                                  'text-lg font-bold',
                                  isOnSale && 'text-red-600'
                                )}
                              >
                                {new Intl.NumberFormat('sv-SE', {
                                  style: 'currency',
                                  currency: 'SEK',
                                }).format(product.price)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {product.description}
                            </p>
                            <Button
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              onClick={() => {
                                setPreviewOpen(false);
                                handleBuyNow();
                              }}
                            >
                              {t('Buy Now')}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {t('Share')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* SKU and other details */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('SKU')}:</span>{' '}
                    {product.sku}
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('Category')}:
                    </span>{' '}
                    <Link
                      href={`/marketplace?category=${product.category}`}
                      className="capitalize hover:text-purple-600"
                    >
                      {t(product.category)}
                    </Link>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('Transaction Fee')}:
                    </span>{' '}
                    {product.feePercentage}%
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('Duration')}:
                    </span>{' '}
                    {product.duration} {t('hours')}
                  </div>
                </div>
              </div>

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">
                    {t('Key Features')}
                  </h2>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
                <TabsTrigger value="description">
                  {t('Description')}
                </TabsTrigger>
                <TabsTrigger value="specifications">
                  {t('Specifications')}
                </TabsTrigger>
                <TabsTrigger value="reviews">{t('Reviews')}</TabsTrigger>
              </TabsList>
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <TabsContent value="description" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">
                    {t('Product Description')}
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line">
                      {product.description}
                    </p>

                    {/* Extended description - in a real app, this would come from your database */}
                    <p className="mt-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Nullam auctor, nisl eget ultricies tincidunt, nisl nisl
                      aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam
                      auctor, nisl eget ultricies tincidunt, nisl nisl aliquam
                      nisl, eget aliquam nisl nisl eget nisl.
                    </p>
                    <p className="mt-4">
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="specifications">
                  <h2 className="text-2xl font-bold mb-4">
                    {t('Product Specifications')}
                  </h2>
                  {product.specifications &&
                  product.specifications.length > 0 ? (
                    <ProductSpecifications
                      specifications={product.specifications}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {t('No specifications available for this product.')}
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="reviews">
                  <h2 className="text-2xl font-bold mb-4">
                    {t('Customer Reviews')}
                  </h2>
                  <div className="flex items-center mb-6">
                    <div className="flex mr-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-5 w-5',
                            star <= 4
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-medium">4.0</span>
                    <span className="text-muted-foreground ml-2">
                      ({t('24 reviews')})
                    </span>
                  </div>

                  {/* Mock reviews - in a real app, these would come from your database */}
                  <div className="space-y-6">
                    <div className="border-b pb-6">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-4 w-4',
                                star <= 5
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                        <span className="font-medium">Anna L.</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          2023-10-15
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">
                        Great product, highly recommend!
                      </h3>
                      <p className="text-muted-foreground">
                        I've been using this for a month now and I'm very
                        impressed with the quality. The sound is crystal clear
                        and the battery life is amazing.
                      </p>
                    </div>
                    <div className="border-b pb-6">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-4 w-4',
                                star <= 4
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                        <span className="font-medium">Johan K.</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          2023-09-22
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">
                        Good but could be better
                      </h3>
                      <p className="text-muted-foreground">
                        The product works well overall, but I had some issues
                        with the Bluetooth connection. Sometimes it disconnects
                        randomly. Otherwise, it's a good product for the price.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-4 w-4',
                                star <= 3
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                        <span className="font-medium">Maria S.</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          2023-08-05
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">
                        Decent but overpriced
                      </h3>
                      <p className="text-muted-foreground">
                        The product is decent, but I think it's a bit overpriced
                        for what it offers. The build quality is good, but I
                        expected more features for this price point.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              {t('You May Also Like')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Mock related products - in a real app, these would come from your database */}
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col group"
                >
                  <Link href="#" className="group">
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={`https://picsum.photos/seed/${i}/400/300`}
                        alt={`Related Product ${i}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <CardHeader className="pb-2">
                    <Link href="#">
                      <CardTitle className="line-clamp-1 hover:text-purple-600 transition-colors">
                        {t('Related Product')} {i}
                      </CardTitle>
                    </Link>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                      {t(
                        'This is a related product that you might be interested in.'
                      )}
                    </p>
                    <div className="text-xl font-bold">
                      {new Intl.NumberFormat('sv-SE', {
                        style: 'currency',
                        currency: 'SEK',
                      }).format(499 + i * 100)}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => {}}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('View Product')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
