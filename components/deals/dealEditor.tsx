'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast'; 
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import CreateDealForm from '@/components/create-deal/components/createDealForm';
import { useFirebase } from '@/components/firebase-provider';

type DealEditorProps = {
    dealId: string;
    defaultValues: any; 
    onClose?: () => void;
    onDeleted?: () => void;  
};

export default function DealEditor({ dealId, defaultValues, onClose, onDeleted }: DealEditorProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { user, userType } = useFirebase();
    const [deleting, setDeleting] = useState(false);

    // Tillåt borttagning för superadmin/admin eller om inloggad användare äger dealen
    const canDelete =
        userType === 'superadmin' ||
        userType === 'admin' ||
        (defaultValues?.companyId && defaultValues?.companyId === user?.uid);

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteDoc(doc(db, 'deals', dealId));

            toast({
                title: 'Erbjudande raderat',
                description: 'Erbjudandet har tagits bort.',
            });

            // Stäng editorn och/eller trigga refresh
            onDeleted?.();
            onClose?.();
            // säkerställ att vi inte har kvar ?edit= i urlen
            router.replace('/dashboard');
        } catch (err: any) {
            toast({
                title: 'Kunde inte ta bort',
                description: err?.message ?? 'Ett fel uppstod.',
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card className="mt-6 bg-muted">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Redigera erbjudande</CardTitle>
                <div className="flex gap-2">
                    {canDelete && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={deleting}>
                                    Ta bort
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Ta bort erbjudande?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Detta går inte att ångra. Erbjudandet och dess data försvinner permanent.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                                        {deleting ? 'Tar bort…' : 'Ja, ta bort'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    <Button variant="ghost" onClick={onClose}>
                        Stäng
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* Din befintliga form hanterar uppdatering när isEditing=true */}
                <CreateDealForm defaultValues={defaultValues} isEditing />
            </CardContent>
        </Card>
    );
}
