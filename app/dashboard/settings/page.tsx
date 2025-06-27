'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/firebase-provider';
import DashboardLayout from '@/components/dashboard-layout';
import { CompanySelector } from '@/components/admin/companySelector';


import SuperAdminPanel from '@/components/admin/settingsPanels/superAdminPanel';
import AdminPanel from '@/components/admin/settingsPanels/adminPanel';
import CompanyPanel from '@/components/admin/settingsPanels/companyPanel';
import CustomerPanel from '@/components/admin/settingsPanels/customerPanel';

export default function SettingsPage() {
  const { user, userType, loading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Laddar...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Inställningar</h1>
        <p className="text-sm text-muted-foreground">
          Inloggad som: <strong>{user?.email}</strong>
        </p>

        {/* Render baserat på roll */}
        {userType === 'superadmin' && <SuperAdminPanel />}
        {userType === 'admin' && <AdminPanel />}
        {userType === 'company' && <CompanyPanel />}
        {userType === 'customer' && <CustomerPanel />}
      </div>
    </DashboardLayout>
  );
}
