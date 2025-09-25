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
import BannerManagement from '../bannerManagement';

interface EntityData {
  id: string;
  email: string;
  name?: string;
  orgNumber?: string;
}

export default function SuperAdminPanel() {
  const { activeDeals, expiredDeals, fetching } = useAdminDeals();
  const [selectedType, setSelectedType] = useState<'company' | 'customer'>(
    'company'
  );
  const [entities, setEntities] = useState<EntityData[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [tab, setTab] = useState<'active' | 'expired' | 'pending'>('active');
  const [featureTab, setFeatureTab] = useState<
    'pricing' | 'entities' | 'deals' | 'banners'
  >('pricing');

  useEffect(() => {
    const fetchEntities = async () => {
      const collectionName =
        selectedType === 'company' ? 'companies' : 'customers';
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
    const collectionName =
      selectedType === 'company' ? 'companies' : 'customers';
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
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Superadmin Dashboard
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as 'company' | 'customer')
              }
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      </div>

      {/* Feature Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setFeatureTab('pricing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                featureTab === 'pricing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                Globala priser
              </div>
            </button>
            <button
              onClick={() => setFeatureTab('entities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                featureTab === 'entities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Företag & Kunder
              </div>
            </button>
            <button
              onClick={() => setFeatureTab('deals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                featureTab === 'deals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Erbjudanden
              </div>
            </button>
            <button
              onClick={() => setFeatureTab('banners')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                featureTab === 'banners'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
                Banners
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {featureTab === 'pricing' && <GlobalPricingCard />}

          {featureTab === 'entities' && (
            <div className="space-y-6">
              {selectedId && selectedEntity ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedType === 'company'
                        ? 'Företagsinformation'
                        : 'Kundinformation'}
                    </h3>
                    <button
                      onClick={() => handleDelete(selectedId)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Ta bort konto
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">
                        E-post
                      </p>
                      <p className="text-gray-900 mt-1">
                        {selectedEntity.email}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">Namn</p>
                      <p className="text-gray-900 mt-1">
                        {selectedEntity.name || 'Saknas'}
                      </p>
                    </div>
                    {selectedType === 'company' && (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600">
                          Organisationsnummer
                        </p>
                        <p className="text-gray-900 mt-1">
                          {selectedEntity.orgNumber || 'Saknas'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Välj ett företag eller kund från listan ovan för att se
                    detaljer
                  </p>
                </div>
              )}
            </div>
          )}

          {featureTab === 'deals' && (
            <div className="space-y-6">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTab('active')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                    tab === 'active'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Aktiva
                </button>
                <button
                  onClick={() => setTab('expired')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                    tab === 'expired'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Utgångna
                </button>
                <button
                  onClick={() => setTab('pending')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                    tab === 'pending'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Väntande
                </button>
              </div>

              <div>
                {tab === 'pending' ? (
                  filteredDeals.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">Inga väntande erbjudanden</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                              {deal.title}
                            </h4>
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              Väntande
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {deal.description}
                          </p>

                          <div className="bg-white rounded-md p-2 mb-3">
                            <p className="text-xs text-gray-500">Skapad av</p>
                            <p className="text-sm font-medium text-gray-900">
                              {deal.companyName}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(deal.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200"
                            >
                              Godkänn
                            </button>
                            <button
                              onClick={() => handleReject(deal.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200"
                            >
                              Avslå
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <DealList title="" deals={filteredDeals} loading={fetching} />
                )}
              </div>
            </div>
          )}

          {featureTab === 'banners' && <BannerManagement />}
        </div>
      </div>
    </div>
  );
}
