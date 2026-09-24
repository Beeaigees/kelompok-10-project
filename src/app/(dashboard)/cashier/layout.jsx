"use client";

import { CartProvider } from "./_components/CartContext";
import { SelectionProvider } from "./_components/SelectionContext";

export default function CahsierLayout ({ children }) {
    return (
        <CartProvider>
            <SelectionProvider>{children}</SelectionProvider>
        </CartProvider>
    );
}