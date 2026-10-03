"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelection } from "./SelectionContext";
import { useCart } from "./CartContext";



export function ProductCard({ itemMinuman }) {
  const { activeProduct, selectProduct, stagedExtras, resetSelection } =
    useSelection();
  const { addItem } = useCart();

  const handleAdd = (e, drink) => {
    e.stopPropagation(); // biar klik + gak ke-anggap klik card juga
    const isActive = activeProduct?.id === drink.id;
    addItem(drink, isActive ? stagedExtras : []);
    resetSelection();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {itemMinuman.map((drink) => {
        const isActive = activeProduct?.id === drink.id;

        return (
          <Card
            key={drink.id}
            onClick={() => selectProduct(drink)}
            className={`overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white rounded-2xl flex flex-col p-4 cursor-pointer ${
              isActive ? "ring-2 ring-[#b45309]" : ""
            }`}
          >
            {/* 1. Bagian Gambar (Paling Atas) */}
            <div className="w-full h-48 mb-4">
              <Image
                src={drink.image}
                alt={drink.name}
                width={400}
                height={300}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* 2. Bagian Konten (Judul & Deskripsi) */}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize">
                {drink.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {drink.desc}
              </p>
            </div>

            {/* 3. Bagian Footer (Harga di Kiri, Tombol Plus di Kanan) */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-gray-900 leading-none">
                  Rp {drink.price.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-1">
                  REGULAR
                </span>
              </div>

              <Button
                onClick={(e) => handleAdd(e, drink)}
                className="h-12 w-12 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white flex items-center justify-center p-0 shadow-sm"
              >
                <span className="text-3xl font-light mb-1">+</span>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
