'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  Trash2,
  X,
  Heart,
  ShoppingBag,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';

// Mock cart item type
type CartItem = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl: string;
  companyName: string;
  expiresAt: Date;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
};

export default function CartPage() {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Load cart items (mock data)
  useEffect(() => {
    // Mock data - in a real application, this would come from your cart state management
    /*const mockCartItems: CartItem[] = [
      {
        id: 'prod-1',
        title: 'Premium Bluetooth Hörlurar',
        price: 1299,
        originalPrice: 1599,
        quantity: 1,
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        companyName: 'TechBrand AB',
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        timeLeft: { hours: 8, minutes: 0, seconds: 0 },
      },
      {
        id: 'prod-2',
        title: 'Organisk Hudvårdsset',
        price: 899,
        originalPrice: 1199,
        quantity: 2,
        imageUrl:
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        companyName: 'NaturSkin',
        expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000), // 16 hours from now
        timeLeft: { hours: 16, minutes: 0, seconds: 0 },
      },
    ];

    setCartItems(mockCartItems);*/
    setLoading(false);

    // Update countdown timer every second
    const interval = setInterval(() => {
      setCartItems(
        (prevItems) =>
          prevItems
            .map((item) => {
              const now = new Date();
              const diffMs = item.expiresAt.getTime() - now.getTime();

              if (diffMs <= 0) {
                // Item expired, remove from cart
                toast({
                  title: `${item.title} har utgått`,
                  description:
                    'Erbjudandet är inte längre tillgängligt och har tagits bort från varukorgen.',
                  variant: 'destructive',
                });
                return null;
              }

              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor(
                (diffMs % (1000 * 60 * 60)) / (1000 * 60)
              );
              const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

              return {
                ...item,
                timeLeft: { hours, minutes, seconds },
              };
            })
            .filter(Boolean) as CartItem[]
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  // Update quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item
  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast({
      description: 'Produkten har tagits bort från varukorgen.',
    });
  };

  // Move to wishlist
  const moveToWishlist = (id: string) => {
    // In a real app, you would add to wishlist here
    removeItem(id);
    toast({
      description: 'Produkten har flyttats till din önskelista.',
    });
  };

  // Apply promo code
  const applyPromoCode = () => {
    if (!promoCode.trim()) return;

    // Mock promo code validation
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setDiscount(10);
      setAppliedPromo(promoCode);
      toast({
        title: 'Rabattkod tillagd!',
        description: '10% rabatt har applicerats på din beställning.',
      });
    } else {
      toast({
        title: 'Ogiltig rabattkod',
        description: 'Koden du angav är inte giltig eller har utgått.',
        variant: 'destructive',
      });
    }
    setPromoCode('');
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = subtotal * (discount / 100);
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal - discountAmount + shipping;

  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Kunde inte initiera betalning", variant: "destructive" });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ title: "Något gick fel", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-purple-50 to-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Din varukorg
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : isCartEmpty ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">
                Din varukorg är tom
              </h2>
              <p className="text-gray-600 mb-6">
                Du har inte lagt till några produkter i din varukorg än.
                Utforska vårt utbud av tidsbegränsade erbjudanden!
              </p>
              <Link href="/marketplace">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Utforska erbjudanden
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cart Items (2 columns on larger screens) */}
              <div className="md:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md p-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 relative flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                              Säljare: {item.companyName}
                            </p>

                            {/* Countdown timer */}
                            <div className="text-sm mb-4 text-rose-600">
                              Erbjudandet går ut om:{' '}
                              {item.timeLeft.hours.toString().padStart(2, '0')}:
                              {item.timeLeft.minutes
                                .toString()
                                .padStart(2, '0')}
                              :
                              {item.timeLeft.seconds
                                .toString()
                                .padStart(2, '0')}
                            </div>
                          </div>

                          {/* Remove button (X) */}
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => removeItem(item.id)}
                            aria-label="Ta bort produkt"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-end justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center">
                              <button
                                className="w-8 h-8 border border-gray-300 rounded-l-md flex items-center justify-center hover:bg-gray-100"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-10 h-8 border-y border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <button
                                className="w-8 h-8 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-100"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                +
                              </button>
                            </div>

                            {/* Move to Wishlist button */}
                            <button
                              className="text-sm flex items-center text-gray-600 hover:text-purple-600"
                              onClick={() => moveToWishlist(item.id)}
                            >
                              <Heart className="h-4 w-4 mr-1" /> Spara
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            {item.originalPrice && (
                              <p className="text-sm line-through text-gray-500">
                                {new Intl.NumberFormat('sv-SE', {
                                  style: 'currency',
                                  currency: 'SEK',
                                }).format(item.originalPrice)}
                              </p>
                            )}
                            <p className="font-bold text-lg">
                              {new Intl.NumberFormat('sv-SE', {
                                style: 'currency',
                                currency: 'SEK',
                              }).format(item.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Continue Shopping Link */}
                <div className="mt-4">
                  <Link
                    href="/marketplace"
                    className="text-sm flex items-center text-purple-600 hover:text-purple-800"
                  >
                    <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Fortsätt
                    handla
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">
                    Ordersammanfattning
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delsumma</span>
                      <span>
                        {new Intl.NumberFormat('sv-SE', {
                          style: 'currency',
                          currency: 'SEK',
                        }).format(subtotal)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Rabatt ({discount}%)</span>
                        <span>
                          -
                          {new Intl.NumberFormat('sv-SE', {
                            style: 'currency',
                            currency: 'SEK',
                          }).format(discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Frakt</span>
                      <span>
                        {shipping === 0
                          ? 'Gratis'
                          : new Intl.NumberFormat('sv-SE', {
                            style: 'currency',
                            currency: 'SEK',
                          }).format(shipping)}
                      </span>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between font-bold">
                      <span>Summa</span>
                      <span>
                        {new Intl.NumberFormat('sv-SE', {
                          style: 'currency',
                          currency: 'SEK',
                        }).format(total)}
                      </span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  {!appliedPromo ? (
                    <div className="mb-6">
                      <label
                        htmlFor="promo-code"
                        className="block text-sm font-medium mb-2"
                      >
                        Rabattkod
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="promo-code"
                          placeholder="Ange kod"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-grow"
                        />
                        <Button variant="outline" onClick={applyPromoCode}>
                          Använd
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Testa rabattkoden "WELCOME10" för 10% rabatt
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6 bg-green-50 p-3 rounded-md flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-green-700">
                          Rabattkod: {appliedPromo}
                        </span>
                        <p className="text-xs text-green-600">
                          10% rabatt applicerad
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setAppliedPromo(null);
                          setDiscount(0);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Checkout Button */}
                    <Button
                      className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handleCheckout}
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Gå till kassan
                    </Button>
                 
                  {/* Secure checkout note */}
                  <div className="mt-4 text-xs text-gray-500 text-center flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Säker betalning | SSL-krypterad
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Products */}
          {!isCartEmpty && !loading && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">
                Du kanske också gillar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* Mock related products */}
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md overflow-hidden group"
                  >
                    <Link href={`/product/related-${i}`}>
                      <div className="aspect-square relative overflow-hidden bg-gray-100">
                        <Image
                          src={`https://picsum.photos/seed/${i + 10}/300/300`}
                          alt={`Related Product ${i}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                            24h
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/product/related-${i}`}>
                        <h3 className="font-medium mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                          Produkt {i}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        En produkt du kanske är intresserad av baserat på dina
                        val.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">
                          {new Intl.NumberFormat('sv-SE', {
                            style: 'currency',
                            currency: 'SEK',
                          }).format(300 + i * 100)}
                        </span>
                        <Button size="sm" variant="outline">
                          Lägg i varukorg
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
