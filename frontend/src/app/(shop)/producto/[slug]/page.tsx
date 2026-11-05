import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/product-api";
import { ProductDetailView } from "@/components/catalog/ProductDetailView";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const relatedProducts = (await getProducts()).filter((p) => p.id !== product.id).slice(0, 3);
  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
