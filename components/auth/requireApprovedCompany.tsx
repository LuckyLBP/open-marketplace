'use client';

import { ReactNode, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/components/firebase-provider';

type Props = { children: ReactNode };

export default function RequireApprovedCompany({ children }: Props) {
  const { user, userType, loading } = useFirebase();
  const [approved, setApproved] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setApproved(false); return; }

      // Läs companies/{uid} för att avgöra roll
      const snap = await getDoc(doc(db, 'companies', user.uid)).catch(() => null);

      if (!snap?.exists()) {
        // Inte ett företag (t.ex. customer) -> släpp igenom
        setApproved(true);
        return;
      }

      const data = snap.data() as any;
      const role = data.role || data.accountType;

      // Adminer ska aldrig blockeras här
      if (role === 'superadmin' || role === 'admin') {
        setApproved(true);
        return;
      }

      // Endast riktiga företag kräver approved
      const ok = data.status === 'approved';
      setApproved(ok);
    })();
    return () => { cancelled = true; };
  }, [user, userType]);

  if (loading || approved === null) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="p-6">
        <div className="max-w-lg rounded-md border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Väntar på godkännande</h2>
          <p className="text-sm text-gray-600">
            Ditt företagskonto måste godkännas av superadmin innan du kan använda dashboarden.
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={async () => { await signOut(auth); location.href = '/auth/signin'; }}
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
