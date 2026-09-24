"use client";

import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

const TAX_RATE = 0.088; // 8.8% sesuai contoh di desain, sesuaikan / ambil dari config

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0); // contoh: staff perk 10%

  // Dipanggil dari card produk saat tombol "+" ditekan,
  // membawa extras yang sudah dipilih user di panel Extras
  const addItem = useCallback((product, selectedExtras = [], note = "") => {
    setItems((prev) => {
      // cek apakah sudah ada baris dengan produk + extras + note yang sama persis
      const existingIndex = prev.findIndex(
        (it) =>
          it.productId === product.id &&
          it.note === note &&
          JSON.stringify(it.extras) === JSON.stringify(selectedExtras)
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }

      return [
        ...prev,
        {
          cartItemId: crypto.randomUUID(),
          productId: product.id,
          name: product.name,
          basePrice: product.price,
          qty: 1,
          extras: selectedExtras,
          note,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((cartItemId, delta) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.cartItemId === cartItemId
            ? { ...it, qty: Math.max(0, it.qty + delta) }
            : it
        )
        .filter((it) => it.qty > 0)
    );
  }, []);

  const removeItem = useCallback((cartItemId) => {
    setItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // --- Kalkulasi turunan, dihitung ulang tiap render (cukup ringan untuk ukuran cart POS) ---
  const itemLineTotal = (item) => {
    const extrasTotal = item.extras.reduce((sum, e) => sum + (e.priceAdd || 0), 0);
    return (item.basePrice + extrasTotal) * item.qty;
  };

  const subtotal = items.reduce((sum, it) => sum + itemLineTotal(it), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    itemLineTotal,
    subtotal,
    tax,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam <CartProvider>");
  return ctx;
}