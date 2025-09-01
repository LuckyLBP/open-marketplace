'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';

type ServiceFees = Record<string, number>;
type BoostPrices = { floatingPerHour?: number; bannerPerHour?: number };
type GlobalSettingsDoc = { serviceFees?: ServiceFees; boostPrices?: BoostPrices };

// ✅ Upp till 30 dagar: 12,24,36,48h och därefter varje 24:e timme till 720h
const PRESET_DURATIONS: number[] = (() => {
  const arr = [12, 24, 36, 48];
  for (let h = 72; h <= 720; h += 24) arr.push(h);
  return arr;
})();

export default function GlobalPricingCard() {
  const [loading, setLoading] = useState(true);

  // fees & boost
  const [serviceFees, setServiceFees] = useState<ServiceFees>({});
  const [floatingPerHour, setFloatingPerHour] = useState<string>('20');
  const [bannerPerHour, setBannerPerHour] = useState<string>('10');

  // UI state (endast dropdown + input)
  const [selectedDuration, setSelectedDuration] = useState<string>('24');
  const [selectedFee, setSelectedFee] = useState<string>('');

  useEffect(() => {
    (async () => {
      const ref = doc(db, 'settings', 'global');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as GlobalSettingsDoc;
        setServiceFees({ ...(data.serviceFees || {}) });
        setFloatingPerHour(String(data.boostPrices?.floatingPerHour ?? 20));
        setBannerPerHour(String(data.boostPrices?.bannerPerHour ?? 10));
      } else {
        // Defaults – basnivåer + 10% från 6 dagar och uppåt
        const base: ServiceFees = { '12': 3, '24': 4, '36': 5, '48': 6, '72': 7, '96': 8, '120': 9 };
        for (let h = 144; h <= 720; h += 24) base[String(h)] = 10;
        setServiceFees(base);
      }
      setLoading(false);
    })();
  }, []);

  // När man byter varaktighet, förifyll input med befintlig eller default (≥144h => 10%)
  useEffect(() => {
    const dur = parseInt(selectedDuration, 10);
    const current = serviceFees[String(dur)];
    if (typeof current === 'number') {
      setSelectedFee(String(current));
    } else {
      setSelectedFee(dur >= 144 ? '10' : '');
    }
  }, [selectedDuration, serviceFees]);

  const addOrUpdateFee = () => {
    const dur = parseInt(selectedDuration, 10);
    const fee = Number(selectedFee);
    if (!Number.isFinite(dur) || dur <= 0) return;
    if (!Number.isFinite(fee) || fee < 0) return;
    setServiceFees(prev => ({ ...prev, [String(dur)]: fee }));
  };

  const removeSelectedLevel = () => {
    const dur = parseInt(selectedDuration, 10);
    const copy = { ...serviceFees };
    delete copy[String(dur)];
    setServiceFees(copy);
    // Återställ input till default för visuell feedback
    setSelectedFee(dur >= 144 ? '10' : '');
  };

  const saveAll = async () => {
    const ref = doc(db, 'settings', 'global');

    // Städa numeriska värden
    const cleaned: ServiceFees = {};
    for (const [k, v] of Object.entries(serviceFees)) {
      const dk = String(parseInt(k, 10));
      const dv = Number(v);
      if (Number.isFinite(Number(dk)) && Number.isFinite(dv)) cleaned[dk] = dv;
    }

    // ✅ Backfill enligt din regel: ≥144h = 10% om inget annat är satt
    for (let h = 144; h <= 720; h += 24) {
      if (cleaned[String(h)] == null) cleaned[String(h)] = 10;
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

  const sortedDurations = useMemo(() => PRESET_DURATIONS, []);

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Globala priser & avgifter</h3>
        <p className="text-sm text-muted-foreground">
          Ändringar uppdaterar direkt CreateDealForm, Boost-dialogen och checkoutflödet.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Laddar…</p>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {/* Serviceavgifter – endast dropdown + input */}
          <AccordionItem value="fees" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3">Serviceavgifter (%) per varaktighet</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Varaktighet (dropdown)</Label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger><SelectValue placeholder="Välj varaktighet" /></SelectTrigger>
                    {/* Scrollbar på lång lista */}
                    <SelectContent className="max-h-80 overflow-y-auto">
                      {sortedDurations.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h <= 48 ? `${h} timmar` : `${h / 24} dagar`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Avgift (%)</Label>
                  <Input
                    type="number"
                    placeholder="t.ex. 10"
                    value={selectedFee}
                    onChange={(e) => setSelectedFee(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button variant="secondary" onClick={addOrUpdateFee}>Lägg till / uppdatera nivå</Button>
                <Button variant="ghost" onClick={removeSelectedLevel}>Ta bort vald nivå</Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Boostpriser (lämnas kvar) */}
          <AccordionItem value="boost" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3">Boostpriser (SEK / timme)</AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Floating – SEK/timme</Label>
                  <Input type="number" min={0} value={floatingPerHour} onChange={(e) => setFloatingPerHour(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Banner – SEK/timme</Label>
                  <Input type="number" min={0} value={bannerPerHour} onChange={(e) => setBannerPerHour(e.target.value)} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div className="mt-5">
        <Button onClick={saveAll}>Spara ändringar</Button>
      </div>
    </div>
  );
}
