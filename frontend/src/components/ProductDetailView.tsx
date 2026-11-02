"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Gift,
  Heart,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { currency } from "@/lib/format";
import { products } from "@/lib/products";
import { ProductCard } from "./ProductCard";
export function ProductDetailView({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("07:30 - 08:30");
  const [dedication, setDedication] = useState("");
  const [seal, setSeal] = useState("Magnolia floral");
  const [balloon, setBalloon] = useState(false);
  const [treat, setTreat] = useState(false);
  const extraPrice = (balloon ? 4000 : 0) + (treat ? 6000 : 0);
  return (
    <div className="container details-page">
      <div className="breadcrumb">
        <Link href="/catalogo">
          <ArrowLeft size={14} /> Catálogo
        </Link>{" "}
        / {product.category} / <span>{product.name}</span>
      </div>
      <div className="detail-grid">
        <div>
          <div className="detail-main-image">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
            />
            <span className="product-badge">✿ {product.badge}</span>
          </div>
          <div className="detail-note">
            <span className="icon-surface">
              <Gift size={23} />
            </span>
            <div>
              <strong>Elaboración 100% personalizada en taller</strong>
              <p>
                Cada regalo es armado a mano. Los artículos se preparan con atención a cada detalle.
              </p>
            </div>
          </div>
        </div>
        <div className="detail-config">
          <span className="soft-pill">
            ✿ Despacho matutino • Disponibilidad sujeta a confirmación
          </span>
          <h1>{product.name}</h1>
          <div className="detail-price">
            {currency(product.price)} <small>CLP</small>
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-contents">
            <div className="overline">Contenido minucioso del regalo</div>
            <span className="count-pill">{product.features.length} elementos</span>
            <ul>
              {product.features.map((f) => (
                <li key={f}>
                  <Check size={15} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="config-box">
            <h3>
              <CalendarDays size={17} /> 1. Fecha y Franja de Entrega
            </h3>
            <label className="field-label" htmlFor="delivery-date">
              Selecciona el día de tu sorpresa
            </label>
            <input
              className="input"
              type="date"
              id="delivery-date"
              min={new Date().toLocaleDateString("en-CA")}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="slot-grid">
              {["07:30 - 08:30", "08:30 - 10:00", "10:00 - 11:30"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`slot ${slot === s ? "selected" : ""}`}
                  onClick={() => setSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <small className="hint">La disponibilidad definitiva se valida en el taller.</small>
          </div>
          <div className="config-box">
            <h3>
              <Heart size={17} /> 2. Dedicatoria Caligrafiada
            </h3>
            <label className="field-label" htmlFor="dedication">
              Escribe tus palabras (opcional)
            </label>
            <textarea
              className="input"
              id="dedication"
              maxLength={280}
              rows={4}
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              placeholder="Escribe aquí un mensaje especial que acompañará tu regalo..."
            />
            <div className="between hint">
              <span>Tarjeta manuscrita incluida</span>
              <span>{dedication.length} / 280</span>
            </div>
            <div className="seal-group">
              {["Magnolia floral", "Oro girasol", "Violeta silvestre"].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSeal(s)}
                  className={`chip ${seal === s ? "selected" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="config-box">
            <h3>3. ¿Deseas enriquecer este detalle?</h3>
            <label className="add-on">
              <input
                type="checkbox"
                checked={balloon}
                onChange={(e) => setBalloon(e.target.checked)}
              />
              <span>
                Globo con helio satinado<small>Inflado con cinta de seda</small>
              </span>
              <b>+$4.000</b>
            </label>
            <label className="add-on">
              <input type="checkbox" checked={treat} onChange={(e) => setTreat(e.target.checked)} />
              <span>
                Mini tarta de cumpleaños<small>Sabor vainilla y frutos rojos</small>
              </span>
              <b>+$6.000</b>
            </label>
          </div>
          <div className="detail-total">
            <span>Total configurado</span>
            <strong>{currency(product.price + extraPrice)} CLP</strong>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={() => {
              addItem(product, { dedication, deliveryDate: date, deliverySlot: slot, extraPrice });
              router.push("/carrito");
            }}
          >
            <ShoppingBag size={18} /> Agregar al carrito de regalos <ArrowRight size={17} />
          </button>
          <p className="center-caption">
            <ShieldCheck size={14} /> Pedido de demostración • Sin cobros reales
          </p>
        </div>
      </div>
      <section className="related-products">
        <div className="section-between">
          <div>
            <div className="overline">COLECCIÓN MATINAL</div>
            <h2 className="serif-title">Otras creaciones que inspiran ternura</h2>
          </div>
          <Link className="text-link" href="/catalogo">
            Ver todo el catálogo <ArrowRight size={16} />
          </Link>
        </div>
        <div className="products-grid">
          {products
            .filter((p) => p.id !== product.id)
            .slice(0, 3)
            .map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
        </div>
      </section>
    </div>
  );
}
