'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type UserType = 'customer' | 'company' | 'admin' | 'superadmin';

type FirebaseContextType = {
    user: User | null;
    userType: UserType | null;
    loading: boolean;
};

const FirebaseContext = createContext<FirebaseContextType>({
    user: null,
    userType: null,
    loading: true,
});

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userType, setUserType] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const role = userSnap.data()?.role as UserType;
                        setUserType(role);
                    } else {
                        // Kolla istället i companies
                        const companyRef = doc(db, 'companies', firebaseUser.uid);
                        const companySnap = await getDoc(companyRef);

                        if (companySnap.exists()) {
                            const companyData = companySnap.data();
                            const accountType = companyData.accountType;

                            if (accountType === 'superadmin') {
                                setUserType('superadmin');
                            } else if (accountType === 'admin') {
                                setUserType('admin');
                            } else {
                                setUserType('company');
                            }
                        } else {
                            setUserType('customer'); // fallback
                        }
                    }
                } catch (error) {
                    console.error('Error determining user type:', error);
                    setUserType(null);
                }
            } else {
                setUserType(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <FirebaseContext.Provider value={{ user, userType, loading }}>
            {children}
        </FirebaseContext.Provider>
    );
}
