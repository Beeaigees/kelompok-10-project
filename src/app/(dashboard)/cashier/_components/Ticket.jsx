"use client";

import { useCart } from "./CartContext";

function formatRupiah(value) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

export default function Ticket({ ticketNumber = "108", tableInfo = "" }) {
  const { items, updateQty, removeItem, itemLineTotal, subtotal, tax, total } =
    useCart();

  return (
    <aside className="flex h-full flex-col rounded-xl bg-card text-card-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <p className="text-lg font-semibold">Ticket #{ticketNumber}</p>
          {tableInfo && (
            <p className="text-xs text-muted-foreground">{tableInfo}</p>
          )}
        </div>
      </div>

      {/* List item */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 min-h-0">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Belum ada item di ticket.
          </p>
        )}

        {items.map((item) => (
          <div key={item.cartItemId} className="rounded-lg bg-muted p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                {item.extras.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {item.extras.map((e) => e.label).join(" · ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-xs italic text-muted-foreground">
                    " {item.note} "
                  </p>
                )}
              </div>
              <p className="text-sm font-medium">
                {formatRupiah(itemLineTotal(item))}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => updateQty(item.cartItemId, -1)}
                className="h-6 w-6 rounded bg-background text-sm"
              >
                −
              </button>
              <span className="text-sm">{item.qty}</span>
              <button
                onClick={() => updateQty(item.cartItemId, 1)}
                className="h-6 w-6 rounded bg-background text-sm"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.cartItemId)}
                className="ml-auto text-xs text-red-500 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-1 border-t border-border p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({items.length} items)</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>{formatRupiah(tax)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
          <span>Total Due</span>
          <span>{formatRupiah(total)}</span>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button className="w-full rounded-lg bg-[#b45309] py-3 font-semibold text-white hover:bg-[#92400e]">
          Charge Terminal {formatRupiah(total)}
        </button>
      </div>
    </aside>
  );
}
