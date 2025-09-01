'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import BannerAdPreview from '@/components/boost/adPreview/bannerAdPreview';
import FloatingAdPreview from '@/components/boost/adPreview/floatingAdPreview';
import { getDoc, doc } from 'firebase/firestore';

// 👇 NYTT: hämta pricing från Firestore settings
import { useGlobalSettings, boostPriceFor } from '@/hooks/useGlobalSettings';

interface BoostDialogProps {
    dealId: string;
    dealTitle: string;
    dealDescription?: string;
}

export function BoostDialog({ dealId, dealTitle }: BoostDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { settings } = useGlobalSettings(); // 🔁 settings.global

    const [placement, setPlacement] = useState<'floating' | 'banner'>('floating');
    const [duration, setDuration] = useState<'12' | '24' | '36'>('12');
    const [loading, setLoading] = useState(false);
    const [dealData, setDealData] = useState<any>(null);

    useEffect(() => {
        const fetchDeal = async () => {
            const ref = doc(db, 'deals', dealId);
            const snap = await getDoc(ref);
            if (snap.exists()) setDealData(snap.data());
        };
        fetchDeal();
    }, [dealId]);

    // 🔁 Pris direkt från settings (stöder både per-hour och per-duration-tabell)
    const getPrice = () => {
        const hours = parseInt(duration, 10);
        return boostPriceFor(settings.boostPrices, placement, hours);
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const payload = {
                dealId,
                type: placement,
                duration: parseInt(duration, 10),
                price: getPrice(), // klient-info; server ska räkna om och bestämma priset
            };

            const res = await fetch('/api/boost-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.url) {
                localStorage.setItem('boostDealId', dealId);
                localStorage.setItem('boostType', placement);
                localStorage.setItem('boostDuration', duration);
                router.push(data.url);
            } else {
                setTimeout(() => {
                    toast({
                        title: 'Kunde inte starta boost',
                        description: data?.error || 'Ett fel uppstod.',
                        variant: 'destructive',
                    });
                }, 100);
            }
        } catch {
            setTimeout(() => {
                toast({
                    title: 'Nätverksfel',
                    description: 'Kunde inte ansluta till servern.',
                    variant: 'destructive',
                });
            }, 100);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">Boost</Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl z-[9999]">
                <DialogHeader>
                    <DialogTitle>Boost: {dealTitle}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Placering */}
                    <div>
                        <Label>Välj placering</Label>
                        <RadioGroup
                            value={placement}
                            onValueChange={(val) => setPlacement(val as 'floating' | 'banner')}
                            className="flex gap-4 mt-2"
                        >
                            <div>
                                <RadioGroupItem value="floating" id="floating" />
                                <Label htmlFor="floating" className="ml-2">Floating Banner</Label>
                            </div>
                            <div>
                                <RadioGroupItem value="banner" id="banner" />
                                <Label htmlFor="banner" className="ml-2">Banner Annons</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Varaktighet */}
                    <div>
                        <Label>Välj varaktighet</Label>
                        <RadioGroup
                            value={duration}
                            onValueChange={(val) => setDuration(val as '12' | '24' | '36')}
                            className="flex gap-4 mt-2"
                        >
                            {['12', '24', '36'].map((d) => (
                                <div key={d}>
                                    <RadioGroupItem value={d} id={`d-${d}`} />
                                    <Label htmlFor={`d-${d}`} className="ml-2">{d} timmar</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Förhandsgranskning */}
                    <div>
                        <Label>Förhandsgranskning</Label>
                        <div className="border p-4 mt-2 rounded-md bg-muted">
                            {!dealData ? (
                                <p className="text-sm text-gray-500">Laddar förhandsgranskning...</p>
                            ) : placement === 'floating' ? (
                                <FloatingAdPreview deal={dealData} />
                            ) : (
                                <BannerAdPreview deal={dealData} />
                            )}
                        </div>
                    </div>

                    {/* Pris + CTA */}
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-lg font-semibold">Pris: {getPrice()} kr</p>
                        <Button onClick={handleCheckout} disabled={loading}>
                            {loading ? 'Laddar...' : 'Fortsätt till betalning'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
