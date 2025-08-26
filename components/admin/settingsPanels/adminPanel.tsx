'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdminDeals } from '@/hooks/useAdminDeals';
import { DealList } from '../dealList';
import { CompanySelector } from '../companySelector';
import CompanyList from '../companyList';
import CustomerList from '../customerList';
import { Deal } from '@/components/types/deal';

export default function AdminPanel() {
  const { activeDeals, expiredDeals, fetching } = useAdminDeals();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(''); // '' = alla
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
  const [tab, setTab] = useState<'active' | 'expired' | 'pending'>('active');

  useEffect(() => {
    const fetchCompanies = async () => {
      const snapshot = await getDocs(collection(db, 'companies'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCompanies(data);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) {
      setSelectedCompany(null);
      return;
    }
    const company = companies.find((c) => c.id === selectedCompanyId);
    setSelectedCompany(company || null);
  }, [selectedCompanyId, companies]);

  useEffect(() => {
    const fetchPendingDeals = async () => {
      const snapshot = await getDocs(collection(db, 'deals'));
      const mapped: any[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (
            !data.title ||
            !data.companyId ||
            !data.companyName ||
            !data.expiresAt
          )
            return null;

          return {
            id: doc.id,
            title: data.title,
            companyId: data.companyId,
            companyName: data.companyName,
            expiresAt: data.expiresAt.toDate
              ? data.expiresAt.toDate()
              : new Date(data.expiresAt),
            status: data.status,
            description: data.description,
          };
        })
        .filter((deal) => !!deal && deal.status === 'pending');

      setPendingDeals(mapped as Deal[]);
    };
    fetchPendingDeals();
  }, []);

  const handleApprove = async (dealId: string) => {
    await updateDoc(doc(db, 'deals', dealId), { status: 'approved' });
    setPendingDeals((prev) => prev.filter((d) => d.id !== dealId));
  };

  const handleReject = async (dealId: string) => {
    await updateDoc(doc(db, 'deals', dealId), { status: 'rejected' });
    setPendingDeals((prev) => prev.filter((d) => d.id !== dealId));
  };

  const filteredActive = selectedCompanyId
    ? activeDeals.filter((d) => d.companyId === selectedCompanyId)
    : activeDeals;
  const filteredExpired = selectedCompanyId
    ? expiredDeals.filter((d) => d.companyId === selectedCompanyId)
    : expiredDeals;
  const filteredPending = selectedCompanyId
    ? pendingDeals.filter((d) => d.companyId === selectedCompanyId)
    : pendingDeals;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Admin</h2>
        <CompanySelector
          companies={[
            { id: '', email: 'Visa alla' },
            ...companies.map((c) => ({ id: c.id, email: c.email })),
          ]}
          selectedCompanyId={selectedCompanyId}
          onChange={setSelectedCompanyId}
        />
      </div>

      {selectedCompany && (
        <div className="p-4 rounded-lg bg-white border shadow-sm">
          <p>
            <strong>E-post:</strong> {selectedCompany.email}
          </p>
        </div>
      )}

      <div>
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setTab('active')}
            className={
              tab === 'active' ? 'border-b-2 font-semibold pb-2' : 'pb-2'
            }
          >
            Aktiva
          </button>
          <button
            onClick={() => setTab('expired')}
            className={
              tab === 'expired' ? 'border-b-2 font-semibold pb-2' : 'pb-2'
            }
          >
            Utgångna
          </button>
          <button
            onClick={() => setTab('pending')}
            className={
              tab === 'pending' ? 'border-b-2 font-semibold pb-2' : 'pb-2'
            }
          >
            Väntande
          </button>
        </div>

        <div className="mt-4">
          {tab === 'active' && (
            <DealList
              title="Aktiva erbjudanden"
              deals={filteredActive}
              loading={fetching}
            />
          )}
          {tab === 'expired' && (
            <DealList
              title="Utgångna erbjudanden"
              deals={filteredExpired}
              loading={fetching}
            />
          )}
          {tab === 'pending' &&
            (filteredPending.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Inga väntande erbjudanden.
              </p>
            ) : (
              <ul className="space-y-3">
                {filteredPending.map((deal) => (
                  <li
                    key={deal.id}
                    className="p-4 rounded-lg bg-white border shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{deal.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {deal.description}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Skapad av:</strong> {deal.companyName}
                      </p>
                    </div>
                    <div className="flex gap-2">
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
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold">Företagskonton</h3>
          <div className="mt-3">
            <CompanyList />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Privatpersoner</h3>
          <div className="mt-3">
            <CustomerList />
          </div>
        </div>
      </div>
    </div>
  );
}
