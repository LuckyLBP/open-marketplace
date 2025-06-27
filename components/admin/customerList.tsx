'use client';

import { useEffect, useState } from 'react';
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Customer {
    id: string;
    email: string;
    name?: string;
}

interface Deal {
    id: string;
    title: string;
    expiresAt: Date;
}

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [dealsByCustomer, setDealsByCustomer] = useState<Record<string, Deal[]>>({});
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            const customerSnap = await getDocs(collection(db, 'customers'));
            const customerList: Customer[] = customerSnap.docs.map((doc) => ({
                id: doc.id,
                email: doc.data().email ?? 'okänd',
                name: doc.data().name ?? '',
            }));
            setCustomers(customerList);

            const dealSnap = await getDocs(collection(db, 'deals'));
            const dealList = dealSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as any[];

            const groupedDeals: Record<string, Deal[]> = {};
            for (const c of customerList) {
                groupedDeals[c.id] = dealList
                    .filter((deal) => deal.companyId === c.id)
                    .map((deal) => ({
                        id: deal.id,
                        title: deal.title ?? 'Okänt erbjudande',
                        expiresAt: deal.expiresAt?.toDate?.() ?? new Date(0),
                    }));
            }
            setDealsByCustomer(groupedDeals);
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            await deleteDoc(doc(db, 'customers', selectedId));
            setCustomers((prev) => prev.filter((c) => c.id !== selectedId));
            toast({ title: 'Användare borttagen' });
        } catch (err) {
            toast({
                title: 'Fel',
                description: 'Kunde inte ta bort användaren',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Privatpersoner</h2>

            <div className="flex gap-4">
                <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
                    Alla
                </Button>
                <Button variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>
                    Aktiva
                </Button>
                <Button variant={filter === 'expired' ? 'default' : 'outline'} onClick={() => setFilter('expired')}>
                    Utgångna
                </Button>
            </div>

            {loading ? (
                <p>Laddar...</p>
            ) : customers.length === 0 ? (
                <p>Inga privatpersoner hittades.</p>
            ) : (
                <ul className="space-y-4">
                    {customers.map((c) => {
                        const customerDeals = dealsByCustomer[c.id] || [];
                        const now = new Date();
                        const filteredDeals = customerDeals.filter((deal) => {
                            if (filter === 'all') return true;
                            if (filter === 'active') return deal.expiresAt > now;
                            if (filter === 'expired') return deal.expiresAt <= now;
                        });

                        return (
                            <li
                                key={c.id}
                                className="bg-white shadow-sm rounded px-4 py-3 space-y-2"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{c.email}</p>
                                        <p className="text-sm text-muted-foreground">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">{c.id}</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setSelectedId(c.id)}
                                            >
                                                Ta bort
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Detta tar permanent bort kunden <strong>{c.email}</strong>.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete}>
                                                    Ta bort
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                {filteredDeals.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="font-semibold text-sm">Erbjudanden:</p>
                                        <ul className="space-y-0.5">
                                            {filteredDeals.map((deal) => {
                                                const isExpired = deal.expiresAt < now;
                                                return (
                                                    <li
                                                        key={deal.id}
                                                        className="text-sm flex items-center gap-2"
                                                    >
                                                        <Badge variant={isExpired ? 'outline' : 'default'}>
                                                            {isExpired ? 'Utgången' : 'Aktiv'}
                                                        </Badge>
                                                        {deal.title}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
