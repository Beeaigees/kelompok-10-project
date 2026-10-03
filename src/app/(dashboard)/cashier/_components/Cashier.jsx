"use client";

import { ProductCard } from "./ProductCard";
import ItemModifier from "./ItemModifier";
import Ticket from "./Ticket";

export default function Cashier({ itemMinuman = [] }) {
  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      {/* Kolom kiri: grid produk + modifier */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 min-h-0">
        <ProductCard itemMinuman={itemMinuman} />
        <ItemModifier />
      </div>

      {/* Kolom kanan: ticket */}
      <div className="w-[340px] shrink-0 border-l border-border p-4">
        <Ticket ticketNumber="" tableInfo="" />
      </div>
    </div>
  );
}
