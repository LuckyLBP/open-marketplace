"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useLanguage } from "@/components/language-provider"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Search, ShoppingCart, Menu, User, LogOut, ChevronRight, Heart, LayoutDashboard, Settings } from "lucide-react"

const categories = [
  {
    title: "Electronics",
    href: "/marketplace?category=electronics",
    description: "Discover the latest tech gadgets and electronic devices",
    items: ["Smartphones", "Laptops", "Audio", "Wearables", "Accessories"],
  },
  {
    title: "Clothing",
    href: "/marketplace?category=clothing",
    description: "Browse fashion items for all styles and occasions",
    items: ["Men's", "Women's", "Kids", "Shoes", "Accessories"],
  },
  {
    title: "Home & Garden",
    href: "/marketplace?category=home",
    description: "Find everything you need for your home and garden",
    items: ["Furniture", "Decor", "Kitchen", "Garden", "Lighting"],
  },
  {
    title: "Beauty & Health",
    href: "/marketplace?category=beauty",
    description: "Explore beauty products and health essentials",
    items: ["Skincare", "Makeup", "Hair Care", "Fragrances", "Wellness"],
  },
]

export function Navbar() {
  const { t } = useLanguage()
  const { user, userType, loading } = useFirebase()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState(0)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Mock cart count - in a real app, this would come from your cart state
  useEffect(() => {
    setCartCount(Math.floor(Math.random() * 5))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative h-6 w-6 mr-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                DealsMarket
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <NavigationMenu className="max-h-14">
              <NavigationMenuList className="gap-0.5">
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "py-1 px-2 h-auto text-sm")}>Hem</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="py-1 px-2 h-auto text-sm">Kategorier</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-3 md:w-[500px] md:grid-cols-2 lg:w-[550px]">
                      {categories.map((category) => (
                        <li key={category.title} className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              href={category.href}
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md"
                            >
                              <div className="mb-1 mt-2 text-base font-medium">{t(category.title)}</div>
                              <p className="text-xs leading-tight text-muted-foreground">{t(category.description)}</p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/marketplace" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "py-1 px-2 h-auto text-sm")}>Marknadsplats</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
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

            {/* User Menu (Desktop) */}
            {!loading && (
              <div className="hidden md:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                            {user.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {user.displayName && <p className="font-medium text-sm">{user.displayName}</p>}
                          {user.email && (
                            <p className="w-[200px] truncate text-xs text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      
                      {userType === "company" ? (
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
                      <Button variant="ghost" size="sm" className="h-8 text-xs px-2">Logga in</Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="h-8 text-xs px-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Registrera
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle className="text-left text-base">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-3">
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
                            "flex items-center py-1.5 text-muted-foreground hover:text-foreground",
                            pathname === "/" && "text-foreground font-medium",
                          )}
                        >
                          Hem
                        </Link>
                      </SheetClose>

                      <div className="py-1.5">
                        <p className="mb-1.5 font-medium">Kategorier</p>
                        {categories.map((category) => (
                          <SheetClose asChild key={category.title}>
                            <Link
                              href={category.href}
                              className="flex items-center justify-between py-1 pl-3 text-xs text-muted-foreground hover:text-foreground"
                            >
                              {t(category.title)}
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </SheetClose>
                        ))}
                      </div>

                      <SheetClose asChild>
                        <Link
                          href="/marketplace"
                          className={cn(
                            "flex items-center py-1.5 text-muted-foreground hover:text-foreground",
                            pathname === "/marketplace" && "text-foreground font-medium",
                          )}
                        >
                          {t("Marketplace")}
                        </Link>
                      </SheetClose>

                      <SheetClose asChild>
                        <Link
                          href="/about"
                          className={cn(
                            "flex items-center py-1.5 text-muted-foreground hover:text-foreground",
                            pathname === "/about" && "text-foreground font-medium",
                          )}
                        >
                          {t("About")}
                        </Link>
                      </SheetClose>
                    </div>

                    <div className="mt-4 border-t pt-4">
                      {user ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                              <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                {user.email?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              {user.displayName && <p className="font-medium text-sm">{user.displayName}</p>}
                              {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                            </div>
                          </div>

                          {userType === "company" ? (
                            <SheetClose asChild>
                              <Link
                                href="/dashboard"
                                className="flex items-center py-1.5 text-sm text-muted-foreground hover:text-foreground"
                              >
                                <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                                Kontrollcenter
                              </Link>
                            </SheetClose>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href="/wishlist"
                                className="flex items-center py-1.5 text-sm text-muted-foreground hover:text-foreground"
                              >
                                <Heart className="mr-2 h-3.5 w-3.5" />
                                Önskelista
                              </Link>
                            </SheetClose>
                          )}

                          <SheetClose asChild>
                            <Link
                              href="/settings"
                              className="flex items-center py-1.5 text-sm text-muted-foreground hover:text-foreground"
                            >
                              <Settings className="mr-2 h-3.5 w-3.5" />
                              Inställningar
                            </Link>
                          </SheetClose>

                          <button
                            className="flex w-full items-center py-1.5 text-sm text-red-600 hover:text-red-700"
                            onClick={() => {
                              signOut(auth);
                            }}
                          >
                            <LogOut className="mr-2 h-3.5 w-3.5" />
                            Logga ut
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <SheetClose asChild>
                            <Link href="/auth/signin">
                              <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                                <User className="mr-2 h-3.5 w-3.5" />
                                Logga in
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/auth/signup">
                              <Button size="sm" className="w-full h-8 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                Registrera
                              </Button>
                            </Link>
                          </SheetClose>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
