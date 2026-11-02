"use client";
import { useState } from "react";
import {
  Camera,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Truck,
  AlertCircle,
} from "lucide-react";
const stops = [
  {
    time: "06:45",
    address: "Av. El Golf 40, Las Condes",
    client: "Conserjería Central",
    order: "AL-2041",
    item: "Box Desayuno Botánico",
  },
  {
    time: "07:15",
    address: "Jardín del Este 120, Vitacura",
    client: "Recepción del edificio",
    order: "AL-2044",
    item: "Bandeja Celebración",
  },
  {
    time: "07:45",
    address: "Pedro de Valdivia 890, Providencia",
    client: "Destinatario",
    order: "AL-2048",
    item: "Bandeja Campiña",
  },
  {
    time: "08:15",
    address: "Príncipe de Gales 1420, La Reina",
    client: "Andrés Edwards",
    order: "AL-2052",
    item: "Caja Sorpresa Noble Roble + Flores",
  },
  {
    time: "08:45",
    address: "Barrio Italia, Condell 1100, Ñuñoa",
    client: "Consuelo Martínez",
    order: "AL-2055",
    item: "Ramo Botánico Silvestre",
  },
  {
    time: "09:15",
    address: "Lastarria 240, Santiago Centro",
    client: "Carla Soto",
    order: "AL-2059",
    item: "Cofre de Orquídeas Blancas",
  },
  {
    time: "09:45",
    address: "Gran Avenida 4500, San Miguel",
    client: "Patricia Rojas",
    order: "AL-2061",
    item: "Pack Degustación",
  },
  {
    time: "10:15",
    address: "Av. La Florida 8200, La Florida",
    client: "Joaquín Díaz",
    order: "AL-2065",
    item: "Canasta Dulce",
  },
];
export default function DeliveryPage() {
  const [done, setDone] = useState<string[]>(["AL-2041", "AL-2044", "AL-2048"]);
  const [notice, setNotice] = useState("");
  const completed = done.length;
  const current = stops.find((s) => !done.includes(s.order));
  return (
    <>
      <div className="route-banner">
        <div>
          <div className="overline">🚚 EN RUTA ACTIVA · DEMOSTRACIÓN</div>
          <h1>Ruta asignada: Roberto Valenzuela</h1>
          <p>Vehículo y horario de ejemplo: 06:30 – 10:30 AM</p>
        </div>
        <div className="route-stats">
          <span>
            <strong>{completed} / 8</strong> Entregadas
          </span>
          <span>
            <strong>{8 - completed}</strong> Pendientes
          </span>
          <span>
            <strong>16 °C</strong> Clima ilustrativo
          </span>
        </div>
        <div className="progress">
          <i style={{ width: `${(completed / 8) * 100}%` }} />
        </div>
      </div>
      <div className="route-grid">
        <div>
          <div className="section-between">
            <div>
              <div className="overline">DESPACHO LOGÍSTICO</div>
              <h2>Orden sugerido de reparto</h2>
            </div>
            <span className="soft-pill">Ruta de ejemplo • Sin GPS</span>
          </div>
          <div className="stops-list">
            {stops.map((s, index) => {
              const finished = done.includes(s.order);
              const active = s.order === current?.order;
              return (
                <article key={s.order} className={`stop-card ${active ? "current" : ""}`}>
                  <div className={`stop-number ${finished ? "finished" : ""}`}>
                    {finished ? <Check size={18} /> : index + 1}
                  </div>
                  <div className="stop-info">
                    <div className="section-between">
                      <div className="stop-state">
                        {finished
                          ? "ENTREGA MARCADA"
                          : active
                            ? "PARADA ACTUAL"
                            : "SIGUIENTE ENTREGA"}{" "}
                        • {s.time} AM
                      </div>
                      <span className="code-badge">#{s.order}</span>
                    </div>
                    <h3>{s.address}</h3>
                    <p>
                      <MapPin size={14} />
                      {s.client}
                    </p>
                    <p>
                      <Truck size={14} />
                      {s.item}
                    </p>
                    {active && (
                      <div className="pale-note">
                        “Sorpresa. Si no responde en 2 minutos, contactar con conserjería.”
                      </div>
                    )}
                    {!finished && (
                      <div className="stop-actions">
                        <button
                          className="btn btn-outline btn-small"
                          onClick={() =>
                            setNotice(
                              "Carga de fotografía pendiente: se implementará con almacenamiento seguro.",
                            )
                          }
                        >
                          <Camera size={15} /> Subir foto
                        </button>
                        <button
                          className="btn btn-outline btn-small"
                          onClick={() =>
                            setNotice(
                              "Contacto telefónico simulado. Aún no hay integración de llamadas.",
                            )
                          }
                        >
                          <Phone size={15} /> Llamar
                        </button>
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => setDone((v) => [...v, s.order])}
                        >
                          <CheckCircle2 size={15} /> Entregado
                        </button>
                      </div>
                    )}
                    {finished && (
                      <div className="success-text">
                        <CheckCircle2 size={15} /> Registrado en esta sesión (no se envió al
                        servidor)
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <aside className="delivery-sidebar">
          <section className="dashboard-card">
            <div className="section-between">
              <h3>Geolocalización GPS</h3>
              <span className="status-pill">INACTIVO</span>
            </div>
            <div className="map-placeholder">
              <Navigation size={43} />
              <strong>Mapa de ruta pendiente</strong>
              <small>
                La ubicación en tiempo real requiere permisos, GPS, servicios de mapas y conexión
                con FastAPI.
              </small>
            </div>
            <div className="delivery-summary">
              <span>
                <strong>8</strong> paradas de muestra
              </span>
              <span>
                <strong>—</strong> ETA no disponible
              </span>
            </div>
          </section>
          <section className="dashboard-card">
            <h3>
              <Truck size={18} /> Compartir ubicación en vivo
            </h3>
            <p>
              La telemetría y la notificación al taller se implementarán en una etapa posterior.
            </p>
            <button
              className="btn btn-outline btn-full"
              onClick={() =>
                setNotice("El enlace de seguimiento estará disponible cuando se implemente el GPS.")
              }
            >
              Copiar enlace (próximamente)
            </button>
          </section>
          <section className="dashboard-card">
            <h3>
              <Clock size={18} /> Cámara fría furgón
            </h3>
            <p>Sin sensor conectado. Los valores reales no están disponibles.</p>
          </section>
        </aside>
      </div>
      {notice && (
        <div className="demo-notice">
          <AlertCircle size={18} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Cerrar">
            ×
          </button>
        </div>
      )}
    </>
  );
}
