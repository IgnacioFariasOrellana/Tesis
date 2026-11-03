import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Truck } from "lucide-react";
import { getAuthorizedData } from "@/lib/auth-api";
import { currency } from "@/lib/format";
import type { DatabaseOrder } from "@/lib/db-types";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ creado?: string }> }) {
  const orders = await getAuthorizedData<DatabaseOrder[]>("/api/orders");
  const { creado } = await searchParams;
  return <div className="container orders-page">
    <div className="eyebrow">SEGUIMIENTO DE PEDIDOS</div>
    <h1 className="serif-title">Mis pedidos</h1>
    <p className="section-lead">Pedidos registrados con tu cuenta. El taller confirmará la disponibilidad y coordinará el pago.</p>
    {creado === "1" && <div className="pale-note"><Package size={18} /> Pedido registrado. Puedes revisar su estado aquí.</div>}
    {orders.length === 0 ? <div className="empty-state">
      <Package size={42} /><h2>Aún no tienes pedidos</h2>
      <p>Agrega un producto al carrito y registra tu pedido para verlo aquí.</p>
      <Link href="/catalogo" className="btn btn-primary">Ver catálogo <ArrowRight size={16} /></Link>
    </div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}>
      <div className="order-top"><div><strong>Pedido #{order.number}</strong> <span className="status-pill">{order.status}</span></div>
        <small>{new Date(order.createdAt).toLocaleString("es-CL")}</small></div>
      <div className="order-content"><div>
        <h3>Para: {order.recipient || "Sin destinatario"}</h3>
        <p>{order.address || "Dirección pendiente"}</p>
        {order.deliveryDate && <p><Truck size={15} /> Entrega: {order.deliveryDate} {order.timeFrom && ` · ${order.timeFrom.slice(0, 5)}–${order.timeTo?.slice(0, 5)}`}</p>}
        <p>{order.items.length} producto(s) · Total {currency(order.total)}</p>
        {order.instructions && <p><strong>Indicaciones:</strong> {order.instructions}</p>}
        {order.dedication && <p><strong>Dedicatoria:</strong> {order.dedication}</p>}
      </div><div className="order-timeline"><span className="done"><Package /> {order.status}</span>
        <small>El estado se actualiza cuando el taller registra un cambio.</small></div></div>
      <div className="ordered-items">{order.items.map((item, index) => <div key={`${order.id}-${index}`}>
        {item.image && <div className="mini-photo"><Image src={item.image} alt="" fill sizes="56px" /></div>}
        <span>{item.name} × {item.quantity}</span>
      </div>)}</div>
    </article>)}</div>}
  </div>;
}
