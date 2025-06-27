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

interface UserData {
    id: string;
    email: string;
    role: 'company' | 'customer' | 'admin' | 'superadmin';
}

export default function SuperAdminPanel() {
    const { activeDeals, expiredDeals, fetching } = useAdminDeals();
    const [selectedType, setSelectedType] = useState<'company' | 'customer'>('company');
    const [users, setUsers] = useState<UserData[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
    const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
    const [tab, setTab] = useState<'active' | 'expired' | 'pending'>('active');

    useEffect(() => {
        const fetchUsers = async () => {
            const snapshot = await getDocs(collection(db, selectedType === 'company' ? 'companies' : 'customers'));
            const data = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    email: data.email ?? 'okänd',
                    role: data.role ?? (selectedType === 'company' ? 'company' : 'customer'),
                } as UserData;
            });
            setUsers(data);
        };
        fetchUsers();
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
        if (!selectedId) return;
        const relevantDeals = (tab === 'active' ? activeDeals : tab === 'expired' ? expiredDeals : pendingDeals).filter(
            (deal) => deal.companyId === selectedId
        );
        setFilteredDeals(relevantDeals);
    }, [selectedId, tab, activeDeals, expiredDeals, pendingDeals]);

    const handleDelete = async (id: string) => {
        await deleteDoc(doc(db, selectedType === 'company' ? 'companies' : 'customers', id));
        setUsers((prev) => prev.filter((u) => u.id !== id));
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

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Superadminpanel</h2>

            <div className="flex gap-4">
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as 'company' | 'customer')}>
                    <option value="company">Företag</option>
                    <option value="customer">Privatperson</option>
                </select>

                <CompanySelector
                    companies={users.map((u) => ({ id: u.id, email: u.email }))}
                    selectedCompanyId={selectedId}
                    onChange={setSelectedId}
                />
            </div>

            {selectedId && (
                <div className="space-y-4">
                    <p className="font-semibold">E-post: {users.find((u) => u.id === selectedId)?.email}</p>
                    <button
                        onClick={() => handleDelete(selectedId)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                        Ta bort konto
                    </button>

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
            )}
        </div>
    );
}
