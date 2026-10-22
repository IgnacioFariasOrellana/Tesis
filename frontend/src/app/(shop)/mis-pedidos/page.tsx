"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Clock3, Package, PackageCheck, Truck } from "lucide-react";
import { DemoOrder } from "@/lib/types";
import { getOrders } from "@/lib/orders";
import { currency } from "@/lib/format";
export default function OrdersPage(){
 const [orders,setOrders]=useState<DemoOrder[]>([]);
 useEffect(()=>{setOrders(getOrders())},[]);
 return <div className="container orders-page"><div className="eyebrow">● SEGUIMIENTO DE TALLER • DEMOSTRACIÓN</div><h1 className="serif-title">Mis pedidos y sorpresas programadas</h1><p className="section-lead">Los pedidos creados en esta demostración están guardados solo en tu navegador. El seguimiento, el reparto y las fotografías reales no están integrados.</p>
 {orders.length===0?<div className="empty-state"><Package size={42}/><h2>Aún no tienes pedidos de demostración</h2><p>Agrega un producto al carrito y confirma un pedido para verlo aquí.</p><Link href="/catalogo" className="btn btn-primary">Ver catálogo <ArrowRight size={16}/></Link></div>:<div className="orders-list">{orders.map(o=><article className="order-card" key={o.id}><div className="order-top"><div>Pedido #{o.id} <span className="status-pill">● RECIBIDO (DEMO)</span></div><small>{new Date(o.createdAt).toLocaleString("es-CL")}</small></div><div className="order-content"><div><h3>Para: {o.recipient}</h3><p>{o.address}</p><p>{o.items.length} tipo(s) de obsequio · Total {currency(o.total)}</p>{o.instructions&&<p><strong>Indicaciones:</strong> {o.instructions}</p>}</div><div className="order-timeline"><span className="done"><Check/> Recibido</span><span><Clock3/> Preparación pendiente</span><span><Truck/> Entrega pendiente</span><span><PackageCheck/> Entregado</span></div></div><div className="ordered-items">{o.items.map(i=><div key={i.lineId}><div className="mini-photo"><Image src={i.product.image} alt="" fill sizes="56px"/></div><span>{i.product.name} × {i.quantity}</span></div>)}</div></article>)}</div>}
 </div>;
}
