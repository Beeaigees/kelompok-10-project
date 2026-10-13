"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import ItemModifier from "./ItemModifier";
import Ticket from "./Ticket";

export default function Cashier({ itemMinuman = [] }) {
  const [customerName, setCustomerName] = useState("");

  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 min-h-0">
        <ProductCard itemMinuman={itemMinuman} />
        <ItemModifier />
      </div>

      <div className="w-[340px] shrink-0 border-l border-border p-4">
        <Ticket
          ticketNumber={null}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
        />
      </div>
    </div>
  );
}