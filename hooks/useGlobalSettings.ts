'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export type ServiceFees = Record<string, number>;
export type BoostPrices =
  | { floatingPerHour?: number; bannerPerHour?: number }
  | { floating?: Record<string, number>; banner?: Record<string, number> };

export type GlobalSettings = {
  serviceFees: ServiceFees;
  boostPrices: BoostPrices;
};

const DEFAULT_SETTINGS: GlobalSettings = {
  serviceFees: {
    '12': 3, '24': 4, '36': 5, '48': 6, '72': 7, '96': 8, '120': 9,
    '144': 10, '168': 10, '192': 10, '216': 10, '240': 10, '264': 10,
    '288': 10, '312': 10, '336': 10,
  },
  boostPrices: { floatingPerHour: 20, bannerPerHour: 10 },
};

export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'settings', 'global');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<GlobalSettings>;
          setSettings({
            serviceFees: { ...DEFAULT_SETTINGS.serviceFees, ...(data.serviceFees || {}) },
            boostPrices: { ...DEFAULT_SETTINGS.boostPrices, ...(data.boostPrices || {}) } as BoostPrices,
          });
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  return { settings, loading };
}

// Använder exakt nivå om den finns, annars närmsta lägre. Ingen låsning.
export function feeForDuration(serviceFees: ServiceFees, duration: number): number {
  const exact = serviceFees[String(duration)];
  if (typeof exact === 'number') return exact;

  const keys = Object.keys(serviceFees)
    .map((k) => parseInt(k, 10))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  let best = serviceFees[String(keys[0])];
  for (const k of keys) {
    if (duration >= k) best = serviceFees[String(k)];
    else break;
  }
  return typeof best === 'number' ? best : 10;
}

// Stöd för per-duration tabeller (om du lägger till det senare) + fallback per timme
export function boostPriceFor(
  boost: BoostPrices,
  placement: 'floating' | 'banner',
  duration: number
): number {
  if ('floating' in boost || 'banner' in boost) {
    const table = (boost as any)[placement] as Record<string, number> | undefined;
    if (table) {
      const exact = table[String(duration)];
      if (typeof exact === 'number') return exact;

      const keys = Object.keys(table)
        .map((k) => parseInt(k, 10))
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

      let best = table[String(keys[0])];
      for (const k of keys) {
        if (duration >= k) best = table[String(k)];
        else break;
      }
      if (typeof best === 'number') return best;
    }
  }

  const perHour =
    placement === 'floating'
      ? (boost as any).floatingPerHour ?? 20
      : (boost as any).bannerPerHour ?? 10;

  return duration * perHour;
}
