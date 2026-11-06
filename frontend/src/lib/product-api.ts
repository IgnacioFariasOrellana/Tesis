import "server-only";
import type { Product } from "./types";

const apiUrl = process.env.API_URL || "http://localhost:8000";
const catalogRevalidateSeconds = 30;

type ProductQueryOptions = {
  fresh?: boolean;
};

function productFetchOptions(
  tag: string,
  { fresh = false }: ProductQueryOptions = {},
): RequestInit & { next?: { revalidate: number; tags: string[] } } {
  if (fresh) return { cache: "no-store" };
  return {
    next: {
      revalidate: catalogRevalidateSeconds,
      tags: ["catalog", tag],
    },
  };
}

export async function getProducts(options: ProductQueryOptions = {}): Promise<Product[]> {
  const response = await fetch(
    `${apiUrl}/api/products`,
    productFetchOptions("products", options),
  );
  if (!response.ok) throw new Error("No se pudo cargar el catálogo");
  return (await response.json()) as Product[];
}

export async function getProduct(
  slug: string,
  options: ProductQueryOptions = {},
): Promise<Product | null> {
  const response = await fetch(`${apiUrl}/api/products/${encodeURIComponent(slug)}`, {
    ...productFetchOptions(`product:${slug}`, options),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo cargar el producto");
  return (await response.json()) as Product;
}
