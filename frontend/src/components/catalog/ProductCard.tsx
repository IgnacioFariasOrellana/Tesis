import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Zap } from "lucide-react";
import type { Product } from "@/lib/types";
import { currency } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <Link href={`/producto/${product.slug}`} aria-label={`Ver ${product.name}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 29vw"
          />
        </Link>
        <span className="product-badge">{product.badge}</span>
        <FavoriteButton />
      </div>
      <div className="product-info">
        <div className="product-topline">
          <span>{product.category}</span>
          <span className="availability">
            {product.availableToday ? (
              <>
                <Zap size={12} /> Hoy mismo
              </>
            ) : (
              "Mañana temprano"
            )}
          </span>
        </div>
        <Link href={`/producto/${product.slug}`} className="product-title">
          {product.name}
        </Link>
        <p>{product.description}</p>
        <div className="product-bottom">
          <div>
            <small>Precio taller</small>
            <strong>{currency(product.price)}</strong>
          </div>
          <Link href={`/producto/${product.slug}`} className="btn btn-primary btn-small">
            <Eye size={14} /> Ver producto <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
