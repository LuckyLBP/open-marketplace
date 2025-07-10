"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Deal } from "@/hooks/useDeals";
import { useFirebase } from "@/components/firebase-provider";

export interface CartItem extends Deal {
  quantity: number;
}

export function useCart() {
  const { user, loading: loadingUser } = useFirebase(); 
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const storageKey = user ? `cart-${user.uid}` : null;

  useEffect(() => {
    if (loadingUser) return; 

    if (!user || !storageKey) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const storedCart = localStorage.getItem(storageKey);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        setCartItems(parsed);
      }
    } catch (err) {
      console.error("Kunde inte parsa cart:", err);
    }

    setLoading(false);
  }, [user, loadingUser, storageKey]);

  useEffect(() => {
    if (!storageKey || loadingUser) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Fel vid synkning av cart på route change:", err);
    }
  }, [pathname, storageKey, loadingUser]);

  useEffect(() => {
    if (!loading && user && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    }
  }, [cartItems, loading, user, storageKey]);

  useEffect(() => {
    if (!storageKey) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey) {
        try {
          const updatedCart = event.newValue ? JSON.parse(event.newValue) : [];
          setCartItems(updatedCart);
        } catch (error) {
          console.error("Fel vid synk av cart:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey]);

  const addToCart = useCallback((item: Deal, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const updated = existing
        ? prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        )
        : [...prev, { ...item, quantity }];
      if (user && storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user, storageKey]);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      if (user && storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user, storageKey]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (user && storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [user, storageKey]);

  const getTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotal,
    loading,
  };
}
