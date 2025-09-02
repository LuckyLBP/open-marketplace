'use client';

import { useEffect, useState, Suspense } from 'react';
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
import { db, auth } from '@/lib/firebase';
import CreateDealForm from '@/components/create-deal/components/createDealForm';
import { TimeLeftLabel } from '@/components/deals/timeLeftLabel';
import { useToast } from '@/hooks/use-toast';
import { BoostDialog } from '@/components/boost/boostDialog';
import { Badge } from '@/components/ui/badge';
import { usePendingDeals } from '@/hooks/usePendingDeals';
import { signOut } from 'firebase/auth';

function DashboardContent() {
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

  // ✅ Robust company-koll (oberoende av userType)
  // 'unknown' (laddar), 'not-company', 'approved', 'pending'
  const [companyState, setCompanyState] = useState<'unknown' | 'not-company' | 'approved' | 'pending'>('unknown');

  useEffect(() => {
    if (!user) return; // väntar på auth

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'companies', user.uid));
        if (!snap.exists()) {
          if (!cancelled) setCompanyState('not-company');
          return;
        }
        const status = (snap.data() as any)?.status;
        if (!cancelled) setCompanyState(status === 'approved' ? 'approved' : 'pending');
      } catch {
        if (!cancelled) setCompanyState('pending'); // fail safe
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  // Hantera boost-status i query
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
            body: JSON.stringify({ dealId, type: boostType, duration: Number(duration) }),
          });
          const data = await res.json();
          setTimeout(() => {
            if (data.success) {
              toast({ title: 'Boost aktiverad!', description: 'Ditt erbjudande är nu synligt som boost.' });
            } else {
              toast({ title: 'Fel vid boost', description: data.error || 'Något gick fel.', variant: 'destructive' });
            }
          }, 200);
        } catch {
          setTimeout(() => {
            toast({ title: 'Serverfel', description: 'Kunde inte verifiera boost.', variant: 'destructive' });
          }, 200);
        } finally {
          localStorage.removeItem('boostType');
          localStorage.removeItem('boostDuration');
          localStorage.removeItem('boostDealId');
        }
      }

      if (status === 'cancel') {
        setTimeout(() => {
          toast({ title: 'Betalning avbröts', description: 'Ingen boost aktiverades.', variant: 'destructive' });
        }, 200);
      }

      const newParams = new URLSearchParams(Array.from(searchParams.entries()));
      newParams.delete('boost');
      router.replace(`/dashboard?${newParams.toString()}`);
    };

    handleBoostStatus();
  }, [status]);

  // Normalisera editData
  useEffect(() => {
    if (!editId) return;
    (async () => {
      const docRef = doc(db, 'deals', editId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const data = snap.data() as any;
      const normalizedImages = Array.isArray(data.images)
        ? data.images
          .map((im: any) => {
            const preview = (im?.preview || im?.url || '').trim();
            const url = (im?.url || '').trim();
            return { ...im, preview: preview || undefined, url: url || undefined };
          })
          .filter((im: any) => im.preview || im.url)
        : [];
      setEditData({ id: snap.id, ...data, images: normalizedImages, imageUrl: (data.imageUrl || '').trim() || undefined });
    })();
  }, [editId]);

  const expiredDeals = allDeals.filter((d) => new Date(d.expiresAt) < new Date());
  const activeDeals = allDeals.filter((d) => new Date(d.expiresAt) >= new Date());

  // Påtvinga login om utloggad
  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin');
  }, [loading, user, router]);

  // Laddning
  if (loading || !user || dealsLoading || companyState === 'unknown') {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // ⛔️ Blockera dashboard för företag som inte är approved
  if (companyState === 'pending') {
    return (
      <div className="p-6">
        <div className="max-w-lg rounded-md border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Väntar på godkännande</h2>
          <p className="text-sm text-gray-600">
            Ditt företagskonto måste godkännas av superadmin innan du kan använda dashboarden. Du får ett mejl när
            kontot är upplåst.
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={async () => { await signOut(auth); router.push('/auth/signin'); }}>
              Logga in som annan användare
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // companyState === 'approved' eller 'not-company' → visa dashboard
  return (
    <DashboardLayout>
      <div className="px-4 py-6 lg:py-8">
        {/* Top action bar */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">{t('Min översikt')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('Översikt över dina erbjudanden och statistik')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/create-deal">
              <Button>{t('Skapa nytt erbjudande')}</Button>
            </Link>
          </div>
        </div>

        {(userType === 'admin' || userType === 'superadmin') && pendingDeals.length > 0 && (
          <div className="mb-6 rounded-lg bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="font-semibold text-yellow-800">
              {pendingDeals.length} erbjudande{pendingDeals.length > 1 ? 'n' : ''} väntar på godkännande.
            </p>
            <p className="text-sm text-yellow-700">
              {t('Gå till')}{' '}
              <Link href="/dashboard/settings" className="underline">
                {t('Inställningar')}
              </Link>{' '}
              {t('för att granska och godkänna dem.')}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">{t('Aktiva erbjudanden')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold">{activeDeals.length}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('Erbjudanden som fortfarande är synliga')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">{t('Utgångna erbjudanden')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold">{expiredDeals.length}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('Erbjudanden som har gått ut')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">{t('Totalt antal')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold">{allDeals.length}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('Totalt antal erbjudanden')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs + Lists */}
        <Tabs value={showActive ? 'active' : 'expired'} onValueChange={(val) => setShowActive(val === 'active')}>
          <TabsList>
            <TabsTrigger value="active">{t('Aktiva')}</TabsTrigger>
            <TabsTrigger value="expired">{t('Utgångna')}</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="mt-4 grid grid-cols-1 gap-4">
              {activeDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white rounded-lg border p-4 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{deal.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium text-gray-800">{deal.price} kr</span>
                      <TimeLeftLabel expiresAt={new Date(deal.expiresAt)} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{deal.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/product/${deal.id}`} className="text-purple-600 hover:underline text-sm">
                      {t('Visa')}
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard?edit=${deal.id}`)}>
                      {t('Redigera')}
                    </Button>

                    {deal.boostStart && deal.boostEnd && new Date(deal.boostEnd) > new Date() ? (
                      <Badge className="bg-green-500 text-white">Boost</Badge>
                    ) : (
                      <BoostDialog dealId={deal.id} dealTitle={deal.title} dealDescription={deal.description} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expired">
            <div className="mt-4 grid grid-cols-1 gap-4">
              {expiredDeals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between gap-4 bg-white rounded-lg border p-4 opacity-80">
                  <div>
                    <h3 className="text-lg font-semibold">{deal.title}</h3>
                    <p className="text-sm text-muted-foreground">{deal.price} kr</p>
                  </div>
                  <div>
                    <Link href={`/product/${deal.id}`} className="text-purple-600 hover:underline text-sm">
                      {t('Visa')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {editId && editData && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('Redigera erbjudande')}</h2>
              <Button variant="ghost" onClick={() => router.replace('/dashboard')}>
                {t('Stäng')}
              </Button>
            </div>
            <div className="rounded-lg bg-white border p-6 shadow-sm">
              <CreateDealForm defaultValues={editData} isEditing />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Laddar...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
