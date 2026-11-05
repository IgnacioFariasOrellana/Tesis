"use client";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  ShieldCheck,
  Feather,
} from "lucide-react";
import { currency, dateLabel } from "@/lib/format";
import { useCart } from "@/context/cart-context";
export default function CartView() {
  const {
    items,
    count,
    subtotal,
    updateQuantity,
    removeItem,
    deliveryInstructions,
    setDeliveryInstructions,
  } = useCart();
  const shipping = count ? 6000 : 0;
  return (
    <div className="container cart-page">
      <div className="section-between">
        <div className="breadcrumb">
          <Link href="/catalogo">
            <ArrowLeft size={15} /> Catálogo
          </Link>{" "}
          / <strong>Bolsa de Obsequios</strong>
        </div>
        <span className="soft-pill">Reserva con 24 horas de anticipación</span>
      </div>
      <div className="page-intro">
        <h1 className="serif-title">
          Tu Carrito de Regalos y Sorpresas
        </h1>
        <p>
          Cada presente se organiza individualmente para garantizar 
          que llegue en perfectas condiciones y con la dedicación que merece.
        </p>
      </div>
      {items.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={45} />
          <h2>Tu carrito está esperando una sorpresa</h2>
          <p>Explora nuestras creaciones y elige tu primer regalo artesanal.</p>
          <Link href="/catalogo" className="btn btn-primary">
            Explorar catálogo <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div>
            <div className="cart-list">
              {items.map((line) => (
                <article className="cart-item" key={line.lineId}>
                  <Link href={`/producto/${line.product.slug}`} className="cart-photo">
                    <Image
                      src={line.product.image}
                      alt={line.product.name}
                      fill
                      sizes="(max-width: 700px) 40vw, 190px"
                    />
                  </Link>
                  <div className="cart-item-body">
                    <div className="cart-item-top">
                      <div>
                        <span className="overline">{line.product.category}</span>
                        <Link href={`/producto/${line.product.slug}`} className="cart-item-title">
                          {line.product.name}
                        </Link>
                        <p>
                          <Truck size={13} /> Entrega: {dateLabel(line.deliveryDate)} •{" "}
                          {line.deliverySlot}
                        </p>
                      </div>
                      <button
                        className="icon-button"
                        aria-label="Eliminar producto"
                        onClick={() => removeItem(line.lineId)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="dedication-preview">
                      <Feather size={18} />
                      <div>
                        <strong>Dedicatoria personalizada</strong>
                        <p>{line.dedication || "Sin mensaje por el momento"}</p>
                      </div>
                    </div>
                    <div className="cart-item-bottom">
                      <div className="quantity">
                        <span>Cantidad:</span>
                        <button
                          onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                          aria-label="Quitar una unidad"
                        >
                          <Minus size={14} />
                        </button>
                        <strong>{line.quantity}</strong>
                        <button
                          onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                          aria-label="Agregar una unidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="item-price">
                        <small>Precio unidad {line.extraPrice > 0 ? "con extras" : ""}</small>
                        <strong>{currency(line.product.price + line.extraPrice)}</strong>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-extras">
              <label htmlFor="cart-instructions">
                <strong>Instrucciones especiales para el conserje o timbre</strong>
                <p>¿Requiere entrega silenciosa o llamada telefónica antes?</p>
              </label>
              <textarea
                id="cart-instructions"
                className="input"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="Ej: Tocar timbre departamento 402, no llamar al interfono..."
                rows={2}
              />
            </div>
          </div>
          <aside>
            <div className="summary-card">
              <h2 className="serif-title">Resumen de Compra</h2>
              <div className="summary-row">
                <span>Subtotal productos ({count})</span>
                <strong>{currency(subtotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Despacho Matutino</span>
                <strong>{currency(shipping)}</strong>
              </div>
              <div className="summary-row">
                <span>Empaque de autor & Caligrafía</span>
                <strong className="success-text">Incluido</strong>
              </div>
              <div className="summary-total">
                <span>Total estimado</span>
                <strong>{currency(subtotal + shipping)}</strong>
              </div>
              <div className="secure-notice">
                <ShieldCheck />
                <div>
                  <strong>Pedido sujeto a confirmación</strong>
                  <p>
                    El carrito se conserva en este navegador. Al confirmar, el pedido se registra
                    en tu cuenta. El pago se coordina con el taller.
                  </p>
                </div>
              </div>
              <Link href="/checkout" className="btn btn-primary btn-full">
                Continuar pedido <ArrowRight size={17} />
              </Link>
              <Link href="/catalogo" className="back-link">
                Seguir explorando el catálogo
              </Link>
              <div className="summary-perks">
                <span>♢ Pagos seguros*</span>
                <span>✿ Frescura</span>
                <span>▣ Foto de entrega*</span>
              </div>
            </div>
            <p className="summary-disclaimer">* Funciones sujetas a integración futura.</p>
          </aside>
        </div>
      )}
      <div className="commitment-banner">
        <div>
          <span className="overline">NUESTRO COMPROMISO</span>
          <h2 className="serif-title">¿Cómo aseguramos que tu regalo sea inolvidable?</h2>
          <p>
            Preparamos los detalles cuidadosamente para las rutas matinales. La experiencia de
            despacho se validará en las próximas etapas.
          </p>
        </div>
        <div className="commitment-stats">
          <span>
            <Gift /> Empaque artesanal
          </span>
          <span>
            <Truck /> Entrega programada
          </span>
        </div>
      </div>
    </div>
  );
}
