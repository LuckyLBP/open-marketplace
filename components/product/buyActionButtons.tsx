import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCartContext } from "../cart/cartProvider";
import { Deal } from "../types/deal";
import { Heart, Share, ShoppingCart } from "lucide-react";

interface Props {
  t: (key: string) => string;
  handleAddToWishlist: () => void;
  handleShare: () => void;
  deal: Deal;
}

const BuyActionButtons = ({ t, handleAddToWishlist, handleShare, deal }: Props) => {
  const { addToCart } = useCartContext();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(deal, 1);
    toast({
      title: t("Produkt tillagt."),
      description: `${deal.title} har lagts till i din varukorg.`,
    });
  };

  const handleBuyNow = async () => {
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: deal.id,
              title: deal.title,
              price: deal.price,
              quantity: 1,
              sellerId: deal.companyId,
              stripeAccountId: deal.stripeAccountId,
              feePercentage: deal.feePercentage,
            },
          ],
        }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: t("Fel"),
          description: t("Kunde inte starta betalningen."),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Stripe Payment Intent Error:", error);
      toast({
        title: t("Fel"),
        description: t("Ett tekniskt fel uppstod."),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-3">
      <Button onClick={handleAddToCart} className="bg-purple-600 text-white">
        <ShoppingCart className="w-4 h-4 mr-2" />
        {t("Lägg till i varukorgen")}
      </Button>
      <Button onClick={handleBuyNow} className="bg-pink-600 text-white">
        {t("Köp nu")}
      </Button>
      <Button onClick={handleAddToWishlist} variant="outline">
        <Heart className="w-4 h-4 mr-2" />
        {t("Önskelista")}
      </Button>
      <Button onClick={handleShare} variant="outline">
        <Share className="w-4 h-4 mr-2" />
        {t("Dela")}
      </Button>
    </div>
  );
};

export default BuyActionButtons;
