"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck2,
  Gift,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { currency, todayInChile } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
export default function CheckoutView() {
  const { items, subtotal, clearCart, deliveryInstructions } = useCart();
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comuna, setComuna] = useState("");
  const [notes, setNotes] = useState("");
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("07:30 - 08:30");
  const requestId = useRef<string | null>(null);
  useEffect(() => {
    if (items.length && !deliveryDate && items[0].deliveryDate) {
      setDeliveryDate(items[0].deliveryDate);
      setDeliverySlot(items[0].deliverySlot);
    }
  }, [items, deliveryDate]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!items.length) {
      setError("Primero agrega un regalo al carrito.");
      return;
    }
    if (!recipient.trim() || !phone.trim() || !address.trim() || !comuna.trim()) {
      setError("Completa los datos requeridos del destinatario y la dirección.");
      return;
    }
    if (!/^\+?[0-9\s-]{8,}$/.test(phone)) {
      setError("Ingresa un teléfono de contacto válido.");
      return;
    }
    if (!accept) {
      setError("Confirma que quieres registrar la solicitud de pedido.");
      return;
    }
    if (!deliveryDate) {
      setError("Selecciona una fecha de entrega.");
      return;
    }
    if (deliveryDate < todayInChile()) {
      setError("Selecciona una fecha de entrega válida.");
      return;
    }
    setBusy(true);
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) throw new Error("Inicia sesión en Mi cuenta antes de confirmar el pedido.");
      requestId.current ||= crypto.randomUUID();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          requestId: requestId.current,
          recipient: recipient.trim(), phone: phone.trim(), address: address.trim(), comuna: comuna.trim(),
          instructions: [deliveryInstructions, notes].filter(Boolean).join(" | "),
          deliveryDate, deliverySlot,
          items: items.map((item) => ({
            productId: Number(item.product.id),
            quantity: item.quantity,
            expectedUnitPrice: item.product.price + item.extraPrice,
            balloon: item.balloon ?? [4000, 10000].includes(item.extraPrice),
            treat: item.treat ?? [6000, 10000].includes(item.extraPrice),
            dedication: item.dedication,
          })),
        }),
      });
      const result = await response.json() as { detail?: string };
      if (!response.ok) throw new Error(result.detail || "No se pudo registrar el pedido.");
      clearCart();
      router.push("/mis-pedidos?creado=1");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo registrar el pedido.");
      setBusy(false);
    }
  }
  return (
    <div className="container checkout-page">
      <div className="breadcrumb">
        <Link href="/carrito">01 Carrito</Link> / <strong>02 Confirmación de pedido</strong>
      </div>
      <div className="checkout-grid">
        <div>
          <div className="checkout-intro">
            <h1 className="serif-title">Confirmación del pedido</h1>
            <p>
              Completa los datos de entrega para registrar tu pedido en el taller. El pago se coordina después; aquí no se cobran tarjetas.
            </p>
          </div>
          <form onSubmit={submit} className="checkout-form">
            <section className="form-section">
              <h2>
                <span>1</span> <UserRound size={19} /> Datos del destinatario
              </h2>
              <div className="form-grid">
                <label>
                  Nombre y apellido{" "}
                  <input
                    className="input"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Valeria Morales"
                  />
                </label>
                <label>
                  Teléfono de contacto{" "}
                  <input
                    className="input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                </label>
              </div>
            </section>
            <section className="form-section">
              <h2>
                <span>2</span> <MapPin size={19} /> Dirección de entrega
              </h2>
              <div className="form-grid">
                <label>
                  Calle y número{" "}
                  <input
                    className="input"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. Pocuro 2450"
                  />
                </label>
                <label>
                  Comuna o zona{" "}
                  <input
                    className="input"
                    required
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    placeholder="Providencia"
                  />
                </label>
              </div>
            </section>
            <section className="form-section">
              <h2>
                <span>3</span> <CalendarCheck2 size={19} /> Fecha y franja de entrega
              </h2>
              <p>Elige una fecha y una franja para todo el pedido. La disponibilidad se confirma en el taller.</p>
              <div className="form-grid">
                <label>Fecha de entrega
                  <input className="input" type="date" required min={todayInChile()}
                    value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
                </label>
                <label>Franja horaria
                  <select className="input" value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value)}>
                    <option value="07:30 - 08:30">07:30 - 08:30</option>
                    <option value="08:30 - 10:00">08:30 - 10:00</option>
                    <option value="10:00 - 11:30">10:00 - 11:30</option>
                  </select>
                </label>
              </div>
              <div className="pale-note">
                <Truck size={17} /> Entregas matutinas según disponibilidad.
              </div>
            </section>
            <section className="form-section">
              <h2>
                <span>4</span> <Gift size={19} /> Instrucciones especiales
              </h2>
              <label>
                Notas para la persona que realiza la entrega
                <textarea
                  className="input"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Dejar en conserjería..."
                />
              </label>
            </section>
            <section className="form-section">
              <h2>
                <span>5</span> <LockKeyhole size={19} /> Método de pago
              </h2>
              <div className="pale-note">
                <ShieldCheck size={19} />
                <p>
                  <strong>Pago pendiente</strong>
                  <br />
                  Tu pedido quedará registrado como pendiente. No se solicitan tarjetas ni se cobra dinero en esta pantalla.
                </p>
              </div>
              {/*<label className="consent">
                <input
                  type="checkbox"
                  checked={accept}
                  onChange={(e) => setAccept(e.target.checked)}
                />
                <span>
                  Confirmo que quiero registrar este pedido en el taller.
                </span>
              </label>*/} 
            </section>
            {/*{error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}*/}  
            <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
              <ShoppingBag size={18} /> {busy ? "Registrando..." : "Registrar pedido"}
            </button>
          </form>
        </div>
        <aside>
          <div className="summary-card sticky">
            <h2 className="serif-title">Resumen de Bandeja</h2>
            <div className="order-mini-items">
              {items.map((i) => (
                <div className="order-mini" key={i.lineId}>
                  <div className="mini-photo">
                    <Image src={i.product.image} alt="" fill sizes="70px" />
                  </div>
                  <div>
                    <strong>{i.product.name}</strong>
                    <small>Cant: {i.quantity}</small>
                  </div>
                  <b>{currency((i.product.price + i.extraPrice) * i.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{currency(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <strong>{currency(items.length ? 6000 : 0)}</strong>
            </div>
            <div className="summary-total">
              <span>Total estimado</span>
              <strong>{currency(subtotal + (items.length ? 6000 : 0))}</strong>
            </div>
            <div className="secure-notice">
              <ShieldCheck />
              <span>Pedido registrado en la base de datos. Pago pendiente de coordinación.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
