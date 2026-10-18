"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useSelection } from "./SelectionContext";

const PAGE_SIZE = 6;

export function ProductCard({ itemMinuman = [] }) {
  const { activeProduct, selectProduct } = useSelection();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(itemMinuman.length / PAGE_SIZE));
  // jaga-jaga kalau jumlah item berkurang dan page jadi melebihi totalPages
  const currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleItems = itemMinuman.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {visibleItems.map((drink) => {
          const isActive = activeProduct?.id === drink.id;

          return (
            <Card
              key={drink.id}
              onClick={() => selectProduct(drink)}
              className={`overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white rounded-2xl flex flex-col p-4 cursor-pointer ${
                isActive ? "ring-2 ring-[#b45309]" : ""
              }`}
            >
              <div className="w-full h-48 mb-4">
                <Image
                  src={drink.image_url}
                  alt={drink.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize">
                  {drink.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {drink.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col">
                  <span className="text-xl font-semibold text-gray-900 leading-none">
                    Rp {Number(drink.price).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-1">
                    REGULAR
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Kontrol pagination, cuma muncul kalau halamannya lebih dari 1 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft /> Prev
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}