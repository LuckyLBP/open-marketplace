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
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
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

// Import categories from JSON file
import categoriesData from '@/lib/categories.json';

const categories = categoriesData.categories;

export function Navbar() {
  const { t } = useLanguage();
  const { user, userType, loading } = useFirebase();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock cart count - in a real app, this would come from your cart state
  useEffect(() => {
    setCartCount(Math.floor(Math.random() * 5));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(
        searchQuery
      )}`;
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
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] sm:w-[320px] overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle className="text-left text-base">Menu</SheetTitle>
                </SheetHeader>
                <div className="py-3 h-full overflow-y-auto">
                  <form onSubmit={handleSearch} className="relative mb-4">
                    <Input
                      type="search"
                      placeholder="Sök..."
                      className="w-full pl-8 h-8 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  </form>

                  <div className="flex flex-col space-y-2 text-sm">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className={cn(
                          'flex items-center py-2 text-base font-medium hover:text-foreground',
                          pathname === '/' && 'text-foreground font-medium'
                        )}
                      >
                        Hem
                      </Link>
                    </SheetClose>

                    <Separator className="my-2" />

                    <p className="font-medium text-base mb-2">Kategorier</p>
                    {categories.map((category) => (
                      <div key={category.title} className="mb-3">
                        <SheetClose asChild>
                          <Link
                            href={category.href}
                            className="flex items-center justify-between py-1.5 text-sm font-medium hover:text-foreground"
                          >
                            {category.title}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </SheetClose>
                        <div className="ml-3 mt-1 space-y-1 border-l pl-3 border-gray-100">
                          {category.items.map((item) => (
                            <SheetClose asChild key={item.name}>
                              <Link
                                href={item.href}
                                className="flex items-center py-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                {item.name}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </div>
                    ))}

                    <Separator className="my-2" />

                    <SheetClose asChild>
                      <Link
                        href="/about"
                        className={cn(
                          'flex items-center py-2 text-muted-foreground hover:text-foreground',
                          pathname === '/about' && 'text-foreground font-medium'
                        )}
                      >
                        Om oss
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-6 w-6 mr-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                BudFynd.se
              </span>
            </Link>
          </div>

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

            {/* Cart */}
            <Link href="/varukorg">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 p-0"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-purple-600 text-xs"
                    variant="default"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu (both desktop and mobile since we removed the separate mobile menu) */}
            {!loading && (
              <div className="block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 w-8 p-0"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={user.photoURL || ''}
                            alt={user.displayName || 'User'}
                          />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {user.displayName && (
                            <p className="font-medium text-sm">
                              {user.displayName}
                            </p>
                          )}
                          {user.email && (
                            <p className="w-[200px] truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />

                      {userType === 'company' ? (
                        // Company-specific menu items
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span className="text-sm">Kontrollcenter</span>
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        // Customer-specific menu items
                        <DropdownMenuItem asChild>
                          <Link href="/wishlist" className="cursor-pointer">
                            <Heart className="mr-2 h-4 w-4" />
                            <span className="text-sm">Önskelista</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span className="text-sm">Inställningar</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onSelect={() => {
                          // Handle logout
                          signOut(auth);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span className="text-sm">Logga ut</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-1">
                    <Link href="/auth/signin">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs px-2 hidden sm:inline-flex"
                      >
                        Logga in
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button
                        size="sm"
                        className="h-8 text-xs px-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hidden sm:inline-flex"
                      >
                        Registrera
                      </Button>
                    </Link>
                    <Link href="/auth/signin" className="sm:hidden">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <User className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
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
