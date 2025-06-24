/*'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BoostInfoCard from "@/components/boost/boostInfoFile";
import BoostTypeSelector from "@/components/boost/boostTypeSelector";
import BoostDurationSelector from "@/components/boost/boostDurationSelector";
import BoostSummary from "@/components/boost/boostSummary";
import FloatingAdPreview from "@/components/boost/adPreview/floatingAdPreview";
import BannerAdPreview from "@/components/boost/adPreview/bannerAdPreview";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";


const BOOST_OPTIONS = [
    { type: "floating", pricePerHour: 20 },
    { type: "banner", pricePerHour: 10 },
];

export default function BoostPage() {
    const { id } = useParams();
    const [deal, setDeal] = useState<any>(null);
    const [boostType, setBoostType] = useState("floating");
    const [duration, setDuration] = useState(12);
    const [hasVerified, setHasVerified] = useState(false);
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const fetchDeals = async () => {
            const snap = await getDoc(doc(db, "deals", id as string));
            if (snap.exists()) setDeal({ id: snap.id, ...snap.data() });
        };
        fetchDeals();
    }, [id]);

    useEffect(() => {
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");

        if (success === "true" && !hasVerified) {
            setHasVerified(true);

            const boostType = localStorage.getItem("boostType");
            const duration = localStorage.getItem("boostDuration");
            console.log("BOOST VERIFY:", { boostType, duration, dealId: id });


            if (!boostType || !duration) {
                toast({
                    title: "Fel",
                    description: "Kunde inte verifiera boost-detaljer.",
                    variant: "destructive",
                });
                return;
            }

            fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dealId: id,
                    type: boostType,
                    duration: Number(duration),
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        toast({
                            title: "Boost aktiverad!",
                            description: "Ditt erbjudande är nu boostat.",
                        });

                        localStorage.removeItem("boostType");
                        localStorage.removeItem("boostDuration");
                    } else {
                        toast({
                            title: "Fel vid boost",
                            description: data.error || "Något gick fel.",
                            variant: "destructive",
                        });
                    }
                })
                .catch(() => {
                    toast({
                        title: "Serverfel",
                        description: "Kunde inte ansluta till servern.",
                        variant: "destructive",
                    });
                });
        }

        if (canceled === "true") {
            toast({
                title: "Betalning avbröts",
                description: "Din boost genomfördes inte.",
            });
        }
    }, [searchParams, id, toast, hasVerified]);

    const selectedBoost = BOOST_OPTIONS.find((b) => b.type === boostType);
    const totalCost = selectedBoost ? selectedBoost.pricePerHour * duration : 0;

    if (!deal) return <div className="p-6">Laddar erbjudande...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <BoostInfoCard deal={deal} />
            <BoostTypeSelector boostType={boostType} setBoostType={setBoostType} />
            <BoostDurationSelector duration={duration} setDuration={setDuration} />

            <div>
                <h2 className="text-lg font-medium mb-2">Förhandsgranskning</h2>
                <div className="border p-4 rounded-md bg-muted">
                    {boostType === "floating" ? (
                        <FloatingAdPreview deal={deal} />
                    ) : (
                        <BannerAdPreview deal={deal} />
                    )}
                </div>
            </div>

            <BoostSummary
                totalCost={totalCost}
                dealId={deal.id}
                boostType={boostType}
                duration={duration}
            />
        </div>
    );
}*/
