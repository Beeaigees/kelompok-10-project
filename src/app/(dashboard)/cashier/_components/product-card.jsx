import React from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const drinks = [
  { id: 1, name: "americano", desc: "Classic black coffee...", price: 25000, image: "/americano.jpeg" },
  { id: 2, name: "machiato", desc: "Espresso with a dash of milk...", price: 25000, image: "/machiato.jpeg" },
  { id: 3, name: "cappucino", desc: "Rich espresso with frothy milk...", price: 30000, image: "/cappucino.jpeg" },
  { id: 4, name: "latte", desc: "Smooth espresso with steamed milk...", price: 30000, image: "/latte.jpeg" },
  { id: 5, name: "matcha", desc: "Premium green tea latte...", price: 35000, image: "/matcha.jpeg" },
];

export function ProductCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {drinks.map((drink) => (
        <Card key={drink.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white rounded-2xl flex flex-col p-4">
          
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
            {/* Harga */}
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gray-900 leading-none">
                Rp {drink.price.toLocaleString('id-ID')}
              </span>
              {/* Tempat untuk sub-info jika ada (seperti ukuran cup) */}
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-1">
                REGULAR
              </span>
            </div>
            
            {/* Tombol Plus Kotak */}
            <Button className="h-12 w-12 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white flex items-center justify-center p-0 shadow-sm">
              <span className="text-3xl font-light mb-1">+</span>
            </Button>
          </div>
          
        </Card>
      ))}
    </div>
  );
}