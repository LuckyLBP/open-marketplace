'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CartItemCard from './cartItemCard';
import { useCartContext } from './cartProvider';
import { useEffect, useState } from 'react';
import { CartItem } from '@/hooks/useCart';

const CartItemsSection = () => {
  const { cartItems, removeFromCart } = useCartContext();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);

  // Countdown timer för utgång
  useEffect(() => {
    setItems(cartItems); // init

    const interval = setInterval(() => {
      setItems((prev) =>
        prev
          .map((item) => {
            const now = new Date();
            const diff = new Date(item.expiresAt).getTime() - now.getTime();
            if (diff <= 0) {
              removeFromCart(item.id);
              toast({
                title: `${item.title} har utgått`,
                description:
                  'Erbjudandet är inte längre tillgängligt och har tagits bort från varukorgen.',
                variant: 'destructive',
              });
              return null;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return {
              ...item,
              timeLeft: { hours, minutes, seconds },
            };
          })
          .filter(Boolean) as CartItem[]
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [cartItems, removeFromCart, toast]);

  const handleMoveToWishlist = (id: string) => {
    removeFromCart(id);
    toast({
      description: 'Produkten har flyttats till din önskelista.',
    });
  };

  return (
    <div className="md:col-span-2 space-y-6">
      {items.map((item) => (
        <CartItemCard
          key={item.id}
          item={item}
          onMoveToWishlist={handleMoveToWishlist}
        />
      ))}

      {/* Fortsätt handla-länk */}
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

export default CartItemsSection;
