import react from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const drinks = [
    { id: 1, name: "ice americano", price: 25000, image: "/americano.jpeg" },
    { id: 2, name: "hot americano", price: 25000, image: "/americano.jpeg" },
    { id: 3, name: "cappucino", price: 30000, image: "/americano.jpeg" },
    { id: 4, name: "latte", price: 30000, image: "/americano.jpeg" },
    { id: 5, name: "matcha", price: 35000, image: "/americano.jpeg" },
]

export function ProductCard() {
    <div className={"grid grid-cols-3 gap-4"}>
        {drinks.map(drink => (
            <Card key={drink.id}>
                <CardHeader>
                    <CardTitle>{drink.name}</CardTitle>
                    <CardDescription>{drink.price}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Image src={drink.image} alt={drink.name} width={200} height={200} />
                </CardContent>
                <CardFooter>
                    <Button>Add to Cart</Button>
                </CardFooter>
            </Card>
        ))}

    </div>
}