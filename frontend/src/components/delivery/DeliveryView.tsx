import { CheckCircle2, MapPin, Package, Truck } from "lucide-react";
import { getAuthorizedData } from "@/lib/auth-api";
import type { DeliveryRoute } from "@/lib/db-types";

export default async function DeliveryView() {
  const routes = await getAuthorizedData<DeliveryRoute[]>("/api/delivery/routes");
  return <>
    <div className="route-banner"><div><div className="overline">REPARTO ASIGNADO</div>
      <h1>Mis rutas</h1><p>Entregas asignadas a tu cuenta desde el taller.</p></div>
      <div className="route-stats"><span><strong>{routes.length}</strong> rutas</span>
        <span><strong>{routes.reduce((total, route) => total + route.stops.length, 0)}</strong> paradas</span></div></div>
    {routes.length === 0 ? <div className="empty-state"><Truck size={42} /><h2>No tienes rutas asignadas</h2>
      <p>Cuando el taller te asigne una ruta aparecerá aquí.</p></div> : <div className="stops-list">
      {routes.map((route) => <section className="dashboard-card" key={route.id}>
        <div className="section-between"><div><div className="overline">RUTA #{route.id}</div>
          <h2>{route.date}</h2></div><span className="status-pill">{route.status || "Sin estado"}</span></div>
        {route.stops.length === 0 ? <p>Esta ruta aún no tiene despachos.</p> : route.stops.map((stop, index) =>
          <article className="stop-card" key={stop.id}><div className="stop-number">{stop.orderFinal ?? stop.orderSuggested ?? index + 1}</div>
            <div className="stop-info"><div className="section-between"><span className="stop-state">{stop.status || "Pendiente"}</span>
              <span className="code-badge">#{stop.order?.number || stop.id}</span></div>
              <h3>{stop.order?.address || "Dirección pendiente"}</h3>
              <p><MapPin size={14} /> {stop.order?.recipient || "Destinatario pendiente"}</p>
              <p><Package size={14} /> {stop.order?.items.map((item) => `${item.name} × ${item.quantity}`).join(", ") || "Pedido sin detalle"}</p>
              {stop.order?.phone && <p>Teléfono: {stop.order.phone}</p>}
              {stop.order?.deliveryDate && <p>Entrega: {stop.order.deliveryDate} · {stop.order.timeFrom?.slice(0, 5)}–{stop.order.timeTo?.slice(0, 5)}</p>}
              {stop.order?.instructions && <div className="pale-note">{stop.order.instructions}</div>}
              {stop.deliveredAt && <p className="success-text"><CheckCircle2 size={15} /> Entregado: {new Date(stop.deliveredAt).toLocaleString("es-CL")}</p>}
            </div></article>
        )}
      </section>)}
    </div>}
  </>;
}
