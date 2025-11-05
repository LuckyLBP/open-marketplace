"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartContext } from "@/components/cart/cartProvider";
import { Button } from "@/components/ui/button";
import { Heart, X, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TimeLeftLabel } from "@/components/deals/timeLeftLabel";

const CartItemList = () => {
  const { cartItems, removeFromCart, addToCart } = useCartContext();
  const { toast } = useToast();

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="md:col-span-2 text-center py-8">
        <p className="text-gray-500">Din varukorg är tom</p>
      </div>
    );
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    
    // Use addToCart with the difference to avoid remove/re-add cycle
    const diff = quantity - item.quantity;
    if (diff !== 0) {
      addToCart(item, diff);
    }
  };

  const moveToWishlist = (id: string) => {
    removeFromCart(id);
    toast({
      description: "Produkten har flyttats till din önskelista.",
    });
  };

  return (
    <div className="md:col-span-2 space-y-6">
      {cartItems?.filter(item => item?.id).map((item) => {
        if (!item?.id) return null; // Skip invalid items
        
        let expiresAt: Date;
        try {
          expiresAt = item.expiresAt instanceof Date
            ? item.expiresAt
            : new Date(item.expiresAt);
          // Validate the date
          if (isNaN(expiresAt.getTime())) {
            expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24h from now
          }
        } catch {
          expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Fallback date
        }

        const imageUrl =
          item.images && item.images.length > 0 && item.images[0]?.url
            ? item.images[0].url
            : "/placeholder.png";

        return (
          <div key={`cart-item-${item.id}`} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-32 h-32 relative flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      Säljare: {item.companyName}
                    </p>
                    <div className="text-sm mb-4 text-rose-600">
                      <TimeLeftLabel expiresAt={expiresAt} />
                    </div>
                  </div>

                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (item?.id) {
                        removeFromCart(item.id);
                      }
                    }}
                    aria-label="Ta bort från varukorg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-end justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <button
                        className="w-8 h-8 border border-gray-300 rounded-l-md hover:bg-gray-100 flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault();
                          if (item?.id && item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 1;
                          if (item?.id && newValue >= 1) {
                            updateQuantity(item.id, newValue);
                          }
                        }}
                        className="w-10 h-8 border-y border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        className="w-8 h-8 border border-gray-300 rounded-r-md hover:bg-gray-100 flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault();
                          if (item?.id) {
                            updateQuantity(item.id, item.quantity + 1);
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-sm text-gray-600 hover:text-purple-600 flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item?.id) {
                          moveToWishlist(item.id);
                        }
                      }}
                    >
                      <Heart className="h-4 w-4 mr-1" /> Spara
                    </button>
                  </div>

                  <div className="text-right">
                    {item.originalPrice && typeof item.originalPrice === 'number' && (
                      <p className="text-sm line-through text-gray-500">
                        {item.originalPrice.toLocaleString("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                        })}
                      </p>
                    )}
                    <p className="font-bold text-lg">
                      {(typeof item.price === 'number' ? item.price : 0).toLocaleString("sv-SE", {
                        style: "currency",
                        currency: "SEK",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }).filter(Boolean) || []}

      <div className="mt-4">
        <Link
          href="/marketplace"
          className="text-sm flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Fortsätt handla
        </Link>
      </div>
    </div>
  );
};

export default CartItemList;
