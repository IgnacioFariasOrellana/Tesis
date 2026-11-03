import { getProducts } from "@/lib/product-api";
import { ProductAdminClient } from "@/components/ProductAdminClient";

export const metadata = { title: "Administrar productos" };

export default async function AdminProductsPage() {
  const products = await getProducts();
  return <ProductAdminClient products={products} />;
}
