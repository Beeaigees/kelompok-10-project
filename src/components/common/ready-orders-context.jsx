"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

const API = "http://localhost:8000/api";

const ReadyOrdersContext = createContext(null);

export function ReadyOrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders?status=READY`);
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error("Gagal memuat order READY:", err);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // Realtime cuma jadi "bel": ada perubahan di orders, ambil ulang daftar READY
    const channel = supabase
      .channel("ready-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadOrders]);

  const serveOrder = useCallback(
    async (orderId) => {
      // optimistic: langsung hilang dari daftar, badge ikut turun
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      const res = await fetch(`${API}/orders/${orderId}/serve`, {
        method: "PATCH",
      });
      if (!res.ok) loadOrders(); // gagal → sinkron ulang dari server
    },
    [loadOrders]
  );

  return (
    <ReadyOrdersContext.Provider
      value={{ orders, count: orders.length, serveOrder }}
    >
      {children}
    </ReadyOrdersContext.Provider>
  );
}

export function useReadyOrders() {
  const ctx = useContext(ReadyOrdersContext);
  if (!ctx)
    throw new Error("useReadyOrders harus dipakai di dalam <ReadyOrdersProvider>");
  return ctx;
}