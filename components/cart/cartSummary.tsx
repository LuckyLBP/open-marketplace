'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, X } from 'lucide-react';
import { useCartContext } from './cartProvider';
import { useToast } from '@/components/ui/use-toast';

const CartSummary = () => {
  const { cartItems, getTotal } = useCartContext();
  const { toast } = useToast();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const subtotal = getTotal();
  const discountAmount = subtotal * (discount / 100);
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal - discountAmount + shipping;

  const applyPromoCode = () => {
    if (!promoCode.trim()) return;

    if (promoCode.toUpperCase() === 'Test10') {
      setDiscount(10);
      setAppliedPromo(promoCode);
      toast({
        title: 'Rabattkod tillagd!',
        description: '10% rabatt har applicerats på din beställning.',
      });
    } else {
      toast({
        title: 'Ogiltig rabattkod',
        description: 'Koden är inte giltig eller har utgått.',
        variant: 'destructive',
      });
    }

    setPromoCode('');
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Kunde inte initiera betalning', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ title: 'Något gick fel', variant: 'destructive' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-4">Ordersammanfattning</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Delsumma</span>
          <span>{subtotal.toFixed(2)} kr</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Rabatt ({discount}%)</span>
            <span>-{discountAmount.toFixed(2)} kr</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Frakt</span>
          <span>{shipping === 0 ? 'Gratis' : `${shipping.toFixed(2)} kr`}</span>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-bold">
          <span>Summa</span>
          <span>{total.toFixed(2)} kr</span>
        </div>
      </div>

      {!appliedPromo ? (
        <div className="mb-6">
          <label htmlFor="promo-code" className="block text-sm font-medium mb-2">
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
          <p className="text-xs text-gray-500 mt-1">Testa "Test10" för 10% rabatt</p>
        </div>
      ) : (
        <div className="mb-6 bg-green-50 p-3 rounded-md flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-green-700">
              Rabattkod: {appliedPromo}
            </span>
            <p className="text-xs text-green-600">10% rabatt applicerad</p>
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

      <Button
        className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        onClick={handleCheckout}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        Gå till kassan
      </Button>

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
  );
};

export default CartSummary;
