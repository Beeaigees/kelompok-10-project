"use client";

import { useSelection } from "./SelectionContext";
import { useCart } from "./CartContext";
import ItemModifier from "./item-modifier";
import Ticket from "./Ticket";

// Dummy data — nanti tinggal diganti sama data asli dari tim/API
const DUMMY_PRODUCTS = [
  { id: "flat-white", name: "Flat White (Oat/Dairy)", price: 5.25 },
  { id: "geisha-pourover", name: "Geisha Pour Over (Panama)", price: 9.5 },
  { id: "cardamom-pastry", name: "Cardamom Braid Pastry", price: 4.75 },
  { id: "cold-brew-nitro", name: "Cold Brew Nitro", price: 5.75 },
];

function DummyProductCard({ product }) {
  const { activeProduct, selectProduct, stagedExtras, resetSelection } = useSelection();
  const { addItem } = useCart();

  const isActive = activeProduct?.id === product.id;

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product, isActive ? stagedExtras : []);
    resetSelection();
  };

  return (
    <div
      onClick={() => selectProduct(product)}
      className={`cursor-pointer rounded-xl border-2 p-3 transition ${
        isActive ? "border-orange-500 bg-neutral-800" : "border-transparent bg-neutral-900"
      }`}
    >
      <p className="text-sm font-medium">{product.name}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-semibold">${product.price.toFixed(2)}</span>
        <button
          onClick={handleAdd}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function Cashier() {
  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      {/* Kolom kiri: grid produk + modifier */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {DUMMY_PRODUCTS.map((product) => (
            <DummyProductCard key={product.id} product={product} />
          ))}
        </div>

        <ItemModifier />
      </div>

      {/* Kolom kanan: ticket */}
      <div className="w-[340px] border-l border-neutral-800 p-4">
        <Ticket ticketNumber="108" tableInfo="Table 4 — Marcus T." />
      </div>
    </div>
  );
}