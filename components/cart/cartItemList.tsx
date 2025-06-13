"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartContext } from "@/components/cart/cartProvider";
import { Button } from "@/components/ui/button";
import { Heart, X, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CartItemList = () => {
  const { cartItems, removeFromCart, addToCart } = useCartContext();
  const { toast } = useToast();

  const updateQuantity = (id: string, quantity: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    if (quantity < 1) return;
    removeFromCart(id);
    addToCart(item, quantity);
  };

  const moveToWishlist = (id: string) => {
    removeFromCart(id);
    toast({
      description: "Produkten har flyttats till din önskelista.",
    });
  };

  return (
    <div className="md:col-span-2 space-y-6">
      {cartItems.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-32 h-32 relative flex-shrink-0">
              <Image
                src={item.images[0].url}
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
                    Erbjudandet går ut om: {item.timeLeft?.hours?.toString().padStart(2, "0")}
                    :{item.timeLeft?.minutes?.toString().padStart(2, "0")}
                    :{item.timeLeft?.seconds?.toString().padStart(2, "0")}
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => removeFromCart(item.id)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-end justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <button
                      className="w-8 h-8 border border-gray-300 rounded-l-md hover:bg-gray-100"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-10 h-8 border-y border-gray-300 text-center focus:outline-none"
                    />
                    <button
                      className="w-8 h-8 border border-gray-300 rounded-r-md hover:bg-gray-100"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-sm text-gray-600 hover:text-purple-600"
                    onClick={() => moveToWishlist(item.id)}
                  >
                    <Heart className="h-4 w-4 mr-1" /> Spara
                  </button>
                </div>
                <div className="text-right">
                  {item.originalPrice && (
                    <p className="text-sm line-through text-gray-500">
                      {item.originalPrice.toLocaleString("sv-SE", {
                        style: "currency",
                        currency: "SEK",
                      })}
                    </p>
                  )}
                  <p className="font-bold text-lg">
                    {item.price.toLocaleString("sv-SE", {
                      style: "currency",
                      currency: "SEK",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

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