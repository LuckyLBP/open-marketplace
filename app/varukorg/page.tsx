'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import CartLayout from '@/components/cart/cartLayout';
import { CartProvider } from '@/components/cart/cartProvider'; 

export default function CartPage() {
  return (
    <CartProvider> 
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gradient-to-b from-purple-50 to-white py-8 px-4">
          <CartLayout />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
