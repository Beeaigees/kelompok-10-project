"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await apiFetch("/orders?status=PENDING,PREPARING");
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error("Gagal memuat order kitchen:", err);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // Realtime hanya jadi "bel": ada perubahan di orders, ambil ulang daftarnya
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadOrders]);

  async function updateStatus(path, errorMessage) {
    try {
      const res = await apiFetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        console.error("PATCH gagal:", res.status, await res.text());
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || errorMessage);
    }
  }

  async function startPreparing(orderId) {
    await updateStatus(
      `/orders/${orderId}/start?estimated_duration_sec=180`,
      "Gagal memulai pesanan.",
    );
  }

  async function markReady(orderId) {
    await updateStatus(
      `/orders/${orderId}/ready`,
      "Gagal menandai pesanan siap.",
    );
  }

  return (
    <div className="space-y-3 p-4">
      {orders.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Belum ada pesanan masuk.
        </p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border border-border bg-card text-card-foreground p-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Ticket #{order.ticket_number}</span>
              {order.customer_name && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {order.customer_name}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {order.status}
            </span>
          </div>

          <ul className="mt-3 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="text-sm">
                <span className="font-medium">
                  {item.qty}× {item.product.name}
                </span>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {item.modifiers
                      .map((m) => m.modifier_option.label)
                      .join(" · ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-xs italic text-muted-foreground">
                    "{item.note}"
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex gap-2">
            {order.status === "PENDING" && (
              <button
                onClick={() => startPreparing(order.id)}
                className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground"
              >
                Mulai Masak
              </button>
            )}
            {order.status === "PREPARING" && (
              <button
                onClick={() => markReady(order.id)}
                className="rounded bg-green-700 px-3 py-1 text-sm text-white"
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
