import { getProducts } from "@/lib/product-api";
import { ProductAdminClient } from "@/components/ProductAdminClient";
import { getAuthorizedData } from "@/lib/auth-api";
import type { InventoryItem } from "@/lib/db-types";

export const metadata = { title: "Administrar productos" };

export default async function AdminProductsPage() {
  const [products, inventory] = await Promise.all([
    getProducts(),
    getAuthorizedData<InventoryItem[]>("/api/admin/inventory"),
  ]);
  return <ProductAdminClient products={products} initialInventory={inventory} />;
}
