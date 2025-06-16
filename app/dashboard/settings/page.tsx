'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/firebase-provider';
import DashboardLayout from '@/components/dashboard-layout';
import { useAdminDeals } from '@/hooks/useAdminDeals';
import UserList from '@/components/admin/userList';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function SettingsPage() {
  const { user, userType, loading } = useFirebase();
  const router = useRouter();
  const { activeDeals, expiredDeals, fetching } = useAdminDeals();

  const [companies, setCompanies] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const snap = await getDocs(collection(db, 'companies'));
      setCompanies(snap.docs.map((doc) => doc.data().email ?? 'Okänt'));
    };

    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map((doc) => doc.data().email ?? 'Okänt'));
    };

    if (userType === 'superadmin') {
      fetchCompanies();
      fetchUsers();
    }
  }, [userType]);

  if (loading) return <p className="p-6">Laddar...</p>;

  if (userType === 'superadmin') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Adminpanel</h1>

          <p className="mb-4 text-sm text-muted-foreground">
            Inloggad som: <strong>{user?.email}</strong>
          </p>

          <div className="mb-6 space-y-4">
            <div>
              <label className="block font-medium mb-1">Företag i systemet</label>
              <select className="w-full border rounded-md p-2">
                {companies.map((email, i) => (
                  <option key={i} value={email}>{email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Kunder i systemet</label>
              <select className="w-full border rounded-md p-2">
                {users.map((email, i) => (
                  <option key={i} value={email}>{email}</option>
                ))}
              </select>
            </div>
          </div>

          <UserList />

          <h2 className="text-xl font-semibold mt-8 mb-2">Aktiva erbjudanden</h2>
          {fetching ? <p>Laddar erbjudanden...</p> : (
            <ul className="list-disc list-inside">
              {activeDeals.map((deal) => (
                <li key={deal.id}>{deal.title}</li>
              ))}
            </ul>
          )}

          <h2 className="text-xl font-semibold mt-8 mb-2">Utgångna erbjudanden</h2>
          {fetching ? <p>Laddar erbjudanden...</p> : (
            <ul className="list-disc list-inside">
              {expiredDeals.map((deal) => (
                <li key={deal.id}>{deal.title}</li>
              ))}
            </ul>
          )}
        </div>
      </DashboardLayout>
    );
  }

  if (userType === 'company') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Företagsinställningar</h1>
          <p>Här kan företagsanvändare uppdatera sin information.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">Dina aktiva erbjudanden</h2>
          {fetching ? <p>Laddar erbjudanden...</p> : (
            <ul className="list-disc list-inside">
              {activeDeals.map((deal) => (
                <li key={deal.id}>{deal.title}</li>
              ))}
            </ul>
          )}

          <h2 className="text-xl font-semibold mt-8 mb-2">Historik</h2>
          {fetching ? <p>Laddar erbjudanden...</p> : (
            <ul className="list-disc list-inside">
              {expiredDeals.map((deal) => (
                <li key={deal.id}>{deal.title}</li>
              ))}
            </ul>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inställningar</h1>
      <p>Du har inte behörighet att se ytterligare innehåll.</p>
    </div>
  );
}
