'use client';

import Image from 'next/image';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartContext } from './cartProvider';
import { CartItem } from '@/hooks/useCart';

interface CartItemWithTimeLeft extends CartItem {
  timeLeft?: { hours: number; minutes: number; seconds: number };
}

interface CartItemCardProps {
  item: CartItemWithTimeLeft;
  onMoveToWishlist: (id: string) => void;
}

const CartItemCard = ({ item, onMoveToWishlist }: CartItemCardProps) => {
  const { removeFromCart, addToCart } = useCartContext();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || !item?.id) return;
    addToCart(item, newQuantity - item.quantity);
  };

  if (!item?.id) {
    return null; // Don't render if item is invalid
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-32 h-32 relative flex-shrink-0">
          <Image
            src={item.images?.[0]?.url || '/placeholder.jpg'}
            alt={item.title}
            fill
            className="rounded-md object-cover"
          />
        </div>

        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-1">
                Säljare: {item.companyName}
              </p>
              {item.timeLeft && (
                <div className="text-sm mb-4 text-rose-600">
                  Erbjudandet går ut om:{' '}
                  {item.timeLeft.hours.toString().padStart(2, '0')}:
                  {item.timeLeft.minutes.toString().padStart(2, '0')}:
                  {item.timeLeft.seconds.toString().padStart(2, '0')}
                </div>
              )}
            </div>

            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => removeFromCart(item.id)}
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
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                  className="w-10 h-8 border-y border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  className="w-8 h-8 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-100"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="text-sm flex items-center text-gray-600 hover:text-purple-600"
                onClick={() => onMoveToWishlist(item.id)}
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
  );
};

export default CartItemCard;
