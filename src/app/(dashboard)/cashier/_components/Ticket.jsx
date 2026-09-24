"use client";

import { useCart } from "./CartContext";

export default function Ticket({ ticketNumber = "108", customerName = "" }) {
  const {
    items,
    updateQty,
    removeItem,
    itemLineTotal,
    subtotal,
    tax,
    total,
  } = useCart();

  return (
    <aside className="flex h-full w-[340px] flex-col rounded-xl bg-neutral-900 text-neutral-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 p-4">
        <div>
          <p className="text-lg font-semibold">Ticket #{ticketNumber}</p>
          {customerName && <p className="text-xs text-neutral-400">{customerName}</p>}
        </div>
        <span className="rounded-full bg-orange-500/20 px-2 py-1 text-xs text-orange-400">
          In Progress
        </span>
      </div>

      {/* List item */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {items.length === 0 && (
          <p className="text-sm text-neutral-500">Belum ada item di ticket.</p>
        )}

        {items.map((item) => (
          <div key={item.cartItemId} className="rounded-lg bg-neutral-800 p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                {item.extras.length > 0 && (
                  <p className="text-xs text-neutral-400">
                    {item.extras.map((e) => e.label).join(" · ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-xs italic text-neutral-500">"{item.note}"</p>
                )}
              </div>
              <p className="text-sm font-medium">
                ${itemLineTotal(item).toFixed(2)}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => updateQty(item.cartItemId, -1)}
                className="h-6 w-6 rounded bg-neutral-700 text-sm"
              >
                −
              </button>
              <span className="text-sm">{item.qty}</span>
              <button
                onClick={() => updateQty(item.cartItemId, 1)}
                className="h-6 w-6 rounded bg-neutral-700 text-sm"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.cartItemId)}
                className="ml-auto text-xs text-red-400 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-1 border-t border-neutral-800 p-4 text-sm">
        <div className="flex justify-between text-neutral-300">
          <span>Subtotal ({items.length} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-neutral-300">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-neutral-800 pt-2 text-base font-semibold">
          <span>Total Due</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button className="w-full rounded-lg bg-orange-500 py-3 font-semibold">
          Charge Terminal ${total.toFixed(2)}
        </button>
      </div>
    </aside>
  );
}