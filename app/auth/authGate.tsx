'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/firebase-provider';

export default function AuthGate({
  children,
  next = '/checkout/intent',
}: {
  children: ReactNode;
  next?: string;
}) {
  const { user, loading } = useFirebase();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return; // vänta tills Firebase vet om vi är inloggade
    if (!user) {
      router.replace(`/auth/signin?next=${encodeURIComponent(next)}`);
      return;
    }
    setReady(true);
  }, [user, loading, router, next]);

  if (!ready) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
