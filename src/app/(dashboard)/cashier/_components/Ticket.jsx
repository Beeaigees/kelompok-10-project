"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSelection } from "./SelectionContext";
import { useCart } from "./CartContext";

function formatRupiah(value) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

export default function Ticket({
  ticketNumber,
  customerName,
  onCustomerNameChange,
}) {
  const {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart, // <-- DITAMBAHKAN
    itemLineTotal,
    subtotal,
    tax,
    total,
  } = useCart();

  const { activeProduct, stagedExtras, resetSelection } = useSelection();

  const [submitting, setSubmitting] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);
  const [nameError, setNameError] = useState(false);

  const isNameEmpty = customerName.trim() === "";

  const handleAddItem = () => {
    if (!activeProduct) return;
    addItem(activeProduct, stagedExtras);
    resetSelection();
  };

  const handleCharge = async () => {
    if (items.length === 0 || submitting) return;

    if (isNameEmpty) {
      setNameError(true);
      return;
    }
    setSubmitting(true);

    try {
      const res = await apiFetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          subtotal: Math.round(subtotal),
          tax: Math.round(tax),
          total: Math.round(total),
          items: items.map((it) => ({
            product_id: it.productId,
            qty: it.qty,
            note: it.note || null,
            modifiers: it.extras.map((e) => ({
              modifier_option_id: e.optionId,
            })),
          })),
        }),
      });

      if (!res.ok) {
        console.error("POST /orders gagal:", res.status, await res.text());
        throw new Error("Gagal mengirim pesanan ke kitchen.");
      }

      const order = await res.json();
      setLastTicket(order.ticket_number);
      clearCart();
      onCustomerNameChange("");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal mengirim pesanan ke kitchen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="flex h-full flex-col rounded-xl bg-card text-card-foreground">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            {ticketNumber ? `Ticket #${ticketNumber}` : "Ticket baru"}
          </p>
          <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
            In Progress
          </span>
        </div>

        <input
          type="text"
          value={customerName}
          onChange={(e) => {
            onCustomerNameChange(e.target.value);
            if (nameError) setNameError(false);
          }}
          placeholder="Nama pelanggan"
          aria-invalid={nameError}
          className={`mt-2 w-full rounded-md border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
            nameError
              ? "border-destructive focus:ring-destructive"
              : "border-border focus:ring-primary"
          }`}
        />
        {nameError && (
          <p className="mt-1 text-xs text-destructive">
            Nama pelanggan wajib diisi.
          </p>
        )}
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
                    "{item.note}"
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
                className="ml-auto text-xs text-destructive hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Item yang sedang dipilih + tombol Add Item */}
      <div className="border-t border-border p-4">
        {activeProduct ? (
          <div className="mb-2 text-sm">
            <p className="font-medium">{activeProduct.name}</p>
            <p className="text-xs text-muted-foreground">
              {stagedExtras.length > 0
                ? stagedExtras.map((e) => e.label).join(" · ")
                : "Tanpa extras"}
            </p>
          </div>
        ) : (
          <p className="mb-2 text-sm text-muted-foreground">
            Pilih minuman dulu dari daftar menu.
          </p>
        )}

        <button
          onClick={handleAddItem}
          disabled={!activeProduct}
          className={`w-full rounded-lg border py-2 font-semibold transition ${
            activeProduct
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
              : "cursor-not-allowed border-border text-muted-foreground"
          }`}
        >
          Add Item
        </button>
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

      {/* Tombol Charge */}
      <div className="p-4 pt-0">
        {lastTicket && (
          <p className="mb-2 text-center text-sm text-green-600">
            Ticket #{lastTicket} terkirim ke kitchen
          </p>
        )}
        <button
          onClick={handleCharge}
          disabled={items.length === 0 || submitting || isNameEmpty}
          className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Mengirim..."
            : `Charge Terminal ${formatRupiah(total)}`}
        </button>
      </div>
    </aside>
  );
}
