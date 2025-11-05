'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import type { Firestore } from 'firebase/firestore';

/**
 * Hook to safely get Firestore db instance after initialization
 * Use this in components instead of importing db directly
 */
export function useFirebaseDb() {
  const [db, setDb] = useState<Firestore | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { db: firebaseDb } = await initializeFirebase();
        if (mounted) {
          setDb(firebaseDb);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { db, error, loading };
}
