'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirebase } from '@/components/firebase-provider';
import { useLanguage } from '@/components/language-provider';
import { useDeals } from '@/hooks/useDeals';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard-layout';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CreateDealForm from '@/components/create-deal/components/createDealForm';
import { TimeLeftLabel } from '@/components/deals/timeLeftLabel';
import { useToast } from '@/hooks/use-toast';
import { BoostDialog } from '@/components/boost/boostDialog';
import { Badge } from '@/components/ui/badge';
import { usePendingDeals } from '@/hooks/usePendingDeals';

export default function DashboardPage() {
  const { user, userType, loading } = useFirebase();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const status = searchParams.get('boost');

  const [showActive, setShowActive] = useState(true);
  const [editData, setEditData] = useState<any | null>(null);
  const { pendingDeals } = usePendingDeals();

  const { deals: allDeals, loading: dealsLoading } = useDeals(
    userType === 'superadmin' ? {} : { companyId: user?.uid }
  );

  useEffect(() => {
    if (!status) return;

    const handleBoostStatus = async () => {
      if (status === 'success') {
        const boostType = localStorage.getItem('boostType');
        const duration = localStorage.getItem('boostDuration');
        const dealId = localStorage.getItem('boostDealId');

        if (!boostType || !duration || !dealId) return;

        try {
          const res = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dealId,
              type: boostType,
              duration: Number(duration),
            }),
          });

          const data = await res.json();

          if (data.success) {
            setTimeout(() => {
              toast({
                title: 'Boost aktiverad!',
                description: 'Ditt erbjudande är nu synligt som boost.',
              });
            }, 200);
          } else {
            setTimeout(() => {
              toast({
                title: 'Fel vid boost',
                description: data.error || 'Något gick fel.',
                variant: 'destructive',
              });
            }, 200);
          }
        } catch (error) {
          setTimeout(() => {
            toast({
              title: 'Serverfel',
              description: 'Kunde inte verifiera boost.',
              variant: 'destructive',
            });
          }, 200);
        } finally {
          localStorage.removeItem('boostType');
          localStorage.removeItem('boostDuration');
          localStorage.removeItem('boostDealId');
        }
      }

      if (status === 'cancel') {
        setTimeout(() => {
          toast({
            title: 'Betalning avbröts',
            description: 'Ingen boost aktiverades.',
            variant: 'destructive',
          });
        }, 200);
      }

      const newParams = new URLSearchParams(Array.from(searchParams.entries()));
      newParams.delete('boost');
      router.replace(`/dashboard?${newParams.toString()}`);
    };

    handleBoostStatus();
  }, [status]);

  useEffect(() => {
    if (editId) {
      const fetchData = async () => {
        const docRef = doc(db, 'deals', editId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setEditData({ id: snap.id, ...snap.data() });
        }
      };
      fetchData();
    }
  }, [editId]);

  const expiredDeals = allDeals.filter((d) => new Date(d.expiresAt) < new Date());
  const activeDeals = allDeals.filter((d) => new Date(d.expiresAt) >= new Date());

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [loading, user, router]);

  if (loading || !user || dealsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('Min översikt')}</h1>

        {(userType === 'admin' || userType === 'superadmin') && pendingDeals.length > 0 && (
          <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md">
            <p className="font-semibold">
              {pendingDeals.length} erbjudande{pendingDeals.length > 1 ? 'n' : ''} väntar på godkännande.
            </p>
            <p className="text-sm">
              Gå till <Link href="/dashboard/settings" className="underline text-yellow-700">Inställningar</Link> för att granska och godkänna dem.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Aktiva erbjudanden")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeDeals.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Utgångna erbjudanden")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{expiredDeals.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Totalt antal")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{allDeals.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={showActive ? 'active' : 'expired'} onValueChange={(val) => setShowActive(val === 'active')}>
          <TabsList>
            <TabsTrigger value="active">{t('Aktiva')}</TabsTrigger>
            <TabsTrigger value="expired">{t('Utgångna')}</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ul className="space-y-4 mt-4">
              {activeDeals.map((deal) => (
                <li key={deal.id} className="border p-4 rounded-md">
                  <h2 className="text-xl font-semibold">{deal.title}</h2>
                  <p className="text-muted-foreground">{deal.price} kr</p>
                  <TimeLeftLabel expiresAt={new Date(deal.expiresAt)} />

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Link href={`/product/${deal.id}`} className="text-purple-600 hover:underline">
                      {t('Visa erbjudande')}
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard?edit=${deal.id}`)}>
                      {t('Redigera')}
                    </Button>

                    {deal.boostStart && deal.boostEnd && new Date(deal.boostEnd) > new Date() ? (
                      <Badge className="bg-green-500 text-white self-center">Boost aktiv</Badge>
                    ) : (
                      <BoostDialog dealId={deal.id} dealTitle={deal.title} dealDescription={deal.description} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="expired">
            <ul className="space-y-4 mt-4">
              {expiredDeals.map((deal) => (
                <li key={deal.id} className="border p-4 rounded-md opacity-60">
                  <h2 className="text-xl font-semibold">{deal.title}</h2>
                  <p className="text-muted-foreground">{deal.price} kr</p>
                  <Link href={`/product/${deal.id}`} className="text-purple-600 hover:underline">
                    {t('Visa erbjudande')}
                  </Link>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>

        {editId && editData && (
          <div className="mt-6 border p-6 rounded-lg bg-muted">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('Redigera erbjudande')}</h2>
              <Button variant="ghost" onClick={() => router.replace('/dashboard')}>
                {t('Stäng')}
              </Button>
            </div>
            <CreateDealForm defaultValues={editData} isEditing />
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/dashboard/create-deal">
            <Button>{t('Skapa nytt erbjudande')}</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
