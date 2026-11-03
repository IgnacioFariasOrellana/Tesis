import { getAuthorizedData } from "@/lib/auth-api";
import { currency } from "@/lib/format";
import type { DatabasePayment } from "@/lib/db-types";

export default async function AdminPaymentsPage() {
  const payments = await getAuthorizedData<DatabasePayment[]>("/api/admin/payments");
  return <>
    <div className="dashboard-welcome"><div><div className="overline">TALLER CENTRAL</div><h1>Pagos</h1>
      <p>Pagos registrados en la base de datos. Los pedidos nuevos quedan pendientes hasta coordinar el pago.</p></div></div>
    <div className="metric-grid"><div className="metric-card"><span className="overline">PAGOS REGISTRADOS</span><strong>{payments.length}</strong></div>
      <div className="metric-card"><span className="overline">MONTO CONFIRMADO</span><strong>{currency(payments.filter((payment) => ["pagado", "aprobado", "completado"].includes((payment.status || "").toLowerCase())).reduce((sum, payment) => sum + payment.amount, 0))}</strong></div></div>
    <section className="dashboard-card no-padding">
      {payments.length === 0 ? <div className="empty-state"><h2>Aún no hay pagos registrados</h2><p>Cuando se registren pagos reales aparecerán aquí.</p></div> :
        <div className="table-scroll"><table className="data-table"><thead><tr><th>PEDIDO</th><th>MÉTODO</th><th>REFERENCIA</th><th>FECHA</th><th>ESTADO</th><th>MONTO</th></tr></thead>
          <tbody>{payments.map((payment) => <tr key={payment.id}><td>#{payment.orderNumber}</td><td>{payment.method || "—"}</td>
            <td>{payment.reference || "—"}</td><td>{payment.paidAt ? new Date(payment.paidAt).toLocaleString("es-CL") : "—"}</td>
            <td><span className="status-pill">{payment.status || "Sin estado"}</span></td><td>{currency(payment.amount)}</td>
          </tr>)}</tbody></table></div>}
      <div className="table-footer">{payments.length} pago(s) registrados</div>
    </section>
  </>;
}
