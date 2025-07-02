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
} from 'firebase/firestore';
import { useAdminDeals } from '@/hooks/useAdminDeals';
import { DealList } from '../dealList';
import { CompanySelector } from '../companySelector';
import { Deal } from '@/components/types/deal';
import CustomerList from '../customerList';

interface EntityData {
    id: string;
    email: string;
    name?: string;
    orgNumber?: string;
    role: 'company' | 'customer';
}

export default function SuperAdminPanel() {
    const { activeDeals, expiredDeals, fetching } = useAdminDeals();
    const [selectedType, setSelectedType] = useState<'company' | 'customer'>('company');
    const [entities, setEntities] = useState<EntityData[]>([]);
    const [selectedId, setSelectedId] = useState<string>(''); // tomt = Visa alla
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
            const snapshot = await getDocs(query(collection(db, 'deals'), where('status', '==', 'pending')));
            const deals: Deal[] = snapshot.docs
                .map((doc) => {
                    const data = doc.data();
                    if (!data.title || !data.companyId || !data.companyName || !data.expiresAt) return null;
                    return {
                        id: doc.id,
                        title: data.title,
                        companyId: data.companyId,
                        companyName: data.companyName,
                        expiresAt: data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt),
                        status: data.status,
                        description: data.description,
                    } as Deal;
                })
                .filter((deal): deal is Deal => !!deal);
            setPendingDeals(deals);
        };
        fetchPending();
    }, []);

    useEffect(() => {
        const baseDeals =
            tab === 'active' ? activeDeals :
                tab === 'expired' ? expiredDeals :
                    pendingDeals;

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
        await updateDoc(doc(db, 'deals', dealId), { status: 'approved' });
        setPendingDeals((prev) => prev.filter((d) => d.id !== dealId));
    };

    const handleReject = async (dealId: string) => {
        await updateDoc(doc(db, 'deals', dealId), { status: 'rejected' });
        setPendingDeals((prev) => prev.filter((d) => d.id !== dealId));
    };

    const selectedEntity = entities.find((e) => e.id === selectedId);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Superadminpanel</h2>

            <div className="flex gap-4">
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as 'company' | 'customer')}>
                    <option value="company">Företag</option>
                    <option value="customer">Privatperson</option>
                </select>

                <CompanySelector
                    companies={[{ id: '', email: 'Visa alla' }, ...entities.map((u) => ({ id: u.id, email: u.email }))]}
                    selectedCompanyId={selectedId}
                    onChange={setSelectedId}
                />
            </div>

            {selectedId && selectedEntity && (
                <div className="space-y-4">
                    <div className="mt-4 border p-4 rounded-md bg-gray-50 space-y-2">
                        <p><strong>E-post:</strong> {selectedEntity.email}</p>
                        <p><strong>Namn:</strong> {selectedEntity.name || 'Saknas'}</p>
                        {selectedType === 'company' && (
                            <p><strong>Organisationsnummer:</strong> {selectedEntity.orgNumber || 'Saknas'}</p>
                        )}
                    </div>

                    <button
                        onClick={() => handleDelete(selectedId)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                        Ta bort konto
                    </button>
                </div>
            )}

            <div className="mt-6">
                <div className="flex gap-4 border-b">
                    <button onClick={() => setTab('active')} className={tab === 'active' ? 'border-b-2 font-semibold' : ''}>Aktiva</button>
                    <button onClick={() => setTab('expired')} className={tab === 'expired' ? 'border-b-2 font-semibold' : ''}>Utgångna</button>
                    <button onClick={() => setTab('pending')} className={tab === 'pending' ? 'border-b-2 font-semibold' : ''}>Väntande</button>
                </div>
                <div className="mt-4">
                    {tab === 'pending' ? (
                        <ul className="space-y-4">
                            {filteredDeals.length === 0 ? (
                                <p>Inga väntande erbjudanden.</p>
                            ) : (
                                filteredDeals.map((deal) => (
                                    <li key={deal.id} className="border p-4 rounded-md shadow-sm">
                                        <h3 className="font-semibold">{deal.title}</h3>
                                        <p className="text-sm opacity-70">{deal.description}</p>
                                        <p className="text-sm"><strong>Skapad av:</strong> {deal.companyName}</p>

                                        <div className="mt-2 space-x-2">
                                            <button onClick={() => handleApprove(deal.id)} className="bg-green-600 text-white px-3 py-1 rounded-md">Godkänn</button>
                                            <button onClick={() => handleReject(deal.id)} className="bg-red-600 text-white px-3 py-1 rounded-md">Avslå</button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    ) : (
                        <DealList title="Erbjudanden" deals={filteredDeals} loading={fetching} />
                    )}
                </div>
            </div>
        </div>
    );
}
