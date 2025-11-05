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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full"></div>
      </div>
    );
  }

  // Show empty cart state
  if (emptyCart && showEmptyState) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('Din varukorg är tom')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('Du har inga produkter i varukorgen just nu.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Readonly-kort med kontouppgifter (för inloggad med komplett profil)
  const ProfileSummary = ({ data }: { data: GuestDetails }) => (
    <div className="space-y-1 text-sm">
      <div>
        <span className="font-medium">{t('Namn')}:</span> {data.fullName}
      </div>
      <div>
        <span className="font-medium">E-post:</span> {data.email}
      </div>
      {data.phone ? (
        <div>
          <span className="font-medium">{t('Telefon')}:</span> {data.phone}
        </div>
      ) : null}
      <div>
        <span className="font-medium">{t('Adress')}:</span> {data.addressLine1}
        {data.addressLine2 ? `, ${data.addressLine2}` : ''}
      </div>
      <div>
        <span className="font-medium">{t('Ort')}:</span> {data.postalCode}{' '}
        {data.city}
      </div>
      <div>
        <span className="font-medium">{t('Land')}:</span> {data.country}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {t(
          'Vi använder dina sparade uppgifter för kvitto och orderbekräftelse.'
        )}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vänster: Kunduppgifter + Betalning (oförändrat UI) */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('Slutför betalning')}</h2>
          </div>

          {/* Kunduppgifter */}
          <section>
            <h3 className="text-sm font-medium mb-2">{t('Kunduppgifter')}</h3>

            {/* Inloggad och profil komplett → visa sammanfattning (ingen form) */}
            {loggedIn &&
              profileLoaded &&
              profile &&
              isValidBuyer(profile) &&
              !clientSecret && <ProfileSummary data={profile} />}

            {/* Inloggad men profil INTE komplett → visa formulär med varning om vilka fält som saknas */}
            {loggedIn &&
              profileLoaded &&
              (!profile || !isValidBuyer(profile)) && (
                <div>
                  {(() => {
                    const missing = getMissingFields(profile);
                    return missing.length > 0 ? (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          {t('Följande fält saknas i din profil:')}
                        </p>
                        <ul className="text-xs text-amber-800 list-disc list-inside">
                          {missing.map((field) => (
                            <li key={field} className="capitalize">
                              {field === 'fullName' && t('Fullständigt namn')}
                              {field === 'email' && t('E-post')}
                              {field === 'addressLine1' && t('Adress')}
                              {field === 'postalCode' && t('Postnummer')}
                              {field === 'city' && t('Stad')}
                              {field === 'country' && t('Land')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  })()}
                  <GuestDetailsForm
                    initial={{ ...(profile || {}), ...(guest || {}) }}
                    onChange={(g, valid) => {
                      setGuest(g as GuestDetails);
                      setGuestValid(valid);
                    }}
                    disabled={!!clientSecret}
                  />
                </div>
              )}

            {/* Ej inloggad → visa gästform */}
            {!loggedIn && (
              <GuestDetailsForm
                initial={guest}
                onChange={(g, valid) => {
                  setGuest(g as GuestDetails);
                  setGuestValid(valid);
                }}
                disabled={!!clientSecret}
              />
            )}
          </section>

          {/* Betalning */}
          {!clientSecret ? (
            <div className="pt-2">
              {(() => {
                // Calculate if button should be enabled
                const isButtonEnabled = !creating && effectiveBuyer !== null;

                return (
                  <>
                    <button
                      onClick={createPaymentIntent}
                      disabled={!isButtonEnabled}
                      className={`w-full rounded-md px-4 py-2 font-medium transition-colors ${
                        isButtonEnabled
                          ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {creating
                        ? t('Skapar betalning...')
                        : t('Fortsätt till betalning')}
                    </button>
                  </>
                );
              })()}
              {!loggedIn && (
                <p className="text-xs text-gray-500 mt-2">
                  {t('Vi använder din e-post för kvitto och orderbekräftelse.')}
                </p>
              )}
              {loggedIn &&
                profileLoaded &&
                profile &&
                !isValidBuyer(profile) && (
                  <p className="text-xs text-amber-600 mt-2">
                    {t(
                      'Fyll i alla obligatoriska fält ovan innan du kan fortsätta.'
                    )}
                  </p>
                )}
            </div>
          ) : (
            <section className="pt-2">
              <h3 className="text-sm font-medium mb-2">{t('Betalning')}</h3>
              <div className="border rounded-lg p-4">
                <StripeWrapper clientSecret={clientSecret}>
                  <CheckoutForm />
                </StripeWrapper>
              </div>
            </section>
          )}
        </div>

        {/* Höger: din gamla varukorgs-UI (med bilder och totals) */}
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-0">
            <CartItemList />
          </div>
          <div className="bg-white shadow-md rounded-lg p-0">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
