'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useCartContext } from '@/components/cart/cartProvider';
import { StripeWrapper } from '@/components/stripeWrapper';
import CheckoutForm from '@/components/checkout-form';
import { useLanguage } from '@/components/language-provider';
import GuestDetailsForm, { GuestDetails } from '@/components/checkout/guest-details-form';

// 🔹 auth + profil-läsning
import { useFirebase } from '@/components/firebase-provider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// 🔹 dina varukorgskomponenter (med bilder och sammanfattning)
import CartItemList from '@/components/cart/cartItemList';
import CartSummary from '@/components/cart/cartSummary';

// vilka fält som krävs för att skapa PI
const REQUIRED: (keyof GuestDetails)[] = ['fullName', 'email', 'addressLine1', 'postalCode', 'city', 'country'];
const isValidBuyer = (b?: Partial<GuestDetails>) =>
  !!b &&
  REQUIRED.every(k => (b[k] ?? '').toString().trim().length > 0) &&
  /\S+@\S+\.\S+/.test(String(b.email || ''));

export default function CheckoutIntentPage() {
  const { t } = useLanguage();
  const { cartItems } = useCartContext();
  const { toast } = useToast();
  const router = useRouter();

  const { user } = useFirebase(); // ← inloggad?
  const loggedIn = !!user;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Gäst/Buyer state
  const [guest, setGuest] = useState<GuestDetails>(() => {
    try { return JSON.parse(localStorage.getItem('guestDetails') || '{}'); } catch { return {} as any; }
  });
  const [guestValid, setGuestValid] = useState(false);

  // Profil från Firestore (för inloggad)
  const [profile, setProfile] = useState<GuestDetails | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Läs profilen för inloggad användare (customers/<uid>)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setProfileLoaded(false);
      if (!user?.uid) { setProfile(null); setProfileLoaded(true); return; }
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
    return () => { cancelled = true; };
  }, [user?.uid, user?.email]);

  const emptyCart = useMemo(() => !cartItems || cartItems.length === 0, [cartItems]);

  // om vi nyss kom från /checkout/success, nollställ allt
  useEffect(() => {
    try {
      if (sessionStorage.getItem('checkoutJustSucceeded') === '1') {
        sessionStorage.removeItem('checkoutJustSucceeded');
        setClientSecret(null);
        setGuest({
          fullName: '', email: '', phone: '',
          addressLine1: '', addressLine2: '',
          postalCode: '', city: '', country: 'SE'
        } as GuestDetails);
        setGuestValid(false);
        localStorage.removeItem('guestDetails');
      }
    } catch { }
  }, []);

  // 🔄 Reset: när varukorgen ändras (eller blir tom), börja om
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setClientSecret(null);
      setGuest({
        fullName: '', email: '', phone: '',
        addressLine1: '', addressLine2: '',
        postalCode: '', city: '', country: 'SE'
      } as GuestDetails);
      setGuestValid(false);
      try { localStorage.removeItem('guestDetails'); } catch { }
    }
  }, [cartItems?.length]);

  // Vilken buyer-data ska vi använda
  const effectiveBuyer: GuestDetails | null = useMemo(() => {
    if (loggedIn && profile && isValidBuyer(profile)) return profile;
    if (!loggedIn && guestValid) return guest;
    // Om inloggad men profilen saknar fält → tvinga formulär (prefilla med profil/guest)
    return null;
  }, [loggedIn, profile, guest, guestValid]);

  const createPaymentIntent = async () => {
    if (emptyCart) {
      // skicka hem när vagnen är tom
      router.replace('/marketplace');
      return;
    }

    // välj buyer: inloggads profil om giltig, annars gästens formulär
    const buyerToSend: GuestDetails | null = effectiveBuyer || (loggedIn ? null : (guestValid ? guest : null));
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
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems, buyer: buyerToSend }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) throw new Error(data?.error || 'Något gick fel vid betalning.');
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

  // om vagnen är tom → redirect och rendera inte “tom-vyn”
  if (emptyCart) {
    if (typeof window !== 'undefined') router.replace('/marketplace');
    return null;
  }

  // Dessa används bara om du visar egna totals i vänsterkolumn eller någon annanstans
  const currency = 'SEK';
  const cartSubtotal = useMemo(
    () => cartItems?.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0) ?? 0,
    [cartItems]
  );
  const shippingFee = cartSubtotal < 500 && cartSubtotal > 0 ? 50 : 0;
  const cartTotal = cartSubtotal + shippingFee;

  // Readonly-kort med kontouppgifter (för inloggad med komplett profil)
  const ProfileSummary = ({ data }: { data: GuestDetails }) => (
    <div className="space-y-1 text-sm">
      <div><span className="font-medium">{t('Namn')}:</span> {data.fullName}</div>
      <div><span className="font-medium">E-post:</span> {data.email}</div>
      {data.phone ? <div><span className="font-medium">{t('Telefon')}:</span> {data.phone}</div> : null}
      <div><span className="font-medium">{t('Adress')}:</span> {data.addressLine1}{data.addressLine2 ? `, ${data.addressLine2}` : ''}</div>
      <div><span className="font-medium">{t('Ort')}:</span> {data.postalCode} {data.city}</div>
      <div><span className="font-medium">{t('Land')}:</span> {data.country}</div>
      <p className="text-xs text-gray-500 mt-2">{t('Vi använder dina sparade uppgifter för kvitto och orderbekräftelse.')}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vänster: Kunduppgifter + Betalning (oförändrat UI) */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold">{t('Slutför betalning')}</h2>

          {/* Kunduppgifter */}
          <section>
            <h3 className="text-sm font-medium mb-2">{t('Kunduppgifter')}</h3>

            {/* Inloggad och profil komplett → visa sammanfattning (ingen form) */}
            {loggedIn && profileLoaded && profile && isValidBuyer(profile) && !clientSecret && (
              <ProfileSummary data={profile} />
            )}

            {/* Inloggad men profil INTE komplett → visa formulär, prefyll med profil */}
            {loggedIn && profileLoaded && (!profile || !isValidBuyer(profile)) && (
              <GuestDetailsForm
                initial={{ ...(profile || {}), ...(guest || {}) }}
                onChange={(g, valid) => { setGuest(g as GuestDetails); setGuestValid(valid); }}
                disabled={!!clientSecret}
              />
            )}

            {/* Ej inloggad → visa gästform */}
            {!loggedIn && (
              <GuestDetailsForm
                initial={guest}
                onChange={(g, valid) => { setGuest(g as GuestDetails); setGuestValid(valid); }}
                disabled={!!clientSecret}
              />
            )}
          </section>

          {/* Betalning */}
          {!clientSecret ? (
            <div className="pt-2">
              <button
                onClick={createPaymentIntent}
                disabled={creating || (loggedIn ? false : !guestValid)}
                className="w-full bg-purple-600 text-white rounded-md px-4 py-2 disabled:opacity-60"
              >
                {creating ? t('Skapar betalning...') : t('Fortsätt till betalning')}
              </button>
              {!loggedIn && (
                <p className="text-xs text-gray-500 mt-2">
                  {t('Vi använder din e-post för kvitto och orderbekräftelse.')}
                </p>
              )}
              {loggedIn && profileLoaded && profile && !isValidBuyer(profile) && (
                <p className="text-xs text-amber-600 mt-2">
                  {t('Din profil saknar uppgifter. Fyll i fälten ovan innan du fortsätter.')}
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
