"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function OrderTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!startedAt) {
      setElapsed("00:00");
      return;
    }

    function update() {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      const mins = String(Math.floor(diffSec / 60)).padStart(2, "0");
      const secs = String(diffSec % 60).padStart(2, "0");
      setElapsed(`${mins}:${secs}`);
    }

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground">
      <Clock className="size-3.5" />
      <span>{elapsed}</span>
    </div>
  );
}

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
    <div className="p-4 space-y-4">
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Belum ada antrean pesanan masuk.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="flex flex-col justify-between h-full min-h-[250px] border border-border bg-card shadow-xs transition-shadow hover:shadow-md"
          >
            {/* Header Card: Nomor Tiket & Nama Pelanggan */}
            <CardHeader className="flex flex-row items-center justify-between border-b pb-3 px-4 pt-4 space-y-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  #{order.ticket_number}
                </span>
                {order.status && (
                  <Badge
                    variant="outline"
                    className={
                      order.status === "PREPARING"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0 h-4 font-medium"
                        : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] px-1.5 py-0 h-4 font-medium"
                    }
                  >
                    {order.status}
                  </Badge>
                )}
              </div>
              <span
                className="text-sm font-semibold text-muted-foreground truncate max-w-[120px]"
                title={order.customer_name || "Tanpa Nama"}
              >
                {order.customer_name || "Tanpa Nama"}
              </span>
            </CardHeader>

            {/* Content Card: Daftar Item, Qty, Menu, Modifiers */}
            <CardContent className="flex-1 p-4 pt-3">
              <ul className="divide-y divide-border/40">
                {order.items?.map((item) => (
                  <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-sm text-primary shrink-0 min-w-[20px]">
                        {item.qty}x
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {item.product?.name}
                        </p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.modifiers
                              .map((m) => m.modifier_option?.label)
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-xs italic text-muted-foreground mt-0.5">
                            "{item.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>

            {/* Footer Card: Timer & Action Button */}
            <CardFooter className="flex items-center justify-between border-t p-3 bg-muted/30">
              <OrderTimer startedAt={order.started_at} />
              <div className="flex items-center gap-1.5">
                {order.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startPreparing(order.id)}
                    className="h-8 text-xs font-medium"
                  >
                    Mulai Masak
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => markReady(order.id)}
                  className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-xs"
                >
                  Tandai Selesai
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
