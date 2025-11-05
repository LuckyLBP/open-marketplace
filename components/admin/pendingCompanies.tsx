'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { approveCompany } from '@/lib/approveCompanyClient';
import { Button } from '@/components/ui/button';

type Row = { id: string; companyName: string; email?: string };

export default function PendingCompanies() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(query(collection(db, 'companies'), where('status', '==', 'pending')));
      setRows(snap.docs.map(d => ({
        id: d.id,
        companyName: (d.data() as any).companyName || 'Företag',
        email: (d.data() as any).email,
      })));
    } catch (e: any) {
      setError(e?.message || 'Kunde inte hämta väntande företag');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const onApprove = async (id: string) => {
    try {
      await approveCompany(id);
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Godkännande misslyckades');
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Laddar väntande företag…</div>;
  if (error)   return <div className="text-sm text-red-600">{error}</div>;
  if (!rows.length) return null;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Väntande företag</h3>
        <Button variant="ghost" onClick={load}>Uppdatera</Button>
      </div>
      <ul className="space-y-2">
        {rows.map(r => (
          <li key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <div className="font-medium">{r.companyName}</div>
              {r.email && <div className="text-sm text-muted-foreground">{r.email}</div>}
            </div>
            <Button onClick={() => onApprove(r.id)} className="bg-green-600 hover:bg-green-700">
              Godkänn
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
