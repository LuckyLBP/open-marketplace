'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ServiceFees = Record<string, number>;
type BoostPrices = {
    floatingPerHour?: number;
    bannerPerHour?: number;
};

type GlobalSettingsDoc = {
    serviceFees?: ServiceFees;
    boostPrices?: BoostPrices;
};

const DEFAULT_SERVICE_FEES: ServiceFees = {
    '12': 3, '24': 4, '36': 5, '48': 6, '72': 7, '96': 8, '120': 9,
    '144': 10, '168': 10, '192': 10, '216': 10, '240': 10, '264': 10,
    '288': 10, '312': 10, '336': 10,
};

export default function GlobalPricingCard() {
    const [loading, setLoading] = useState(true);
    const [serviceFees, setServiceFees] = useState<ServiceFees>({});
    const [floatingPerHour, setFloatingPerHour] = useState<number>(20);
    const [bannerPerHour, setBannerPerHour] = useState<number>(10);
    const [newDuration, setNewDuration] = useState<string>('');

    useEffect(() => {
        (async () => {
            const ref = doc(db, 'settings', 'global');
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data() as GlobalSettingsDoc;
                setServiceFees({ ...DEFAULT_SERVICE_FEES, ...(data.serviceFees || {}) });
                setFloatingPerHour(
                    typeof data.boostPrices?.floatingPerHour === 'number'
                        ? data.boostPrices!.floatingPerHour!
                        : 20
                );
                setBannerPerHour(
                    typeof data.boostPrices?.bannerPerHour === 'number'
                        ? data.boostPrices!.bannerPerHour!
                        : 10
                );
            } else {
                // Inget dokument ännu → visa defaults
                setServiceFees({ ...DEFAULT_SERVICE_FEES });
                setFloatingPerHour(20);
                setBannerPerHour(10);
            }
            setLoading(false);
        })();
    }, []);

    const durationKeys = useMemo(
        () => Object.keys(serviceFees).map(Number).sort((a, b) => a - b),
        [serviceFees]
    );

    const addDurationRow = () => {
        const n = Number(newDuration);
        if (!Number.isFinite(n) || n <= 0) {
            alert('Ange en giltig varaktighet i timmar (heltal > 0).');
            return;
        }
        setServiceFees(prev => ({ ...prev, [String(n)]: prev[String(n)] ?? 0 }));
        setNewDuration('');
    };

    const removeDurationRow = (h: number) => {
        // Skydda några vanliga nycklar om du vill – men här tillåter vi ta bort alla
        const copy = { ...serviceFees };
        delete copy[String(h)];
        setServiceFees(copy);
    };

    const save = async () => {
        const ref = doc(db, 'settings', 'global');
        // Rensa icke-numeriska keys/values
        const cleaned: ServiceFees = {};
        for (const [k, v] of Object.entries(serviceFees)) {
            const hk = String(parseInt(k, 10)); // normalisera
            const hv = Number(v);
            if (Number.isFinite(Number(hk)) && Number.isFinite(hv)) {
                cleaned[hk] = hv;
            }
        }

        await setDoc(
            ref,
            {
                serviceFees: cleaned,
                boostPrices: {
                    floatingPerHour: Number(floatingPerHour) || 0,
                    bannerPerHour: Number(bannerPerHour) || 0,
                },
            },
            { merge: true }
        );
        alert('Inställningar sparade!');
    };

    if (loading) {
        return (
            <div className="border rounded p-4">
                <h3 className="font-semibold text-lg">Globala priser & avgifter</h3>
                <p className="text-sm text-muted-foreground mt-2">Laddar…</p>
            </div>
        );
    }

    return (
        <div className="border rounded p-4 space-y-5 bg-white shadow-sm">
            <h3 className="font-semibold text-lg">Globala priser & avgifter</h3>

            {/* Service Fees */}
            <div className="space-y-3">
                <div className="font-medium">Serviceavgifter (%) per varaktighet</div>

                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Lägg till varaktighet (timmar)"
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        className="max-w-[220px]"
                        type="number"
                        min={1}
                        step={1}
                    />
                    <Button variant="outline" onClick={addDurationRow}>
                        Lägg till rad
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-2 max-w-xl">
                    {durationKeys.map((h) => (
                        <div key={h} className="flex items-center gap-2">
                            <span className="w-24">{h <= 48 ? `${h}h` : `${h / 24}d`}</span>
                            <Input
                                type="number"
                                value={serviceFees[String(h)] ?? 0}
                                onChange={(e) =>
                                    setServiceFees((prev) => ({
                                        ...prev,
                                        [String(h)]: Number(e.target.value),
                                    }))
                                }
                            />
                            <Button
                                variant="ghost"
                                className="ml-1"
                                onClick={() => removeDurationRow(h)}
                            >
                                Ta bort
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Boost per-hour pricing */}
            <div className="grid md:grid-cols-2 gap-4 max-w-xl">
                <div>
                    <div className="font-medium mb-2">Boostpris – Floating (SEK/timme)</div>
                    <Input
                        type="number"
                        value={floatingPerHour}
                        onChange={(e) => setFloatingPerHour(Number(e.target.value))}
                        min={0}
                    />
                </div>
                <div>
                    <div className="font-medium mb-2">Boostpris – Banner (SEK/timme)</div>
                    <Input
                        type="number"
                        value={bannerPerHour}
                        onChange={(e) => setBannerPerHour(Number(e.target.value))}
                        min={0}
                    />
                </div>
            </div>

            <div>
                <Button onClick={save}>Spara ändringar</Button>
            </div>

            <p className="text-xs text-muted-foreground">
                Ändringarna slår igenom direkt i CreateDealForm, Boost-dialogen och checkout, eftersom dessa läser från <code>settings/global</code>.
            </p>
        </div>
    );
}

