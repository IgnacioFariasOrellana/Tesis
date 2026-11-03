import "server-only";
import type { Product } from "./types";

const apiUrl = process.env.API_URL || "http://localhost:8000";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${apiUrl}/api/products`, { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo cargar el catálogo");
  return (await response.json()) as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const response = await fetch(`${apiUrl}/api/products/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo cargar el producto");
  return (await response.json()) as Product;
}
