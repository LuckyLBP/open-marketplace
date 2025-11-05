'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCartContext } from '../cart/cartProvider';
import { Deal } from '../types/deal';
import { Share, ShoppingCart } from 'lucide-react';

interface Props {
  t: (key: string) => string;
  handleShare: () => void;
  deal: Deal;
}

const BuyActionButtons = ({ t, handleShare, deal }: Props) => {
  const router = useRouter();
  const { addToCart } = useCartContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = () => {
    addToCart(deal, 1);
    toast({
      title: t('Produkt tillagd.'),
      description: `${deal.title} har lagts till i din varukorg.`,
    });
  };

  const handleBuyNow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // First add the item to cart
      addToCart(deal, 1);

      // Then redirect to the proper checkout flow which handles buyer information
      router.push('/checkout/intent');
    } catch (error) {
      console.error('BuyNow error:', error);
      toast({
        title: t('Fel'),
        description: t('Ett tekniskt fel uppstod.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={handleBuyNow}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white h-12"
        >
          {loading ? (
            t('Vänta…')
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t('Köp nu')}
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={handleAddToCart}
          variant="outline"
          className="h-12"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t('Lägg till')}
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1" />
        <Button
          type="button"
          onClick={handleShare}
          variant="ghost"
          className="flex-0"
        >
          <Share className="w-4 h-4 mr-2" />
          {t('Dela')}
        </Button>
      </div>
    </div>
  );
};

export default BuyActionButtons;
