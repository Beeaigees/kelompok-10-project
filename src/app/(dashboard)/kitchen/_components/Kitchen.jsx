"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const API = "http://localhost:8000/api";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const loadOrders = useCallback(async () => {
    const res = await fetch(`${API}/orders?status=PENDING,PREPARING`);
    if (res.ok) setOrders(await res.json());
  }, []);

  useEffect(() => {
    loadOrders();

    // Realtime hanya jadi "bel": ada perubahan di orders, ambil ulang daftarnya
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadOrders]);

  async function startPreparing(orderId) {
    await fetch(`${API}/orders/${orderId}/start?estimated_duration_sec=180`, {
      method: "PATCH",
    });
  }

  async function markReady(orderId) {
    await fetch(`${API}/orders/${orderId}/ready`, { method: "PATCH" });
  }

  return (
    <div className="space-y-3 p-4">
      {orders.length === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada pesanan masuk.</p>
      )}

      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Ticket #{order.ticket_number}</span>
              {order.customer_name && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {order.customer_name}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{order.status}</span>
          </div>

          <ul className="mt-3 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="text-sm">
                <span className="font-medium">
                  {item.qty}× {item.product.name}
                </span>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {item.modifiers.map((m) => m.modifier_option.label).join(" · ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-xs italic text-muted-foreground">"{item.note}"</p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex gap-2">
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