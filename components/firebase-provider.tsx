'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '@/lib/firebase';
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
    let unsub: (() => void) | null = null;

    const initAndSubscribe = async () => {
      try {
        const { auth, db } = await initializeFirebase();

        unsub = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser);
          if (!firebaseUser) {
            setUserType(null);
            setLoading(false);
            return;
          }

          try {
            // 1) users/{uid}
            const uref = doc(db, 'users', firebaseUser.uid);
            const usnap = await getDoc(uref);

            if (usnap.exists()) {
              const d = usnap.data() as any;
              const role = (d?.accountType ?? d?.role) as UserType | undefined;
              if (
                role === 'superadmin' ||
                role === 'admin' ||
                role === 'company' ||
                role === 'customer'
              ) {
                setUserType(role);
                setLoading(false);
                return;
              }
              // om users-doc saknar roll → kolla companies
            }

            // 2) companies/{uid}
            const cref = doc(db, 'companies', firebaseUser.uid);
            const csnap = await getDoc(cref);
            if (csnap.exists()) {
              const c = csnap.data() as any;
              const crole = (c?.accountType ?? c?.role) as UserType | undefined;
              setUserType(
                crole === 'admin' ||
                  crole === 'superadmin' ||
                  crole === 'company'
                  ? crole
                  : 'company'
              );
            } else {
              // 3) fallback
              setUserType('customer');
            }
          } catch (e) {
            console.error('Error determining user type:', e);
            setUserType(null);
          } finally {
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        setLoading(false);
      }
    };

    initAndSubscribe();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, userType, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}
