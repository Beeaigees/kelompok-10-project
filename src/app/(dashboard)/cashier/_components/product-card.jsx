import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const drinks = [
  { id: 1, name: "americano", price: 25000, image: "/americano.jpeg" },
  { id: 2, name: "machiato", price: 25000, image: "/machiato.jpeg" },
  { id: 3, name: "cappucino", price: 30000, image: "/cappucino.jpeg" },
  { id: 4, name: "latte", price: 30000, image: "/latte.jpeg" },
  { id: 5, name: "matcha", price: 35000, image: "/matcha.jpeg" },
];

export function ProductCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {drinks.map((drink) => (
        <Card key={drink.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <CardHeader>
            {/* capitalize akan mengubah "americano" menjadi "Americano" otomatis */}
            <CardTitle className="capitalize text-xl font-bold">{drink.name}</CardTitle>
            {/* toLocaleString mengubah angka 25000 menjadi format uang 25.000 */}
            <CardDescription className="text-gray-600 font-medium">
              Rp {drink.price.toLocaleString('id-ID')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex justify-center p-4">
            <Image 
              src={drink.image} 
              alt={drink.name} 
              width={200} 
              height={200} 
              className="object-cover rounded-lg w-full h-48" 
            />
          </CardContent>
          
          <CardFooter>
            <Button className="w-full bg-[#b45309] hover:bg-[#92400e] text-white">
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}