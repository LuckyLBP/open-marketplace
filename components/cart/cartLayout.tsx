"use client";

import React from "react";
import CartItemList from "./cartItemList";
import CartSummary from "./cartSummary";
import { RelatedProductsSection } from './relatedProducts';

import { useCartContext } from "@/components/cart/cartProvider";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CartLayout = () => {
  const { cartItems, loading } = useCartContext();
  const isCartEmpty = cartItems.length === 0;

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl text-center py-20 text-gray-500">
        Laddar varukorg...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
        Din varukorg
      </h1>

      {isCartEmpty ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Din varukorg är tom</h2>
          <p className="text-gray-600 mb-6">
            Du har inte lagt till några produkter än. Utforska vårt utbud av
            tidsbegränsade erbjudanden!
          </p>
          <Link href="/marketplace">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Utforska erbjudanden
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <CartItemList />
            <div className="mt-4">
              <Link
                href="/marketplace"
                className="text-sm flex items-center text-purple-600 hover:text-purple-800"
              >
              </Link>
            </div>
          </div>
          <div className="md:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}

      {!isCartEmpty && <RelatedProductsSection />}
    </div>
  );
};

export default CartLayout;
