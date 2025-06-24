"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function BoostSummary({
    totalCost,
    dealId,
    boostType,
    duration,
}: {
    totalCost: number;
    dealId: string;
    boostType: string;
    duration: number;
}) {
    const { toast } = useToast();
    const router = useRouter();

    const handleCheckout = async () => {
        try {
            const res = await fetch("/api/boost-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dealId, boostType, duration, price: totalCost }),
            });

            const data = await res.json();

            if (res.ok && data.url) {
                router.push(data.url);
            } else {
                toast({
                    title: "Fel vid betalning",
                    description: data.error || "Kunde inte skapa betalningssession",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Tekniskt fel",
                description: "Kunde inte kontakta servern",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="text-center">
            <p className="text-lg font-semibold mb-2">Totalt: {totalCost} kr</p>
            <Button onClick={handleCheckout} className="bg-red-600 hover:bg-red-700 text-white">
                Fortsätt till betalning
            </Button>
        </div>
    );
}