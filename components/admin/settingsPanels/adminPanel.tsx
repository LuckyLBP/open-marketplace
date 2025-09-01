'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { useAdminDeals } from '@/hooks/useAdminDeals';
import { DealList } from '../dealList';
import { CompanySelector } from '../companySelector';
import { Deal } from '@/components/types/deal';

import GlobalPricingCard from './globalPricingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface EntityData {
  id: string;
  email: string;
  name?: string;
  orgNumber?: string;
}

export default function SuperAdminPanel() {
  const { activeDeals, expiredDeals, fetching } = useAdminDeals();

  // ---- Konton-fliken
  const [selectedType, setSelectedType] = useState<'company' | 'customer'>('company');
  const [entities, setEntities] = useState<EntityData[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  // ---- Erbjudanden-fliken
  const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
  const [tabDeals, setTabDeals] = useState<'active' | 'expired' | 'pending'>('active');
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);

  // Ladda konton
  useEffect(() => {
    const fetchEntities = async () => {
      const collectionName = selectedType === 'company' ? 'companies' : 'customers';
      const snapshot = await getDocs(collection(db, collectionName));
      const data = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          email: d.email ?? 'okänd',
          name: d.name ?? '',
          orgNumber: d.orgNumber ?? '',
          role: selectedType,
        } as EntityData;
      });
      setEntities(data);
    };
    fetchEntities();
  }, [selectedType]);

  // Ladda väntande deals
  useEffect(() => {
    const fetchPending = async () => {
      const snapshot = await getDocs(query(collection(db, 'deals'), where('status', '==', 'pending')));
      const mapped: any[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (!data.title || !data.companyId || !data.companyName) return null;
          return {
            id: doc.id,
            title: data.title,
            companyId: data.companyId,
            companyName: data.companyName,
            expiresAt: data.expiresAt?.toDate?.() || null,
            status: data.status,
            description: data.description,
          };
        })
        .filter(Boolean);
      setPendingDeals(mapped as Deal[]);
    };
    fetchPending();
  }, []);

  // Filtrera deals per flik
  useEffect(() => {
    const baseDeals =
      tabDeals === 'active' ? activeDeals :
        tabDeals === 'expired' ? expiredDeals :
          pendingDeals;

    setFilteredDeals(baseDeals);
  }, [tabDeals, activeDeals, expiredDeals, pendingDeals]);

  const handleDelete = async (id: string) => {
    const collectionName = selectedType === 'company' ? 'companies' : 'customers';
    await deleteDoc(doc(db, collectionName, id));
    setEntities(prev => prev.filter(u => u.id !== id));
    setSelectedId('');
  };

  const handleApprove = async (dealId: string) => {
    try {
      const dealRef = doc(db, 'deals', dealId);
      const dealSnap = await getDoc(dealRef);
      if (!dealSnap.exists()) return;

      const dealData = dealSnap.data();
      const now = new Date();
      const duration = dealData.duration || 24;
      const newExpiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

      await updateDoc(dealRef, { status: 'approved', expiresAt: newExpiresAt });
      setPendingDeals(prev => prev.filter(d => d.id !== dealId));
    } catch (e) {
      console.error('Fel vid godkännande:', e);
    }
  };

  const handleReject = async (dealId: string) => {
    await updateDoc(doc(db, 'deals', dealId), { status: 'rejected' });
    setPendingDeals(prev => prev.filter(d => d.id !== dealId));
  };

  const selectedEntity = entities.find(e => e.id === selectedId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Superadmin</h2>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
          <TabsTrigger value="deals">Erbjudanden</TabsTrigger>
          <TabsTrigger value="accounts">Konton</TabsTrigger>
        </TabsList>

        {/* INSTÄLLNINGAR */}
        <TabsContent value="settings" className="space-y-6">
          <GlobalPricingCard />
        </TabsContent>

        {/* ERBJUDANDEN */}
        <TabsContent value="deals" className="space-y-4">
          <div className="flex gap-3 border-b">
            <Button
              variant={tabDeals === 'active' ? 'default' : 'ghost'}
              onClick={() => setTabDeals('active')}
            >
              Aktiva
            </Button>
            <Button
              variant={tabDeals === 'expired' ? 'default' : 'ghost'}
              onClick={() => setTabDeals('expired')}
            >
              Utgångna
            </Button>
            <Button
              variant={tabDeals === 'pending' ? 'default' : 'ghost'}
              onClick={() => setTabDeals('pending')}
            >
              Väntande
            </Button>
          </div>

          {tabDeals === 'pending' ? (
            filteredDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga väntande erbjudanden.</p>
            ) : (
              <ul className="space-y-3">
                {filteredDeals.map((deal) => (
                  <li
                    key={deal.id}
                    className="p-4 rounded-lg bg-white border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{deal.title}</h3>
                      <p className="text-sm text-muted-foreground">{deal.description}</p>
                      <p className="text-sm mt-1"><strong>Skapad av:</strong> {deal.companyName}</p>
                    </div>

                    <div className="mt-3 md:mt-0 flex gap-2">
                      <Button onClick={() => handleApprove(deal.id)} className="bg-green-600 hover:bg-green-700">
                        Godkänn
                      </Button>
                      <Button onClick={() => handleReject(deal.id)} variant="destructive">
                        Avslå
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <DealList title="Erbjudanden" deals={filteredDeals} loading={fetching} />
          )}
        </TabsContent>

        {/* KONTON */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'company' | 'customer')}
              className="rounded-md border px-2 py-1 text-sm"
            >
              <option value="company">Företag</option>
              <option value="customer">Privatperson</option>
            </select>

            <CompanySelector
              companies={[{ id: '', email: 'Visa alla' }, ...entities.map(u => ({ id: u.id, email: u.email }))]}
              selectedCompanyId={selectedId}
              onChange={setSelectedId}
            />
          </div>

          {selectedId && selectedEntity && (
            <div className="p-4 rounded-lg bg-white border shadow-sm">
              <div className="grid sm:grid-cols-2 gap-2">
                <p><strong>E-post:</strong> {selectedEntity.email}</p>
                <p><strong>Namn:</strong> {selectedEntity.name || 'Saknas'}</p>
                {selectedType === 'company' && (
                  <p><strong>Organisationsnummer:</strong> {selectedEntity.orgNumber || 'Saknas'}</p>
                )}
              </div>

              <div className="mt-3">
                <Button onClick={() => handleDelete(selectedId)} variant="destructive">
                  Ta bort konto
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
