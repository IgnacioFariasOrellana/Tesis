"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { CartItem, Product } from "@/lib/types";

type AddOptions = {
  dedication?: string;
  deliveryDate?: string;
  deliverySlot?: string;
  extraPrice?: number;
};
type CartContextType = {
  items: CartItem[];
  deliveryInstructions: string;
  setDeliveryInstructions: (instructions: string) => void;
  count: number;
  subtotal: number;
  addItem: (product: Product, options?: AddOptions) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
};
const CartContext = createContext<CartContextType | null>(null);
const KEY = "allicam-demo-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      const savedInstructions = localStorage.getItem("allicam-demo-instructions-v1");
      if (savedInstructions) setDeliveryInstructions(savedInstructions);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* Almacenamiento bloqueado o datos anteriores inválidos */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
        localStorage.setItem("allicam-demo-instructions-v1", deliveryInstructions);
      } catch {
        /* demo usable sin almacenamiento */
      }
  }, [items, deliveryInstructions, hydrated]);
  const value = useMemo<CartContextType>(
    () => ({
      items,
      deliveryInstructions,
      setDeliveryInstructions,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + (i.product.price + i.extraPrice) * i.quantity, 0),
      addItem: (product, options = {}) =>
        setItems((current) => [
          ...current,
          {
            lineId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            product,
            quantity: 1,
            dedication: options.dedication || "",
            deliveryDate: options.deliveryDate || "",
            deliverySlot: options.deliverySlot || "07:30 - 08:30",
            extraPrice: options.extraPrice || 0,
          },
        ]),
      updateQuantity: (id, qty) =>
        setItems((current) =>
          current.map((line) =>
            line.lineId === id ? { ...line, quantity: Math.min(20, Math.max(1, qty)) } : line,
          ),
        ),
      removeItem: (id) => setItems((current) => current.filter((line) => line.lineId !== id)),
      clearCart: () => {
        setItems([]);
        setDeliveryInstructions("");
      },
    }),
    [items, deliveryInstructions],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart requiere CartProvider");
  return ctx;
}
