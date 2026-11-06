import { notFound } from "next/navigation";
import { getProducts } from "@/lib/product-api";
import { ProductDetailView } from "@/components/catalog/ProductDetailView";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const relatedProducts = products.filter((item) => item.id !== product.id).slice(0, 3);
  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
