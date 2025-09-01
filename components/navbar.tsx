'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/components/language-provider';
import { useFirebase } from '@/components/firebase-provider';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Settings,
  Menu,
} from 'lucide-react';

import categoriesData from '@/lib/categories.json';
import { useCartContext } from './cart/cartProvider';

const categories = categoriesData.categories;

export function Navbar() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, userType, loading } = useFirebase();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems } = useCartContext();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [localCartCount, setLocalCartCount] = useState(cartCount);

  // 👉 vår guard-funktion för varukorgen
  const openCart = () => {
    if (!user) {
      router.push('/auth/signin?next=/varukorg&msg=need-account');
    } else {
      router.push('/varukorg');
    }
  };

  useEffect(() => {
    setLocalCartCount(cartCount);
  }, [cartCount]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('cart-')) {
        try {
          const updatedCart = event.newValue ? JSON.parse(event.newValue) : [];
          const count = updatedCart.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          );
          setLocalCartCount(count);
        } catch (error) {
          console.error('Fel vid synk av cart i Navbar:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.uid) {
        localStorage.removeItem(`cart-${user.uid}`);
      }
      await signOut(auth);
    } catch (error) {
      console.error('Fel vid utloggning:', error);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Mobile burger menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 pb-4 bg-gradient-to-r from-purple-50 to-pink-50">
                    <SheetTitle className="text-left text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Clickfynd.se
                    </SheetTitle>
                    <SheetDescription className="text-left text-sm text-gray-600">
                      Utforska våra kategorier
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {categories.map((category) => (
                      <div key={category.title} className="space-y-3">
                        <Link
                          href={category.href}
                          className="block text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category.title}
                        </Link>
                        <div className="space-y-2 ml-4 border-l border-gray-200 pl-4">
                          {category.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block text-sm text-gray-600 hover:text-purple-600 transition-colors py-1"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 p-6">
                    {!loading && !user ? (
                      <div className="space-y-3">
                        <Link
                          href="/auth/signin"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                            Logga in
                          </Button>
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            Skapa konto
                          </Button>
                        </Link>
                      </div>
                    ) : !loading && user ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || ''} />
                            <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                              {user.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.displayName || user.email}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {['company', 'superadmin', 'customer'].includes(
                          userType || ''
                        ) && (
                          <Link
                            href="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                            >
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              Dashboard
                            </Button>
                          </Link>
                        )}

                        <Link
                          href="/dashboard/settings"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Inställningar
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logga ut
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - centered on mobile, left on desktop */}
          <Link href="/" className="flex items-center md:mr-auto">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Clickfynd.se
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <Input
                type="search"
                placeholder="Sök..."
                className="w-[160px] lg:w-[200px] py-1 h-8 text-sm pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            </form>

            {/* 👉 här använder vi openCart istället för Link */}
            <Button
              variant="ghost"
              size="sm"
              className="relative h-8 w-8 p-0"
              onClick={openCart}
              aria-label="Öppna varukorg"
            >
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              {localCartCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-purple-600 text-xs"
                  variant="default"
                >
                  {localCartCount}
                </Badge>
              )}
            </Button>

            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback className="bg-muted text-purple-600 font-semibold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {['company', 'superadmin', 'customer'].includes(
                    userType || ''
                  ) && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className={cn(
                            'flex items-center text-muted-foreground hover:text-foreground',
                            pathname === '/dashboard' && 'text-purple-600'
                          )}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/settings"
                      className={cn(
                        'flex items-center text-muted-foreground hover:text-foreground',
                        pathname === '/inställningar' && 'text-purple-600'
                      )}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Inställningar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    Logga ut
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!loading && !user && (
              <Link href="/auth/signin" className="hidden md:block">
                <Button variant="ghost" className="ml-2">
                  Logga in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block border-t">
        <div className="container mx-auto px-4">
          <NavigationMenu className="mx-auto">
            <NavigationMenuList>
              {categories.map((category) => (
                <NavigationMenuItem key={category.title}>
                  <NavigationMenuTrigger className="h-10 text-sm">
                    {category.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="mb-3">
                        <Link
                          href={category.href}
                          className="text-sm font-medium hover:text-purple-600"
                        >
                          Visa allt i {category.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {category.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="group block p-2 rounded-md hover:bg-muted"
                          >
                            <div className="text-sm font-medium group-hover:text-purple-600">
                              {item.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}
