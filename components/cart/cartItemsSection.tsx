'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CartItemCard from './cartItemCard';
import { useCartContext } from './cartProvider';
import { useEffect, useState, useRef } from 'react';
import { CartItem } from '@/hooks/useCart';

interface CartItemWithTimeLeft extends CartItem {
  timeLeft?: { hours: number; minutes: number; seconds: number };
}

const CartItemsSection = () => {
  const { cartItems, removeFromCart } = useCartContext();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItemWithTimeLeft[]>([]);
  const removeFromCartRef = useRef(removeFromCart);
  const toastRef = useRef(toast);

  // Keep refs updated to avoid stale closures
  useEffect(() => {
    removeFromCartRef.current = removeFromCart;
    toastRef.current = toast;
  }, [removeFromCart, toast]);

  // Sync items with cartItems
  useEffect(() => {
    setItems(cartItems);
  }, [cartItems]);

  // Countdown timer för utgång
  useEffect(() => {
    if (!cartItems.length) return;

    const interval = setInterval(() => {
      setItems((prevItems) => {
        const updatedItems: CartItemWithTimeLeft[] = [];
        let hasExpired = false;

        prevItems.forEach((item) => {
          // Skip if item doesn't exist in current cartItems (removed)
          const stillInCart = cartItems.find(cartItem => cartItem.id === item.id);
          if (!stillInCart) return;

          const now = new Date();
          
          // Safety check for expiresAt
          if (!item.expiresAt) {
            updatedItems.push(item);
            return;
          }
          
          const diff = new Date(item.expiresAt).getTime() - now.getTime();
          
          if (diff <= 0) {
            hasExpired = true;
            removeFromCartRef.current(item.id);
            toastRef.current({
              title: `${item.title} har utgått`,
              description:
                'Erbjudandet är inte längre tillgängligt och har tagits bort från varukorgen.',
              variant: 'destructive',
            });
            return;
          }

          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          updatedItems.push({
            ...item,
            timeLeft: { hours, minutes, seconds },
          } as CartItemWithTimeLeft);
        });

        return updatedItems;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cartItems]);

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
