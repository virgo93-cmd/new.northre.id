"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  slug?: string;
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
  image_url?: string;
  selectedAttributes?: Record<string, string>;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load keranjang dari LocalStorage saat web pertama kali dibuka
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("northre_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Gagal load keranjang", e);
      }
    }
  }, []);

  // Simpan keranjang ke LocalStorage setiap ada perubahan
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("northre_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Cek apakah barang dengan varian yang sama persis sudah ada di keranjang
      const existingItemIndex = prev.findIndex(
        (i) => i.id === item.id && JSON.stringify(i.selectedAttributes) === JSON.stringify(item.selectedAttributes)
      );

      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += item.quantity;
        return newCart;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return; // Mencegah quantity jadi 0 atau minus
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const getPrice = (price: string | number) => {
    if (typeof price === "number") return price;
    return parseFloat(price.replace(/[^0-9.-]+/g, "")) || 0;
  };

  const subtotal = cart.reduce((total, item) => total + getPrice(item.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}