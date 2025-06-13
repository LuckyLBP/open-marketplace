'use client';

import CreateDealForm from '@/components/create-deal/components/createDealForm';
import DashboardLayout from '@/components/dashboard-layout';

export default function CreateDealPage() {
  return (
    <DashboardLayout>
      <div className="px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Skapa nytt erbjudande</h1>
        <CreateDealForm />
      </div>
    </DashboardLayout>
  );
}
