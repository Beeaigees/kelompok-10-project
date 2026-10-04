"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/orders?status=PENDING,PREPARING")
      .then((res) => res.json())
      .then((data) => setOrders(data));

    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [...prev, payload.new]);
          }
          if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? payload.new : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Fungsi aksi, taruh di sini, di dalam komponen ---
  async function startPreparing(orderId) {
    await fetch(`http://localhost:8000/api/orders/${orderId}/start?estimated_duration_sec=180`, {
      method: "PATCH",
    });
    // Gak perlu setOrders manual di sini — Supabase Realtime yang
    // bakal otomatis update state lewat subscription di atas.
  }

  async function markReady(orderId) {
    await fetch(`http://localhost:8000/api/orders/${orderId}/ready`, {
      method: "PATCH",
    });
  }

  useEffect(() => {
  fetch("http://localhost:8000/api/orders?status=PENDING,PREPARING")
    .then((res) => res.json())
    .then((data) => {
      console.log("Data dari FastAPI:", data); // tambahin ini
      setOrders(data);
    });
  // ...
  }, []);

  return (
    <div className="p-4 space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Ticket #{order.ticket_number}</span>
            <span className="text-xs text-muted-foreground">{order.status}</span>
          </div>

          <div className="mt-2 flex gap-2">
            {order.status === "PENDING" && (
              <button
                onClick={() => startPreparing(order.id)}
                className="rounded bg-orange-600 px-3 py-1 text-sm text-white"
              >
                Mulai Masak
              </button>
            )}
            {order.status === "PREPARING" && (
              <button
                onClick={() => markReady(order.id)}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white"
              >
                Tandai Selesai
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}