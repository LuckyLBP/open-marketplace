'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/firebase-provider';
import DashboardLayout from '@/components/dashboard-layout';

import SuperAdminPanel from '@/components/admin/settingsPanels/superAdminPanel';
import AdminPanel from '@/components/admin/settingsPanels/adminPanel';
import CompanyPanel from '@/components/admin/settingsPanels/companyPanel';
import CustomerPanel from '@/components/admin/settingsPanels/customerPanel';
import RequireApprovedCompany from '@/components/auth/requireApprovedCompany';

export default function SettingsPage() {
  const { user, userType, loading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Laddar...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* ⬇️ Skydda hela settings med samma guard som dashboard */}
      <RequireApprovedCompany>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Inställningar</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Inloggad som: <strong>{user?.email}</strong>
              </p>
            </div>
          </div>

          {/* Panels */}
          {userType === 'superadmin' && <SuperAdminPanel />}
          {userType === 'admin' && <AdminPanel />}
          {userType === 'company' && <CompanyPanel />}
          {userType === 'customer' && <CustomerPanel />}
        </div>
      </RequireApprovedCompany>
    </DashboardLayout>
  );
}
