"use client";

import { RotateCwClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useReadyOrders } from "@/components/common/ready-orders-context";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardRecall() {
  const { orders, count, serveOrder } = useReadyOrders();

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="secondary" className="relative" />}
      >
        <RotateCwClock /> Recall Ticket
        {count > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Recall Ticket</SheetTitle>
          <SheetDescription>
            Pesanan yang sudah selesai dan siap diserahkan ke customer.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {orders.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada pesanan yang siap disajikan.
            </p>
          )}

          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold leading-tight">
                    {order.customer_name || "Tanpa nama"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ticket #{order.ticket_number}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Selesai {formatTime(order.ready_at)}
                </span>
              </div>

              <ul className="mt-2 space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.qty}× {item.product.name}
                    {item.modifiers.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        ({item.modifiers
                          .map((m) => m.modifier_option.label)
                          .join(", ")})
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-3 w-full bg-green-600 text-white hover:bg-green-700"
                onClick={() => serveOrder(order.id)}
              >
                Served
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}