import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Gift,
  Package,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { getAuthorizedData } from "@/lib/auth-api";
import { currency } from "@/lib/format";
import type { AdminOverview } from "@/lib/db-types";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { OrderActivity } from "@/components/admin/OrderActivity";

export default async function AdminDashboard() {
  const { orders, payments, inventory, products } =
    await getAuthorizedData<AdminOverview>("/api/admin/overview");
  const pending = orders.filter(
    (order) => !["entregado", "cancelado"].includes(order.status.toLowerCase()),
  );
  const paid = payments.filter((payment) =>
    ["pagado", "aprobado", "completado"].includes((payment.status || "").toLowerCase()),
  );
  const paidAmount = paid.reduce((sum, payment) => sum + payment.amount, 0);
  const lowStock = inventory.filter((item) => item.stock_actual < item.stock_minimo);
  const deliveries = orders
    .filter((order) => order.deliveryDate)
    .sort((a, b) => String(a.deliveryDate).localeCompare(String(b.deliveryDate)))
    .slice(0, 4);
  const quick = [
    {
      Icon: Gift,
      title: "Productos",
      label: `${products.length} publicados`,
      href: "/admin/productos",
    },
    {
      Icon: Package,
      title: "Pedidos",
      label: `${orders.length} registrados`,
      href: "/admin/pedidos",
    },
    { Icon: Wallet, title: "Pagos", label: `${payments.length} registrados`, href: "/admin/pagos" },
    {
      Icon: Boxes,
      title: "Inventario",
      label: `${inventory.length} insumos`,
      href: "/admin/inventario",
    },
  ];
  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <div className="overline">RESUMEN DEL TALLER</div>
          <h1>Panel general</h1>
          <p>Una vista rápida de las ventas, pedidos y existencias registradas.</p>
        </div>
      </div>
      <div className="admin-metrics admin-metrics-four">
        <AdminMetricCard
          title="Pedidos en proceso"
          value={pending.length}
          description={`De ${orders.length} pedidos registrados.`}
          Icon={Package}
          progress={orders.length ? (pending.length / orders.length) * 100 : 0}
        />
        <AdminMetricCard
          title="Pagos confirmados"
          value={paid.length}
          description={`${currency(paidAmount)} recibidos.`}
          Icon={CircleDollarSign}
          progress={payments.length ? (paid.length / payments.length) * 100 : 0}
          tone="sage"
        />
        <AdminMetricCard
          title="Insumos bajo mínimo"
          value={lowStock.length}
          description={`De ${inventory.length} insumos activos.`}
          Icon={AlertTriangle}
          progress={inventory.length ? (lowStock.length / inventory.length) * 100 : 0}
          tone="amber"
        />
        <AdminMetricCard
          title="Productos publicados"
          value={products.length}
          description="Disponibles actualmente en la tienda."
          Icon={Gift}
          progress={products.length ? 100 : 0}
          tone="plum"
        />
      </div>
      <div className="admin-overview-grid">
        <section className="dashboard-card">
          <div className="admin-card-heading">
            <div>
              <span className="admin-section-label">ÚLTIMOS 7 DÍAS</span>
              <h2>Actividad de pedidos</h2>
            </div>
            <span className="admin-period">Esta semana</span>
          </div>
          <div className="admin-chart-summary">
            <strong>{orders.length}</strong>
            <span>pedidos totales registrados</span>
            <Package size={20} />
          </div>
          <OrderActivity orders={orders} />
        </section>
        <section className="dashboard-card admin-finance-card">
          <div className="admin-card-heading">
            <div>
              <span className="admin-section-label">RESUMEN</span>
              <h2>Pagos</h2>
            </div>
            <Wallet size={18} />
          </div>
          <span className="admin-money-label">Monto confirmado</span>
          <strong className="admin-money">
            {currency(paidAmount)} <small>CLP</small>
          </strong>
          <dl className="admin-summary-list">
            <div>
              <dt>Pagos registrados</dt>
              <dd>{payments.length}</dd>
            </div>
            <div>
              <dt>Confirmados</dt>
              <dd>{paid.length}</dd>
            </div>
            <div>
              <dt>Por revisar</dt>
              <dd>{Math.max(0, payments.length - paid.length)}</dd>
            </div>
          </dl>
          <Link className="text-link" href="/admin/pagos">
            Ver todos los pagos <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <div className="admin-shortcuts">
        {quick.map(({ Icon, title, label, href }) => (
          <Link href={href} key={title} className="admin-shortcut">
            <span className="admin-shortcut-icon">
              <Icon size={18} />
            </span>
            <div>
              <strong>{title}</strong>
              <small>{label}</small>
            </div>
            <ArrowRight size={15} />
          </Link>
        ))}
      </div>
      <div className="admin-overview-grid">
        <section className="dashboard-card no-padding">
          <div className="admin-table-heading">
            <div>
              <span className="admin-section-label">OPERACIÓN</span>
              <h2>Pedidos recientes</h2>
            </div>
            <span className="admin-count-badge">{orders.length}</span>
          </div>
          {orders.length === 0 ? (
            <div className="admin-empty">
              <span>
                <Package size={28} />
              </span>
              <h2>Aún no hay pedidos</h2>
              <p>Los pedidos de clientes aparecerán aquí.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PEDIDO</th>
                    <th>DESTINATARIO</th>
                    <th>ENTREGA</th>
                    <th>ESTADO</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.number}</strong>
                        <small>{order.items.map((item) => item.name).join(", ")}</small>
                      </td>
                      <td>{order.recipient || "Sin destinatario"}</td>
                      <td>{order.deliveryDate || "Sin fecha"}</td>
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
          <div className="table-footer">
            <Link className="text-link" href="/admin/pedidos">
              Ver todos los pedidos <ArrowRight size={15} />
            </Link>
          </div>
        </section>
        <div className="admin-overview-side">
          <section className="dashboard-card">
            <div className="admin-card-heading">
              <div>
                <span className="admin-section-label">INVENTARIO</span>
                <h2>Alertas de stock</h2>
              </div>
              <span className={`admin-count-badge ${lowStock.length ? "is-alert" : ""}`}>
                {lowStock.length}
              </span>
            </div>
            {lowStock.length ? (
              <ul className="admin-alert-list">
                {lowStock.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <AlertTriangle size={17} />
                    <div>
                      <strong>{item.nombre || `Insumo #${item.id}`}</strong>
                      <small>
                        {item.stock_actual} de {item.stock_minimo}{" "}
                        {item.unidad_medida || "unidades"}
                      </small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="admin-inline-empty">
                <Boxes size={23} />
                <p>Todos los insumos están sobre su mínimo.</p>
              </div>
            )}
          </section>
          <section className="dashboard-card">
            <div className="admin-card-heading">
              <div>
                <span className="admin-section-label">AGENDA</span>
                <h2>Próximas entregas</h2>
              </div>
              <CalendarDays size={18} />
            </div>
            {deliveries.length ? (
              <ul className="admin-agenda">
                {deliveries.map((order) => (
                  <li key={order.id}>
                    <span className="admin-agenda-day">{String(order.deliveryDate).slice(-2)}</span>
                    <div>
                      <strong>
                        #{order.number} · {order.recipient || "Cliente"}
                      </strong>
                      <small>{order.timeFrom?.slice(0, 5) || "Horario por coordinar"}</small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="admin-inline-empty">
                <Truck size={22} />
                <p>No hay entregas programadas.</p>
              </div>
            )}
          </section>
          <Link className="admin-shortcut" href="/admin/usuarios">
            <span className="admin-shortcut-icon">
              <Users size={18} />
            </span>
            <div>
              <strong>Usuarios y roles</strong>
              <small>Gestionar accesos</small>
            </div>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </>
  );
}
