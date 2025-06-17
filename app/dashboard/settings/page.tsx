'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/firebase-provider';
import DashboardLayout from '@/components/dashboard-layout';
import UserList from '@/components/admin/userList';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAdminDeals } from '@/hooks/useAdminDeals';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

type CompanyInfo = {
  id: string;
  email: string;
};

type UserInfo = {
  id: string;
  email: string;
};

export default function SettingsPage() {
  const { user, userType, loading } = useFirebase();
  const router = useRouter();

  const { activeDeals, expiredDeals, companies, fetching } = useAdminDeals();

  const [companyList, setCompanyList] = useState<CompanyInfo[]>([]);
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [tab, setTab] = useState<'active' | 'expired'>('active');

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (userType !== 'superadmin') return;

    const fetchData = async () => {
      const [companySnap, userSnap] = await Promise.all([
        getDocs(collection(db, 'companies')),
        getDocs(collection(db, 'users')),
      ]);

      const companyData = companySnap.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email ?? 'okänt',
      }));

      const userData = userSnap.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email ?? 'okänt',
      }));

      setCompanyList(companyData);
      setUserList(userData);
    };

    fetchData();
  }, [userType]);

  const filteredActive = selectedCompanyId === 'all'
    ? activeDeals
    : activeDeals.filter((d) => d.companyId === selectedCompanyId);

  const filteredExpired = selectedCompanyId === 'all'
    ? expiredDeals
    : expiredDeals.filter((d) => d.companyId === selectedCompanyId);

  if (loading) return <p className="p-6">Laddar...</p>;

  if (userType !== 'superadmin') {
    return (
          <DashboardLayout>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Inställningar</h1>
        <p>Du har inte behörighet att se ytterligare innehåll.</p>
      </div>
          </DashboardLayout>

    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Adminpanel</h1>

        <p className="text-sm text-muted-foreground">
          Inloggad som: <strong>{user?.email}</strong>
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Företag i systemet</label>
            <select
              className="w-full border rounded-md p-2"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="all">Visa alla</option>
              {companyList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Kunder i systemet</label>
            <select className="w-full border rounded-md p-2">
              {userList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <UserList />

        <div className="mt-8">
          <Tabs value={tab} onValueChange={(val) => setTab(val as 'active' | 'expired')}>
            <TabsList>
              <TabsTrigger value="active">Aktiva erbjudanden</TabsTrigger>
              <TabsTrigger value="expired">Utgångna erbjudanden</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {fetching ? (
                <p className="mt-4">Laddar erbjudanden...</p>
              ) : (
                <ul className="list-disc list-inside mt-4">
                  {filteredActive.map((deal) => (
                    <li key={deal.id}>{deal.title}</li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="expired">
              {fetching ? (
                <p className="mt-4">Laddar erbjudanden...</p>
              ) : (
                <ul className="list-disc list-inside mt-4 opacity-70">
                  {filteredExpired.map((deal) => (
                    <li key={deal.id}>{deal.title}</li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
