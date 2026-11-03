import { CatalogClient } from "@/components/CatalogClient";
import { getProducts } from "@/lib/product-api";

export const metadata = { title: "Catálogo de detalles" };

export default async function CatalogPage() {
  const products = await getProducts();
  return <CatalogClient products={products} />;
}
