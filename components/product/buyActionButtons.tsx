'use client';

import { useState } from "react";
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
  const router = useRouter();
  const { addToCart } = useCartContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = () => {
    addToCart(deal, 1);
    toast({
      title: t("Produkt tillagd."),
      description: `${deal.title} har lagts till i din varukorg.`,
    });
  };

  const handleBuyNow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: deal.id,
              quantity: 1,
              accountType: deal.accountType === "customer" ? "customer" : "company",
              feePercentage: deal.feePercentage,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: t("Kunde inte starta betalningen"),
          description: data?.error || "Okänt fel.",
          variant: "destructive",
        });
        return;
      }

      const clientSecret: string | undefined = data?.clientSecret;
      const paymentIntentId = clientSecret?.split("_secret_")?.[0];

      if (!clientSecret || !paymentIntentId) {
        toast({
          title: t("Fel"),
          description: t("Oväntat svar från betalningstjänsten."),
          variant: "destructive",
        });
        return;
      }

      // ✅ Dirigera till din nya checkout/[id]
      router.push(`/checkout/${paymentIntentId}`);
    } catch (error) {
      console.error("BuyNow error:", error);
      toast({
        title: t("Fel"),
        description: t("Ett tekniskt fel uppstod."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-3">
      <Button type="button" onClick={handleAddToCart} className="bg-purple-600 text-white">
        <ShoppingCart className="w-4 h-4 mr-2" />
        {t("Lägg till i varukorgen")}
      </Button>

      <Button
        type="button"
        onClick={handleBuyNow}
        disabled={loading}
        className="bg-pink-600 text-white"
      >
        {loading ? t("Initierar…") : t("Köp nu")}
      </Button>

      <Button type="button" onClick={handleAddToWishlist} variant="outline">
        <Heart className="w-4 h-4 mr-2" />
        {t("Önskelista")}
      </Button>

      <Button type="button" onClick={handleShare} variant="outline">
        <Share className="w-4 h-4 mr-2" />
        {t("Dela")}
      </Button>
    </div>
  );
};

export default BuyActionButtons;
