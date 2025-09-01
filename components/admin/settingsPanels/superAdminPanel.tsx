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
import CustomerList from '../customerList';

import GlobalPricingCard from './globalPricingCard';

interface EntityData {
  id: string;
  email: string;
  name?: string;
  orgNumber?: string;
}

export default function SuperAdminPanel() {
  const { activeDeals, expiredDeals, fetching } = useAdminDeals();
  const [selectedType, setSelectedType] = useState<'company' | 'customer'>('company');
  const [entities, setEntities] = useState<EntityData[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [tab, setTab] = useState<'active' | 'expired' | 'pending'>('active');

  useEffect(() => {
    const fetchEntities = async () => {
      const collectionName = selectedType === 'company' ? 'companies' : 'customers';
      const snapshot = await getDocs(collection(db, collectionName));
      const data = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email ?? 'okänd',
          name: data.name ?? '',
          orgNumber: data.orgNumber ?? '',
          role: selectedType,
        } as EntityData;
      });
      setEntities(data);
    };
    fetchEntities();
  }, [selectedType]);

  useEffect(() => {
    const fetchPending = async () => {
      const snapshot = await getDocs(
        query(collection(db, 'deals'), where('status', '==', 'pending'))
      );
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
        .filter((deal) => !!deal);
      setPendingDeals(mapped as Deal[]);
    };
    fetchPending();
  }, []);

  useEffect(() => {
    const baseDeals =
      tab === 'active'
        ? activeDeals
        : tab === 'expired'
          ? expiredDeals
          : pendingDeals;

    const relevantDeals = selectedId
      ? baseDeals.filter((deal) => deal.companyId === selectedId)
      : baseDeals;

    setFilteredDeals(relevantDeals);
  }, [selectedId, tab, activeDeals, expiredDeals, pendingDeals]);

  const handleDelete = async (id: string) => {
    const collectionName = selectedType === 'company' ? 'companies' : 'customers';
    await deleteDoc(doc(db, collectionName, id));
    setEntities((prev) => prev.filter((u) => u.id !== id));
    setSelectedId('');
  };

  const handleApprove = async (dealId: string) => {
    try {
      const dealRef = doc(db, 'deals', dealId);
      const dealSnap = await getDoc(dealRef);

      if (!dealSnap.exists()) {
        console.warn('Deal not found');
        return;
      }

      const dealData = dealSnap.data();
      const now = new Date();

      const duration = dealData.duration || 24;
      const newExpiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

      await updateDoc(dealRef, {
        status: 'approved',
        expiresAt: newExpiresAt,
      });

      setPendingDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (error) {
      console.error('Fel vid godkännande av erbjudande:', error);
    }
  };

  const handleReject = async (dealId: string) => {
    await updateDoc(doc(db, 'deals', dealId), { status: 'rejected' });
    setPendingDeals((prev) => prev.filter((d) => d.id !== dealId));
  };

  const selectedEntity = entities.find((e) => e.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Superadmin</h2>
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
            companies={[
              { id: '', email: 'Visa alla' },
              ...entities.map((u) => ({ id: u.id, email: u.email })),
            ]}
            selectedCompanyId={selectedId}
            onChange={setSelectedId}
          />
        </div>
      </div>

      {/* 👉 NYTT: Globala priser & avgifter */}
      <GlobalPricingCard />

      {selectedId && selectedEntity && (
        <div className="p-4 rounded-lg bg-white border shadow-sm">
          <p>
            <strong>E-post:</strong> {selectedEntity.email}
          </p>
          <p>
            <strong>Namn:</strong> {selectedEntity.name || 'Saknas'}
          </p>
          {selectedType === 'company' && (
            <p>
              <strong>Organisationsnummer:</strong> {selectedEntity.orgNumber || 'Saknas'}
            </p>
          )}

          <div className="mt-3">
            <button
              onClick={() => handleDelete(selectedId)}
              className="bg-red-600 text-white px-3 py-1 rounded-md"
            >
              Ta bort konto
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setTab('active')}
            className={tab === 'active' ? 'border-b-2 font-semibold pb-2' : 'pb-2'}
          >
            Aktiva
          </button>
          <button
            onClick={() => setTab('expired')}
            className={tab === 'expired' ? 'border-b-2 font-semibold pb-2' : 'pb-2'}
          >
            Utgångna
          </button>
          <button
            onClick={() => setTab('pending')}
            className={tab === 'pending' ? 'border-b-2 font-semibold pb-2' : 'pb-2'}
          >
            Väntande
          </button>
        </div>

        <div className="mt-4">
          {tab === 'pending' ? (
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
                      <p className="text-sm mt-1">
                        <strong>Skapad av:</strong> {deal.companyName}
                      </p>
                    </div>

                    <div className="mt-3 md:mt-0 flex gap-2">
                      <button
                        onClick={() => handleApprove(deal.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-md"
                      >
                        Godkänn
                      </button>
                      <button
                        onClick={() => handleReject(deal.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md"
                      >
                        Avslå
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <DealList title="Erbjudanden" deals={filteredDeals} loading={fetching} />
          )}
        </div>
      </div>
    </div>
  );
}
