'use client';

import AuthGate from '@/app/auth/authGate';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate next="/checkout/intent">{children}</AuthGate>;
}
