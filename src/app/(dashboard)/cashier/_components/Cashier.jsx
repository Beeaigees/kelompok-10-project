"use client";

import { ProductCard } from "./ProductCard"; // komponen asli dari tim
import ItemModifier from "./ItemModifier";
import Ticket from "./Ticket";

export default function Cashier() {
  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      {/* Kolom kiri: grid produk + modifier */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <ProductCard />
        <ItemModifier />
      </div>

      {/* Kolom kanan: ticket */}
      <div className="w-[340px] border-l border-neutral-800 p-4">
        <Ticket ticketNumber="108" tableInfo="Table 4 — Marcus T." />
      </div>
    </div>
  );
}