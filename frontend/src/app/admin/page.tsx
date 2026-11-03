import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, Gift, Package, Truck, Users, Wallet } from "lucide-react";
import { getAuthorizedData } from "@/lib/auth-api";
import { getProducts } from "@/lib/product-api";
import { currency } from "@/lib/format";
import type { DatabaseOrder, DatabasePayment, InventoryItem } from "@/lib/db-types";

export default async function AdminPage() {
  const [orders, payments, inventory, products] = await Promise.all([
    getAuthorizedData<DatabaseOrder[]>("/api/admin/orders"),
    getAuthorizedData<DatabasePayment[]>("/api/admin/payments"),
    getAuthorizedData<InventoryItem[]>("/api/admin/inventory"),
    getProducts(),
  ]);
  const pending = orders.filter((order) => !["entregado", "cancelado"].includes(order.status.toLowerCase()));
  const paid = payments.filter((payment) => ["pagado", "aprobado", "completado"].includes((payment.status || "").toLowerCase()));
  const lowStock = inventory.filter((item) => item.stock_actual < item.stock_minimo);
  const quick = [
    { Icon: Gift, title: "Productos", label: `${products.length} publicados`, href: "/admin/productos" },
    { Icon: Package, title: "Pedidos", label: `${orders.length} registrados`, href: "/admin/pedidos" },
    { Icon: Wallet, title: "Pagos", label: `${payments.length} registrados`, href: "/admin/pagos" },
    { Icon: Boxes, title: "Inventario", label: `${inventory.length} insumos`, href: "/admin/inventario" },
    { Icon: Truck, title: "Reparto", label: "Rutas asignadas", href: "/admin/pedidos" },
    { Icon: Users, title: "Usuarios", label: "Gestionar roles", href: "/admin/usuarios" },
  ];

  return <>
    <div className="dashboard-welcome"><div>
      <div className="overline">TALLER CENTRAL</div>
      <h1>Panel de administración</h1>
      <p>Estado actual de pedidos, pagos, productos e insumos registrados en Supabase.</p>
    </div></div>
    <div className="metric-grid">
      <div className="metric-card"><div className="overline">PEDIDOS PENDIENTES</div><strong>{pending.length}</strong><span>De {orders.length} pedidos registrados</span></div>
      <div className="metric-card"><div className="overline">PAGOS CONFIRMADOS</div><strong>{currency(paid.reduce((sum, payment) => sum + payment.amount, 0))}</strong><span>{paid.length} pagos registrados como completados</span></div>
      <div className="metric-card"><div className="overline">INSUMOS BAJO MÍNIMO</div><strong>{lowStock.length}</strong><span>{inventory.length} insumos activos</span></div>
      <div className="metric-card"><div className="overline">PRODUCTOS PUBLICADOS</div><strong>{products.length}</strong><span>Disponibles en el catálogo</span></div>
    </div>
    <div className="section-between admin-subheading"><h2>Accesos rápidos</h2></div>
    <div className="quick-grid">{quick.map(({ Icon, title, label, href }) =>
      <Link href={href} key={title} className="quick-card"><Icon size={27} /><strong>{title}</strong><small>{label}</small></Link>
    )}</div>
    <div className="admin-lower">
      <section className="dashboard-card">
        <div className="section-between"><div><h2>Pedidos recientes</h2><p>Últimos pedidos registrados en la base de datos.</p></div></div>
        {orders.length === 0 ? <p>Aún no hay pedidos registrados.</p> : <div className="table-scroll"><table className="data-table">
          <thead><tr><th>PEDIDO</th><th>DESTINATARIO</th><th>FECHA DE ENTREGA</th><th>ESTADO</th><th>TOTAL</th></tr></thead>
          <tbody>{orders.slice(0, 5).map((order) => <tr key={order.id}>
            <td><strong>#{order.number}</strong><small>{order.items.map((item) => item.name).join(", ")}</small></td>
            <td>{order.recipient || "Sin destinatario"}</td>
            <td>{order.deliveryDate || "Sin fecha"}</td>
            <td><span className="status-pill">{order.status}</span></td>
            <td>{currency(order.total)}</td>
          </tr>)}</tbody>
        </table></div>}
        <Link className="text-link" href="/admin/pedidos">Ver todos los pedidos <ArrowRight size={16} /></Link>
      </section>
      <div className="admin-side-panels"><section className="dashboard-card">
        <div className="overline">ALERTAS DE INSUMOS</div><h3>Stock bajo</h3>
        {lowStock.length === 0 ? <p>No hay insumos bajo el mínimo.</p> : lowStock.slice(0, 5).map((item) =>
          <p key={item.id}><AlertTriangle size={16} /> {item.nombre || `Insumo #${item.id}`} · {item.stock_actual} de {item.stock_minimo} {item.unidad_medida || "unidades"}</p>
        )}
        <Link href="/admin/inventario" className="text-link">Ver inventario <ArrowRight size={16} /></Link>
      </section></div>
    </div>
  </>;
}
