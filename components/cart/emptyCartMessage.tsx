'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmptyCartMessage = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingCart className="h-10 w-10 text-purple-600" />
      </div>
      <h2 className="text-2xl font-semibold mb-3">Din varukorg är tom</h2>
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
  );
};

export default EmptyCartMessage;
