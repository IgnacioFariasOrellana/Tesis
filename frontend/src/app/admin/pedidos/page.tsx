import { getAuthorizedData } from "@/lib/auth-api";
import { currency } from "@/lib/format";
import type { DatabaseOrder } from "@/lib/db-types";

export default async function AdminOrdersPage() {
  const orders = await getAuthorizedData<DatabaseOrder[]>("/api/admin/orders");
  return <>
    <div className="dashboard-welcome"><div><div className="overline">TALLER CENTRAL</div><h1>Pedidos</h1>
      <p>Solicitudes registradas en la base de datos.</p></div></div>
    <div className="metric-grid"><div className="metric-card"><span className="overline">TOTAL REGISTRADO</span><strong>{orders.length}</strong></div>
      <div className="metric-card"><span className="overline">PENDIENTES</span><strong>{orders.filter((order) => order.status === "pendiente").length}</strong></div></div>
    <section className="dashboard-card no-padding">
      {orders.length === 0 ? <div className="empty-state"><h2>Aún no hay pedidos</h2><p>Los pedidos registrados por clientes aparecerán aquí.</p></div> :
        <div className="table-scroll"><table className="data-table"><thead><tr><th>PEDIDO</th><th>DESTINATARIO</th><th>PRODUCTOS</th><th>ENTREGA</th><th>ESTADO</th><th>TOTAL</th></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.id}>
            <td><strong>#{order.number}</strong><small>{new Date(order.createdAt).toLocaleString("es-CL")}</small></td>
            <td>{order.recipient || "—"}<small>{order.address || "—"}</small></td>
            <td>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ") || "—"}</td>
            <td>{order.deliveryDate || "—"}<small>{order.timeFrom?.slice(0, 5)}{order.timeTo ? `–${order.timeTo.slice(0, 5)}` : ""}</small></td>
            <td><span className="status-pill">{order.status}</span></td><td>{currency(order.total)}</td>
          </tr>)}</tbody></table></div>}
      <div className="table-footer">{orders.length} pedido(s) registrados</div>
    </section>
  </>;
}
