"use client";

import { createContext, useContext, useState, useCallback } from "react";

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [activeProduct, setActiveProduct] = useState(null); // produk yg lagi di-highlight
  const [stagedExtras, setStagedExtras] = useState([]); // extras yg lagi dipilih utk produk itu

  const selectProduct = useCallback((product) => {
    setActiveProduct(product);
    setStagedExtras([]); // reset extras tiap pindah produk
  }, []);

  const toggleExtra = useCallback((extra) => {
    setStagedExtras((prev) => {
      const exists = prev.find(
        (e) => e.group === extra.group && e.label === extra.label
      );
      if (exists) return prev.filter((e) => e !== exists);
      // kalau satu group cuma boleh 1 pilihan (misal Drink Size), replace bukan tambah
      const withoutSameGroup = prev.filter((e) => e.group !== extra.group);
      return [...withoutSameGroup, extra];
    });
  }, []);

  const resetSelection = useCallback(() => {
    setActiveProduct(null);
    setStagedExtras([]);
  }, []);

  return (
    <SelectionContext.Provider
      value={{ activeProduct, selectProduct, stagedExtras, toggleExtra, resetSelection }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection harus dipakai di dalam <SelectionProvider>");
  return ctx;
}