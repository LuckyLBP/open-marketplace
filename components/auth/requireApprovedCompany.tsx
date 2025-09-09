'use client';

import { ReactNode, useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = { children: ReactNode };

// liten helper
const norm = (v: any) =>
  typeof v === 'string' ? v.trim().toLowerCase() : v;

export default function RequireApprovedCompany({ children }: Props) {
  const [approved, setApproved] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let unsubAuth: (() => void) | null = null;
    let unsubUser: (() => void) | null = null;
    let unsubCompany: (() => void) | null = null;

    function cleanup() {
      if (unsubUser) { unsubUser(); unsubUser = null; }
      if (unsubCompany) { unsubCompany(); unsubCompany = null; }
    }

    unsubAuth = onAuthStateChanged(auth, (u) => {
      cleanup();

      if (!u) {
        setApproved(false);
        setChecking(false);
        return;
      }

      // users/{uid} – kolla admin/superadmin
      const userRef = doc(db, 'users', u.uid);
      unsubUser = onSnapshot(
        userRef,
        (usnap) => {
          const ud = usnap.data() as any | undefined;
          const uRole = norm(ud?.accountType ?? ud?.role);

          // companies/{uid} – kolla både admin och approved
          const compRef = doc(db, 'companies', u.uid);
          if (!unsubCompany) {
            unsubCompany = onSnapshot(
              compRef,
              (csnap) => {
                const cd = csnap.data() as any | undefined;
                const cRole = norm(cd?.accountType ?? cd?.role);
                const isAdmin =
                  uRole === 'admin' || uRole === 'superadmin' ||
                  cRole === 'admin' || cRole === 'superadmin';

                if (!csnap.exists()) {
                  // inte företag (t.ex. kund) ⇒ släpp igenom
                  setApproved(true);
                } else if (isAdmin) {
                  setApproved(true);
                } else {
                  const ok =
                    cd?.isApproved === true || norm(cd?.status) === 'approved';
                  setApproved(!!ok);
                }
                setChecking(false);
              },
              () => {
                setApproved(false);
                setChecking(false);
              }
            );
          }
        },
        async () => {
          // users/{uid} saknas ⇒ kolla bara companies/{uid}
          try {
            const csnap = await getDoc(doc(db, 'companies', u.uid));
            if (!csnap.exists()) {
              setApproved(true);
            } else {
              const cd = csnap.data() as any;
              const ok =
                cd?.isApproved === true || norm(cd?.status) === 'approved';
              setApproved(!!ok);
            }
          } catch {
            setApproved(false);
          } finally {
            setChecking(false);
          }
        }
      );
    });

    return () => {
      if (unsubAuth) unsubAuth();
      cleanup();
    };
  }, []);

  if (checking || approved === null) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!approved) {
    const router = useRouter();

    return (
      <div className="p-6">
        <div className="max-w-xl rounded-md border bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Väntar på godkännande</h2>
          <p className="text-base text-gray-600">
            Ditt företagskonto måste godkännas av superadmin innan du kan använda dashboarden.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              ← Tillbaka
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">Till startsidan</Link>
            </Button>

            <Button
              variant="secondary"
              onClick={async () => {
                await signOut(auth);
                location.href = '/auth/signin';
              }}
            >
              Logga in som annan användare
            </Button>
          </div>
        </div>
      </div>
    );
  }


  return <>{children}</>;
}
