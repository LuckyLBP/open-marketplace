'use client';

import { useState } from 'react';
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
import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import BannerAdPreview from '@/components/boost/adPreview/bannerAdPreview';
import FloatingAdPreview from '@/components/boost/adPreview/floatingAdPreview';
import { getDoc, doc } from 'firebase/firestore';

interface BoostDialogProps {
    dealId: string;
    dealTitle: string;
    dealDescription?: string;
}

export function BoostDialog({ dealId, dealTitle, dealDescription }: BoostDialogProps) {
    const router = useRouter();
    const { toast } = useToast();

    const [placement, setPlacement] = useState<'floating' | 'banner'>('floating');
    const [duration, setDuration] = useState<'12' | '24' | '36'>('12');
    const [loading, setLoading] = useState(false);
    const [dealData, setDealData] = useState<any>(null);

    useEffect(() => {
        const fetchDeal = async () => {
            const ref = doc(db, 'deals', dealId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setDealData(snap.data());
            }
        };
        fetchDeal();
    }, [dealId]);

    const getPrice = () => {
        const hours = parseInt(duration);
        const ratePerHour = placement === 'floating' ? 20 : 10;
        return hours * ratePerHour;
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const payload = {
                dealId,
                type: placement,
                duration: parseInt(duration),
                price: getPrice(),
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
        } catch (err) {

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
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">Boost</Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl z-[9999]"> {/* extra z-index för säkerhets skull */}
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

                        <div>
                            <Label>Förhandsgranskning</Label>
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

                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <p className="text-lg font-semibold">Pris: {getPrice()} kr</p>
                            <Button onClick={handleCheckout} disabled={loading}>
                                {loading ? 'Laddar...' : 'Fortsätt till betalning'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>


        </>
    );

}
