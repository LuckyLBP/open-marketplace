'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Search,
  ShoppingCart,
  Menu,
  User,
  LogOut,
  ChevronRight,
  Heart,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

import categoriesData from '@/lib/categories.json';
import { useCartContext } from './cart/cartProvider';

const categories = categoriesData.categories;

export function Navbar() {
  const { t } = useLanguage();
  const { user, userType, loading } = useFirebase();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartItems } = useCartContext();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [localCartCount, setLocalCartCount] = useState(cartCount);

  useEffect(() => {
    setLocalCartCount(cartCount);
  }, [cartCount]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cart') {
        try {
          const updatedCart = event.newValue ? JSON.parse(event.newValue) : [];
          const count = updatedCart.reduce((sum: number, item: any) => sum + item.quantity, 0);
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
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
          {/* Hamburger Menu (Left Side) - visible on all screen sizes */}
          <div className="flex items-center"></div>

          {/* Search, Cart, and User */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
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

            <Link href="/varukorg">
              <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
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
            </Link>

            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback className="bg-muted text-purple-600 font-semibold">
                        {user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {userType === 'company' && (
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
                      href="/wishlist"
                      className={cn(
                        'flex items-center text-muted-foreground hover:text-foreground',
                        pathname === '/wishlist' && 'text-purple-600'
                      )}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Önskelista
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/inställningar"
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
                    onClick={() => signOut(auth)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    Logga ut
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Categories Navigation */}
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
