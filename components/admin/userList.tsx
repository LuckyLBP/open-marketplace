'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebase } from '@/components/firebase-provider';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface UserData {
    id: string;
    email: string;
    role: 'customer' | 'company' | 'superadmin';
}

export default function UserList() {
    const { userType, loading } = useFirebase();
    const [users, setUsers] = useState<UserData[]>([]);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const snapshot = await getDocs(collection(db, 'users'));
            const userList: UserData[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    email: data.email ?? 'okänd',
                    role: data.role ?? 'customer',
                };
            });
            setUsers(userList);
        };

        if (userType === 'superadmin') fetchUsers();
    }, [userType]);

    const handleRoleChange = async (userId: string, newRole: UserData['role']) => {
        setSaving(userId);
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );
        } catch (err) {
            console.error('Failed to update role:', err);
        } finally {
            setSaving(null);
        }
    };

    if (loading || userType !== 'superadmin') {
        return <p>Du har inte behörighet att visa användare.</p>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Användare</h2>
            {users.length === 0 ? (
                <p>Inga användare hittades.</p>
            ) : (
                <ul className="space-y-2">
                    {users.map((u) => (
                        <li
                            key={u.id}
                            className="flex items-center justify-between bg-white shadow-sm rounded px-4 py-2"
                        >
                            <div>
                                <p className="font-medium">{u.email}</p>
                                <p className="text-sm text-muted-foreground">{u.id}</p>
                            </div>
                            <Select
                                value={u.role}
                                onValueChange={(value) =>
                                    handleRoleChange(u.id, value as UserData['role'])
                                }
                                disabled={saving === u.id}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Välj roll" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="company">Company</SelectItem>
                                    <SelectItem value="superadmin">Superadmin</SelectItem>
                                </SelectContent>
                            </Select>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
