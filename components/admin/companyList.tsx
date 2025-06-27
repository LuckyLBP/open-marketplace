'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

interface Company {
    id: string;
    email: string;
}

interface CompanyListProps {
    companies?: Company[]; // om du vill kunna skicka in props
    onDelete?: (id: string) => void;
}

export default function CompanyList({ companies: initialCompanies = [], onDelete }: CompanyListProps) {
    const [companies, setCompanies] = useState<Company[]>(initialCompanies);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (initialCompanies.length === 0) {
            const fetchCompanies = async () => {
                const snapshot = await getDocs(collection(db, 'companies'));
                const companyList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    email: doc.data().email ?? 'okänd',
                }));
                setCompanies(companyList);
            };

            fetchCompanies();
        }
    }, [initialCompanies]);

    const handleDelete = async () => {
        if (!selectedCompanyId) return;
        try {
            await deleteDoc(doc(db, 'companies', selectedCompanyId));
            setCompanies((prev) => prev.filter((c) => c.id !== selectedCompanyId));
            toast({
                title: 'Företag borttaget',
                description: 'Företagskontot har tagits bort permanent.',
            });

            if (onDelete) {
                onDelete(selectedCompanyId);
            }
        } catch (error) {
            console.error('Fel vid borttagning:', error);
            toast({
                title: 'Fel vid borttagning',
                description: 'Kunde inte ta bort företaget.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Företagskonton</h2>
            {companies.length === 0 ? (
                <p>Inga företag registrerade ännu.</p>
            ) : (
                <ul className="space-y-2">
                    {companies.map((company) => (
                        <li
                            key={company.id}
                            className="flex items-center justify-between bg-white shadow-sm rounded px-4 py-2"
                        >
                            <div>
                                <p className="font-medium">{company.email}</p>
                                <p className="text-sm text-muted-foreground">{company.id}</p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        onClick={() => setSelectedCompanyId(company.id)}
                                    >
                                        Ta bort
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Detta kommer permanent ta bort företagskontot. Åtgärden går inte att ångra.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>Ta bort</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
