'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useFirebase } from '@/components/firebase-provider';
import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useFirebase();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      if (user?.uid) {
        localStorage.removeItem(`cart-${user.uid}`);
      }
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Deal', href: '/dashboard/create-deal', icon: Package },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-40"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex h-16 items-center justify-center border-b">
            <h2 className="text-xl font-bold text-purple-600">BudFynd.se</h2>
          </div>
          <nav className="mt-5 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${pathname === item.href
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${pathname === item.href
                    ? 'text-purple-600'
                    : 'text-gray-400 group-hover:text-purple-600'
                    }`}
                />
                {t(item.name)}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="mt-4 group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-purple-600" />
              {t('Logout')}
            </button>
          </nav>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 overflow-y-auto border-r bg-white lg:block">
        <div className="flex h-16 items-center justify-center border-b">
          <h2 className="text-xl font-bold text-purple-600">BudFynd.se</h2>
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${pathname === item.href
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${pathname === item.href
                  ? 'text-purple-600'
                  : 'text-gray-400 group-hover:text-purple-600'
                  }`}
              />
              {t(item.name)}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="mt-4 group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-purple-600" />
            {t('Logout')}
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
