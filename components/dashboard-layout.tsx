'use client';

import React, { useState } from 'react';
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
  Search,
  User,
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

  if (!user) return null;

  const current = navigation.find((n) => n.href === pathname) || navigation[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white text-gray-800">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 bg-white/60 backdrop-blur-sm p-2 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-lg font-semibold text-purple-600">ClickFynd</div>
        </div>
        <div className="flex items-center gap-2">
          <img
            src={user?.photoURL || '/placeholder-user.jpg'}
            alt="user"
            className="h-8 w-8 rounded-full object-cover border"
          />
        </div>
      </header>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-40 w-72 bg-white border-r p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xl font-bold text-purple-600">ClickFynd</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X />
              </Button>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      pathname === item.href
                        ? 'text-purple-600'
                        : 'text-gray-400'
                    }`}
                  />
                  {t(item.name)}
                </Link>
              ))}
            </nav>
            <div className="mt-6">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600"
              >
                <LogOut className="h-4 w-4" /> {t('Logout')}
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex pt-16 lg:pt-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:gap-6 lg:py-6 lg:px-4 border-r bg-white">
          <div className="flex items-center gap-2 px-2">
            <div className="text-2xl font-bold text-purple-600">ClickFynd</div>
          </div>

          <nav className="flex-1 px-1 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    pathname === item.href
                      ? 'text-purple-600'
                      : 'text-gray-400 group-hover:text-purple-600'
                  }`}
                />
                <span className="truncate">{t(item.name)}</span>
              </Link>
            ))}
          </nav>

          <div className="px-3">
            <div className="flex items-center gap-3 border-t pt-4">
              <img
                src={user?.photoURL || '/placeholder-user.jpg'}
                alt="user"
                className="h-10 w-10 rounded-full object-cover border"
              />
              <div>
                <div className="text-sm font-semibold">
                  {user?.displayName || t('Account')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={handleSignOut}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50"
              >
                <LogOut className="h-4 w-4" /> {t('Logout')}
              </button>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 p-6 lg:p-10">
          {/* Topbar */}
          <div className="sticky top-0 z-10 mb-6 flex items-center justify-between gap-4 bg-transparent">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">{t(current.name)}</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
              >
                <User className="h-4 w-4 mr-2" />{' '}
                {user?.displayName || t('Profile')}
              </Button>
              <img
                src={user?.photoURL || '/placeholder-user.jpg'}
                alt="user"
                className="h-9 w-9 rounded-full object-cover border"
              />
            </div>
          </div>

          {/* Content card */}
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl bg-white/95 p-6 shadow-lg ring-1 ring-black/5">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
