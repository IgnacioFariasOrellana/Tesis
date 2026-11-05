import { getAuthorizedData } from "@/lib/auth-api";
import { currency } from "@/lib/format";
import type { DatabasePayment } from "@/lib/db-types";
import { BadgeCheck, WalletCards } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";

export default async function PaymentsView() {
  const payments = await getAuthorizedData<DatabasePayment[]>("/api/admin/payments");
  const confirmed = payments.filter((payment) =>
    ["pagado", "aprobado", "completado"].includes((payment.status || "").toLowerCase()),
  );
  const confirmedAmount = confirmed.reduce((sum, payment) => sum + payment.amount, 0);
  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <div className="overline">TALLER CENTRAL</div>
          <h1>Pagos</h1>
          <p>
            Pagos registrados en la base de datos. Los pedidos nuevos quedan pendientes hasta
            coordinar el pago.
          </p>
        </div>
      </div>
      <div className="admin-metrics admin-metrics-two">
        <AdminMetricCard
          title="Pagos registrados"
          value={payments.length}
          description="Operaciones asociadas a los pedidos."
          Icon={WalletCards}
          progress={payments.length ? 100 : 0}
          tone="plum"
        />
        <AdminMetricCard
          title="Pagos confirmados"
          value={confirmed.length}
          description={`${currency(confirmedAmount)} confirmados en total.`}
          Icon={BadgeCheck}
          progress={payments.length ? (confirmed.length / payments.length) * 100 : 0}
          tone="sage"
        />
      </div>
      <div className="admin-amount-strip">
        <span>
          <BadgeCheck size={19} /> Monto confirmado
        </span>
        <strong>
          {currency(confirmedAmount)} <small>CLP</small>
        </strong>
      </div>
      <section className="dashboard-card no-padding">
        {payments.length === 0 ? (
          <div className="empty-state">
            <h2>Aún no hay pagos registrados</h2>
            <p>Cuando se registren pagos reales aparecerán aquí.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PEDIDO</th>
                  <th>MÉTODO</th>
                  <th>REFERENCIA</th>
                  <th>FECHA</th>
                  <th>ESTADO</th>
                  <th>MONTO</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.orderNumber}</td>
                    <td>{payment.method || "—"}</td>
                    <td>{payment.reference || "—"}</td>
                    <td>
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleString("es-CL") : "—"}
                    </td>
                    <td>
                      <span className="status-pill">{payment.status || "Sin estado"}</span>
                    </td>
                    <td>{currency(payment.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">{payments.length} pago(s) registrados</div>
      </section>
    </>
  );
}
