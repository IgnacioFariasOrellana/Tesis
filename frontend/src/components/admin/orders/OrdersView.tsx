import { getAuthorizedData } from "@/lib/auth-api";
import { currency } from "@/lib/format";
import type { DatabaseOrder } from "@/lib/db-types";
import { Clock3, PackageCheck } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";

export default async function OrdersView() {
  const orders = await getAuthorizedData<DatabaseOrder[]>("/api/admin/orders");
  const pending = orders.filter((order) => order.status.toLowerCase() === "pendiente");
  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <div className="overline">TALLER CENTRAL</div>
          <h1>Pedidos</h1>
          <p>Solicitudes registradas en la base de datos.</p>
        </div>
      </div>
      <div className="admin-metrics admin-metrics-two">
        <AdminMetricCard
          title="Pedidos registrados"
          value={orders.length}
          description="Solicitudes guardadas en la base de datos."
          Icon={PackageCheck}
          progress={orders.length ? 100 : 0}
        />
        <AdminMetricCard
          title="Pendientes"
          value={pending.length}
          description="Pedidos que aún necesitan preparación o coordinación."
          Icon={Clock3}
          progress={orders.length ? (pending.length / orders.length) * 100 : 0}
          tone="amber"
        />
      </div>
      <section className="dashboard-card no-padding">
        {orders.length === 0 ? (
          <div className="empty-state">
            <h2>Aún no hay pedidos</h2>
            <p>Los pedidos registrados por clientes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PEDIDO</th>
                  <th>DESTINATARIO</th>
                  <th>PRODUCTOS</th>
                  <th>ENTREGA</th>
                  <th>ESTADO</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.number}</strong>
                      <small>{new Date(order.createdAt).toLocaleString("es-CL")}</small>
                    </td>
                    <td>
                      {order.recipient || "—"}
                      <small>{order.address || "—"}</small>
                    </td>
                    <td>
                      {order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ") ||
                        "—"}
                    </td>
                    <td>
                      {order.deliveryDate || "—"}
                      <small>
                        {order.timeFrom?.slice(0, 5)}
                        {order.timeTo ? `–${order.timeTo.slice(0, 5)}` : ""}
                      </small>
                    </td>
                    <td>
                      <span className="status-pill">{order.status}</span>
                    </td>
                    <td>{currency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">{orders.length} pedido(s) registrados</div>
      </section>
    </>
  );
}
