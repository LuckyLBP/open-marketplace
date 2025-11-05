'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useCartContext } from '@/components/cart/cartProvider';
import { StripeWrapper } from '@/components/stripeWrapper';
import CheckoutForm from '@/components/checkout-form';
import { useLanguage } from '@/components/language-provider';
import GuestDetailsForm, {
  GuestDetails,
} from '@/components/checkout/guest-details-form';
import { useFirebase } from '@/components/firebase-provider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import CartItemList from '@/components/cart/cartItemList';
import CartSummary from '@/components/cart/cartSummary';

const REQUIRED: (keyof GuestDetails)[] = [
  'fullName',
  'email',
  'addressLine1',
  'postalCode',
  'city',
  'country',
];
const isValidBuyer = (b?: Partial<GuestDetails>) =>
  !!b &&
  REQUIRED.every((k) => (b[k] ?? '').toString().trim().length > 0) &&
  /\S+@\S+\.\S+/.test(String(b.email || ''));

const getMissingFields = (
  b?: Partial<GuestDetails> | null
): (keyof GuestDetails)[] => {
  if (!b) return REQUIRED;
  return REQUIRED.filter((k) => (b[k] ?? '').toString().trim().length === 0);
};

export default function CheckoutIntentPage() {
  // 🔄 ALL HOOKS FIRST - NO EARLY RETURNS BEFORE ALL HOOKS ARE CALLED
  const { t } = useLanguage();
  const { cartItems } = useCartContext();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useFirebase();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [guest, setGuest] = useState<GuestDetails>(() => {
    try {
      return JSON.parse(localStorage.getItem('guestDetails') || '{}');
    } catch {
      return {} as any;
    }
  });
  const [guestValid, setGuestValid] = useState(false);
  const [profile, setProfile] = useState<GuestDetails | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  // 🔄 ALL COMPUTED VALUES AND MEMOS
  const loggedIn = !!user;
  const emptyCart = useMemo(
    () => !cartItems || cartItems.length === 0,
    [cartItems]
  );
  const cartSubtotal = useMemo(
    () =>
      cartItems?.reduce(
        (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
        0
      ) ?? 0,
    [cartItems]
  );
  const shippingFee = cartSubtotal < 500 && cartSubtotal > 0 ? 50 : 0;
  const cartTotal = cartSubtotal + shippingFee;
  const effectiveBuyer: GuestDetails | null = useMemo(() => {
    // For logged-in users: check if profile is valid, otherwise check guest
    if (loggedIn) {
      if (profile && isValidBuyer(profile)) return profile;
      if (guest && isValidBuyer(guest)) return guest;
      return null;
    }
    // For guests: check if guestValid flag is set
    if (!loggedIn && guestValid) return guest;
    return null;
  }, [loggedIn, profile, guest, guestValid]);

  // 🔄 ALL USE EFFECTS
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setProfileLoaded(false);
      if (!user?.uid) {
        setProfile(null);
        setProfileLoaded(true);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'customers', user.uid));
        const data = snap.exists() ? (snap.data() as any) : {};
        const prof: GuestDetails = {
          fullName: data.fullName || data.name || '',
          email: user.email || data.email || '',
          phone: data.phone || '',
          addressLine1: data.addressLine1 || data.address || '',
          addressLine2: data.addressLine2 || '',
          postalCode: data.postalCode || '',
          city: data.city || '',
          country: data.country || 'SE',
        };
        if (!cancelled) setProfile(prof);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setProfileLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.email]);

  // Handle empty cart with a small delay to prevent abrupt unmounting
  useEffect(() => {
    if (emptyCart) {
      const timer = setTimeout(() => {
        setShowEmptyState(true);
      }, 100); // Small delay to allow for smooth transition
      return () => clearTimeout(timer);
    } else {
      setShowEmptyState(false);
    }
  }, [emptyCart]);

  // om vi nyss kom från /checkout/success, nollställ allt
  useEffect(() => {
    try {
      if (sessionStorage.getItem('checkoutJustSucceeded') === '1') {
        sessionStorage.removeItem('checkoutJustSucceeded');
        setClientSecret(null);
        setGuest({
          fullName: '',
          email: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          postalCode: '',
          city: '',
          country: 'SE',
        } as GuestDetails);
        setGuestValid(false);
        localStorage.removeItem('guestDetails');
      }
    } catch {}
  }, []);

  // 🔄 Reset: när varukorgen ändras (eller blir tom), börja om
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      // Only reset if we had items before (not on initial load)
      if (clientSecret) {
        setClientSecret(null);
      }
      // Keep guest form data even when cart is empty
      // setGuest({...}); // Don't reset guest form
      // setGuestValid(false); // Don't reset validation
      // Don't remove guest details from localStorage when cart becomes empty
    }
  }, [cartItems?.length, clientSecret]);

  const createPaymentIntent = async () => {
    console.log('🔥 createPaymentIntent called!', {
      emptyCart,
      loggedIn,
      guestValid,
      creating,
    });

    if (emptyCart) {
      // Don't create payment intent if cart is empty
      toast({
        title: t('Varukorgen är tom'),
        description: t('Lägg till produkter innan du fortsätter.'),
        variant: 'destructive',
      });
      return;
    }

    // välj buyer: inloggads profil om giltig, annars gästens formulär
    const buyerToSend: GuestDetails | null =
      effectiveBuyer || (loggedIn ? null : guestValid ? guest : null);
    if (!buyerToSend) {
      toast({
        title: t('Komplettera kunduppgifter'),
        description: loggedIn
          ? t('Din profil saknar uppgifter. Fyll i formuläret nedan.')
          : t('Fyll i namn, e-post och adress innan du fortsätter.'),
        variant: 'destructive',
      });
      return;
    }

    // ✅ Se till att vi inte återanvänder ett gammalt PaymentIntent
    setClientSecret(null);
    setCreating(true);
    try {
      console.log('📤 Sending payment intent request:', {
        itemCount: cartItems?.length,
        items: cartItems?.map((i) => ({
          id: i.id,
          price: i.price,
          companyId: i.companyId,
        })),
        buyer: buyerToSend,
      });

      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems, buyer: buyerToSend }),
      });
      const data = await res.json();
      console.log('📥 Payment intent response:', {
        status: res.status,
        data: JSON.stringify(data, null, 2),
      });

      if (!res.ok || !data.clientSecret) {
        const errorMsg =
          data?.debug || data?.error || 'Något gick fel vid betalning.';
        console.error('❌ Payment intent error:', errorMsg);
        throw new Error(errorMsg);
      }
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      console.error('checkout error:', error);
      toast({
        title: t('Fel'),
        description: error?.message || t('Kunde inte initiera betalningen.'),
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  // ⭐ RENDERING LOGIC - ALL CONDITIONAL RENDERING HAPPENS HERE
  // Show loading while transitioning to empty state
  if (emptyCart && !showEmptyState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">{t('Laddar varukorg...')}</p>
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (emptyCart && showEmptyState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('Varukorg')}
                </h1>
                <p className="text-sm text-gray-500">
                  {t('Din varukorg är tom')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2-2v4.01"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t('Din varukorg är tom')}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {t(
                  'Det ser lite tomt ut här. Lägg till några fantastiska erbjudanden!'
                )}
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="/marketplace"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {t('Utforska erbjudanden')}
              </a>

              <a
                href="/marketplace"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                {t('Se alla kategorier')}
              </a>
            </div>

            {/* Popular categories */}
            <div className="mt-12">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                {t('Populära kategorier')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/marketplace?category=elektronik"
                  className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                >
                  <span className="text-xl">📱</span>
                  <span className="text-sm font-medium text-gray-700">
                    Elektronik
                  </span>
                </a>
                <a
                  href="/marketplace?category=mode"
                  className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                >
                  <span className="text-xl">👗</span>
                  <span className="text-sm font-medium text-gray-700">
                    Mode
                  </span>
                </a>
                <a
                  href="/marketplace?category=hemmet"
                  className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                >
                  <span className="text-xl">🏠</span>
                  <span className="text-sm font-medium text-gray-700">
                    Hemmet
                  </span>
                </a>
                <a
                  href="/marketplace?category=halsa-skonhet"
                  className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                >
                  <span className="text-xl">💄</span>
                  <span className="text-sm font-medium text-gray-700">
                    Skönhet
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modern ProfileSummary component
  const ProfileSummary = ({ data }: { data: GuestDetails }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-gray-900 font-medium">{data.fullName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-900">{data.email}</span>
        </div>
        {data.phone && (
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="text-gray-900">{data.phone}</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <svg
            className="w-4 h-4 text-gray-400 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div className="text-gray-900">
            <div>{data.addressLine1}</div>
            {data.addressLine2 && <div>{data.addressLine2}</div>}
            <div>
              {data.postalCode} {data.city}
            </div>
            <div>{data.country}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('Säker utcheckning')}
                </h1>
                <p className="text-sm text-gray-500">
                  {t('Slutför ditt köp på några sekunder')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-1.148 5.076-2.964 7.062-5.204"
                />
              </svg>
              <span>{t('SSL-säkrad')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vänster: Kunduppgifter + Betalning (2 kolumner) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      !clientSecret
                        ? 'bg-purple-600 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {!clientSecret ? '1' : '✓'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {t('Kunduppgifter')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('Fyll i dina uppgifter')}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-4">
                  <div className="w-16 h-0.5 bg-gray-200"></div>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      clientSecret
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    2
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${
                        clientSecret ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {t('Betalning')}
                    </h3>
                    <p
                      className={`text-sm ${
                        clientSecret ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {t('Välj betalmetod')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kunduppgifter Section */}
              <div className="space-y-4">
                {/* Inloggad och profil komplett → visa modern sammanfattning */}
                {loggedIn &&
                  profileLoaded &&
                  profile &&
                  isValidBuyer(profile) &&
                  !clientSecret && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-green-900 mb-2">
                            {t('Dina sparade uppgifter')}
                          </h4>
                          <ProfileSummary data={profile} />
                        </div>
                      </div>
                    </div>
                  )}

                {/* Inloggad men profil INTE komplett → visa förbättrat formulär */}
                {loggedIn &&
                  profileLoaded &&
                  (!profile || !isValidBuyer(profile)) && (
                    <div className="space-y-4">
                      {(() => {
                        const missing = getMissingFields(profile);
                        return missing.length > 0 ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <svg
                                  className="w-5 h-5 text-amber-600 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-amber-900 mb-1">
                                  {t('Komplettera din profil')}
                                </h4>
                                <p className="text-sm text-amber-800 mb-2">
                                  {t('Följande fält saknas:')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {missing.map((field) => (
                                    <span
                                      key={field}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                                    >
                                      {field === 'fullName' &&
                                        t('Fullständigt namn')}
                                      {field === 'email' && t('E-post')}
                                      {field === 'addressLine1' && t('Adress')}
                                      {field === 'postalCode' &&
                                        t('Postnummer')}
                                      {field === 'city' && t('Stad')}
                                      {field === 'country' && t('Land')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <GuestDetailsForm
                          initial={{ ...(profile || {}), ...(guest || {}) }}
                          onChange={(g, valid) => {
                            setGuest(g as GuestDetails);
                            setGuestValid(valid);
                          }}
                          disabled={!!clientSecret}
                        />
                      </div>
                    </div>
                  )}

                {/* Ej inloggad → visa förbättrat gästformulär */}
                {!loggedIn && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {t('Dina uppgifter')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {t('För kvitto och leverans')}
                        </p>
                      </div>
                    </div>
                    <GuestDetailsForm
                      initial={guest}
                      onChange={(g, valid) => {
                        setGuest(g as GuestDetails);
                        setGuestValid(valid);
                      }}
                      disabled={!!clientSecret}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Betalning Section */}
            {!clientSecret ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('Nästan klar!')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('Klicka för att fortsätta till säker betalning')}
                    </p>
                  </div>

                  {(() => {
                    const isButtonEnabled =
                      !creating && effectiveBuyer !== null;
                    return (
                      <button
                        onClick={createPaymentIntent}
                        disabled={!isButtonEnabled}
                        className={`w-full rounded-xl px-6 py-4 font-semibold text-lg transition-all duration-200 transform ${
                          isButtonEnabled
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {creating ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>{t('Förbereder betalning...')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <span>{t('Fortsätt till betalning')}</span>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })()}

                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-1.148 5.076-2.964 7.062-5.204"
                        />
                      </svg>
                      <span>SSL-säkert</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span>Alla betalmetoder</span>
                    </div>
                  </div>

                  {!loggedIn && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      <svg
                        className="w-4 h-4 inline mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {t(
                        'Vi använder din e-post för kvitto och orderbekräftelse.'
                      )}
                    </p>
                  )}
                  {loggedIn &&
                    profileLoaded &&
                    profile &&
                    !isValidBuyer(profile) && (
                      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
                        <svg
                          className="w-4 h-4 inline mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        {t(
                          'Fyll i alla obligatoriska fält ovan innan du kan fortsätta.'
                        )}
                      </p>
                    )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t('Välj betalmetod')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('Säker betalning med Stripe')}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <StripeWrapper clientSecret={clientSecret}>
                    <CheckoutForm />
                  </StripeWrapper>
                </div>
              </div>
            )}
          </div>

          {/* Höger: Modern varukorgs-UI */}
          <div className="lg:col-span-1 space-y-6">
            {/* Cart Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <div className="flex items-center justify-between text-white">
                  <h3 className="font-semibold text-lg">
                    {t('Din beställning')}
                  </h3>
                  <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                    {cartItems?.length || 0}{' '}
                    {cartItems?.length === 1 ? 'artikel' : 'artiklar'}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems?.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={item.imageUrl || '/placeholder.png'}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {item.companyName}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            Antal: {item.quantity}
                          </span>
                          <span className="font-semibold text-purple-600">
                            {new Intl.NumberFormat('sv-SE', {
                              style: 'currency',
                              currency: 'SEK',
                            }).format(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('Delsumma')}</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('sv-SE', {
                        style: 'currency',
                        currency: 'SEK',
                      }).format(cartSubtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">{t('Frakt')}</span>
                      {shippingFee === 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('Gratis')}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">{t('Gratis')}</span>
                      ) : (
                        new Intl.NumberFormat('sv-SE', {
                          style: 'currency',
                          currency: 'SEK',
                        }).format(shippingFee)
                      )}
                    </span>
                  </div>

                  {shippingFee > 0 && (
                    <div className="text-xs text-gray-500 bg-blue-50 rounded-lg p-2">
                      <svg
                        className="w-4 h-4 inline mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {t('Fri frakt vid köp över 500 kr')}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {t('Totalt')}
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      {new Intl.NumberFormat('sv-SE', {
                        style: 'currency',
                        currency: 'SEK',
                      }).format(cartTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('Inklusive moms')}
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-1.148 5.076-2.964 7.062-5.204"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">
                        {t('Säker betalning')}
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">
                        {t('Snabb leverans')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    {t('Behöver du hjälp?')}
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    {t('Vi är här för att hjälpa dig med ditt köp.')}
                  </p>
                  <div className="space-y-2">
                    <a
                      href="/kundtjanst/faq"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {t('Läs vanliga frågor')}
                    </a>
                    <a
                      href="/kundtjanst/kontakt"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {t('Kontakta kundtjänst')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
