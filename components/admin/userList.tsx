/*'use client';

import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

export interface UserData {
    id: string;
    email: string;
    role: 'user' | 'company' | 'superadmin' | 'admin' | 'customer';
}

interface UserListProps {
    users: UserData[];
    onDelete: (userId: string) => Promise<void>;
}

export default function UserList({ users, onDelete }: UserListProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: UserData['role']) => {
        setSaving(userId);
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
            toast({ title: 'Roll uppdaterad', description: `Ny roll: ${newRole}` });
        } catch (err) {
            console.error('Failed to update role:', err);
            toast({
                title: 'Fel vid uppdatering',
                description: 'Försök igen.',
                variant: 'destructive',
            });
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Användare</h2>
            {users.length === 0 ? (
                <p>Inga användare hittades.</p>
            ) : (
                <ul className="space-y-2">
                    {users.map((u) => (
                        <li
                            key={u.id}
                            className="flex flex-col md:flex-row md:items-center justify-between bg-white shadow-sm rounded px-4 py-2 gap-2"
                        >
                            <div>
                                <p className="font-medium">{u.email}</p>
                                <p className="text-sm text-muted-foreground">{u.id}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Select
                                    value={u.role}
                                    onValueChange={(value) => handleRoleChange(u.id, value as UserData['role'])}
                                    disabled={saving === u.id}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Välj roll" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">Privatperson</SelectItem>
                                        <SelectItem value="company">Företag</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="superadmin">Superadmin</SelectItem>
                                    </SelectContent>
                                </Select>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            Ta bort
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <p className="text-sm text-muted-foreground">
                                            Detta tar permanent bort användaren <strong>{u.email}</strong>.
                                        </p>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(u.id)}>
                                                Ta bort
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
*/