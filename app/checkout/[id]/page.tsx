'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { ArrowLeft, Clock, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useFirebase } from '@/components/firebase-provider';

type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string;
  companyId: string;
  companyName: string;
  category: string;
  feePercentage: number;
  expiresAt: Date;
  accountType: 'company' | 'customer';
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
};

export default function Checkout({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useFirebase();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const dealDoc = await getDoc(doc(db, 'deals', id));
        if (!dealDoc.exists()) {
          toast({
            title: t('Error'),
            description: t('Deal not found or has expired.'),
            variant: 'destructive',
          });
          router.push('/marketplace');
          return;
        }

        const data = dealDoc.data();

        const accountType: 'company' | 'customer' =
          data.accountType === 'company' ? 'company' : 'customer';

        let companyName = 'BudFynd.se';
        try {
          const companyDoc = await getDoc(
            doc(db, accountType === 'company' ? 'companies' : 'customers', data.companyId)
          );
          if (companyDoc.exists()) {
            companyName = companyDoc.data().companyName || companyDoc.data().name;
          }
        } catch (error) {
          console.error('Error fetching company:', error);
        }

        const category = data.category || 'other';
        const expiresAt = data.expiresAt.toDate();
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();

        if (diffMs <= 0) {
          toast({
            title: t('Error'),
            description: t('This deal has expired.'),
            variant: 'destructive',
          });
          router.push('/marketplace');
          return;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setDeal({
          id: dealDoc.id,
          title: data.title,
          description: data.description,
          price: data.price,
          duration: data.duration,
          imageUrl: data.imageUrl,
          companyId: data.companyId,
          companyName,
          category,
          feePercentage: data.feePercentage,
          expiresAt,
          accountType,
          timeLeft: { hours, minutes, seconds },
        });
      } catch (error) {
        console.error('Error fetching deal:', error);
        toast({
          title: t('Error'),
          description: t('Failed to load deal information.'),
          variant: 'destructive',
        });
        router.push('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();

    const interval = setInterval(() => {
      setDeal((prevDeal) => {
        if (!prevDeal) return null;

        const now = new Date();
        const diffMs = prevDeal.expiresAt.getTime() - now.getTime();

        if (diffMs <= 0) {
          clearInterval(interval);
          toast({
            title: t('Error'),
            description: t('This deal has expired.'),
            variant: 'destructive',
          });
          router.push('/marketplace');
          return prevDeal;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        return {
          ...prevDeal,
          timeLeft: { hours, minutes, seconds },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [id, router, t, toast]);

  const handleCheckout = async () => {
    if (!deal) return;

    setProcessingPayment(true);

    try {
      console.log('[CHECKOUT PAYLOAD]', {
        dealId: deal.id,
        price: deal.price,
        title: deal.title,
        feePercentage: deal.feePercentage,
        companyId: deal.companyId,
        userId: user?.uid || 'anonymous',
        accountType: deal.accountType,
      });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId: deal.id,
          price: deal.price,
          title: deal.title,
          feePercentage: deal.feePercentage,
          companyId: deal.companyId,
          userId: user?.uid || 'anonymous',
          accountType: deal.accountType,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const { sessionId } = await response.json();

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: t('Error'),
        description: t('Failed to process payment. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading || !deal) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/marketplace" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('Back to Marketplace')}
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="rounded-lg overflow-hidden shadow-md mb-6">
              <img
                src={deal.imageUrl || '/placeholder.svg?height=400&width=600'}
                alt={deal.title}
                className="w-full h-auto object-cover"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{deal.title}</CardTitle>
                <CardDescription>{deal.companyName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {deal.description}
                </p>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {t('Time Left')}:{' '}
                      {deal.timeLeft.hours.toString().padStart(2, '0')}:
                      {deal.timeLeft.minutes.toString().padStart(2, '0')}:
                      {deal.timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('Order Summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('Price')}</span>
                  <span>
                    {new Intl.NumberFormat('sv-SE', {
                      style: 'currency',
                      currency: 'SEK',
                    }).format(deal.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {t('Transaction Fee')} ({deal.feePercentage}%)
                  </span>
                  <span>
                    {new Intl.NumberFormat('sv-SE', {
                      style: 'currency',
                      currency: 'SEK',
                    }).format(deal.price * (deal.feePercentage / 100))}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('Total')}</span>
                  <span>
                    {new Intl.NumberFormat('sv-SE', {
                      style: 'currency',
                      currency: 'SEK',
                    }).format(deal.price * (1 + deal.feePercentage / 100))}
                  </span>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-2">
                    {t('Payment Information')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('You will be redirected to Stripe to complete your purchase securely.')}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleCheckout}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('Processing')}...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t('Proceed to Payment')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
