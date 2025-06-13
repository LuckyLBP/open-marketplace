"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation"; 
import { Deal } from "@/hooks/useDeals";

export interface CartItem extends Deal {
  quantity: number;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        setCartItems(parsed);
      } catch (err) {
        console.error("Kunde inte parsa cart:", err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Fel vid synkning av cart på route change:", err);
    }
  }, [pathname]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cart") {
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
  }, []);

  const addToCart = useCallback((item: Deal, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const updated = existing
        ? prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...prev, { ...item, quantity }];
      localStorage.setItem("cart", JSON.stringify(updated)); 
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem("cart", JSON.stringify(updated)); 
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem("cart"); 
  }, []);

  const getTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
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
