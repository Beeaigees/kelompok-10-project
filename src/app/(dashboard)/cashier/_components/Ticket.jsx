"use client";

import { useSelection } from "./SelectionContext";
import { useCart } from "./CartContext";

function formatRupiah(value) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

export default function Ticket({ ticketNumber, customerName, onCustomerNameChange }) {
  const {
    items,
    addItem,
    updateQty,
    removeItem,
    itemLineTotal,
    subtotal,
    tax,
    total,
  } = useCart();

  const {
    activeProduct,
    stagedExtras,
    resetSelection
  } = useSelection();

  const handleAddItem = () => {
    if (!activeProduct) return;
    addItem(activeProduct, stagedExtras);
    resetSelection();
  }

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
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Nama pelanggan"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* List item */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 min-h-0">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada item di ticket.</p>
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
                  <p className="text-xs italic text-muted-foreground">"{item.note}"</p>
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

      <div className="p-4 pt-0">
        <button className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary-hover">
          Charge Terminal {formatRupiah(total)}
        </button>
      </div>
    </aside>
  );
}