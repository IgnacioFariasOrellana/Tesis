"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Boxes, PackagePlus, Search, Truck } from "lucide-react";
const data = [
  {
    id: "MAT-PIN-01",
    name: "Cajas de Madera Pino Cepillado (25×25cm)",
    supplier: "Taller Carpintería San Lucas",
    category: "Cajas & Maderas",
    stock: 14,
    min: 25,
    unit: "unidades",
  },
  {
    id: "PAP-ALG-02",
    name: "Papel de Algodón Artesanal 300g",
    supplier: "Molino Papelero del Valle",
    category: "Papelería & Lacre",
    stock: 22,
    min: 40,
    unit: "pliegos",
  },
  {
    id: "CER-GRES-03",
    name: "Tazas de Cerámica Gres Esmaltadas",
    supplier: "Cerámicas Alfar de Niebla",
    category: "Cerámica & Vajilla",
    stock: 38,
    min: 15,
    unit: "unidades",
  },
  {
    id: "LAC-ROS-04",
    name: "Cera de Abeja y Lacre Rosa Pastel",
    supplier: "Apícola & Lacre Botánico",
    category: "Papelería & Lacre",
    stock: 12,
    min: 30,
    unit: "sellos",
  },
  {
    id: "CIN-SED-05",
    name: "Cinta de Seda y Rústica Teñida a Mano",
    supplier: "Tintórea Botánica Andina",
    category: "Cintas & Ramilletes",
    stock: 45,
    min: 20,
    unit: "metros",
  },
  {
    id: "PER-PAN-06",
    name: "Croissants y Hogazas Masa Madre",
    supplier: "Panadería Artesanal La Espiga",
    category: "Perecederos & Gourmet",
    stock: 18,
    min: 10,
    unit: "lotes frescos",
  },
];
export default function InventoryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [category, setCategory] = useState("Todas");
  const [notice, setNotice] = useState(false);
  const low = (i: (typeof data)[number]) => i.stock < i.min;
  const shown = useMemo(
    () =>
      data
        .filter(
          (i) =>
            i.name.toLowerCase().includes(query.toLowerCase()) ||
            i.id.toLowerCase().includes(query.toLowerCase()),
        )
        .filter((i) => category === "Todas" || i.category === category)
        .filter((i) => filter === "Todos" || (filter === "Bajo stock" ? low(i) : !low(i))),
    [query, filter, category],
  );
  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <div className="overline">● CONTROL DE INSUMOS · DEMOSTRACIÓN</div>
          <h1>Control de Insumos y Materias Primas del Taller</h1>
          <p>Supervisión de existencias y alertas, con registros ficticios.</p>
        </div>
        <button className="btn btn-outline" onClick={() => setNotice(true)}>
          <PackagePlus size={16} /> Registrar ingreso de stock
        </button>
      </div>
      <div className="metric-grid">
        <div className="metric-card">
          <span className="overline">INSUMOS REGISTRADOS</span>
          <strong>142</strong>
          <small>En 5 categorías (ejemplo)</small>
        </div>
        <div className="metric-card danger-card">
          <span className="overline">BAJO STOCK CRÍTICO</span>
          <strong>4 ítems</strong>
          <small>Impacta 9 regalos activos</small>
        </div>
        <div className="metric-card">
          <span className="overline">REPOSICIÓN EN CAMINO</span>
          <strong>3 envíos</strong>
          <small>Llegan mañana antes de 11h</small>
        </div>
        <div className="metric-card">
          <span className="overline">VALORIZACIÓN DE ALMACÉN</span>
          <strong>$8.420.500</strong>
          <small>Costo directo estimado</small>
        </div>
      </div>
      <section className="dashboard-card inventory-filter">
        <div className="inventory-filter-top">
          <label className="search-field">
            <Search size={19} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o código"
            />
          </label>
          <div className="chip-group">
            {["Todos", "Bajo stock", "Óptimo"].map((f) => (
              <button
                key={f}
                className={`chip ${filter === f ? "selected" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">CATEGORÍA:</span>
          <div className="chip-group">
            {["Todas", ...new Set(data.map((i) => i.category))].map((c) => (
              <button
                className={`chip ${category === c ? "selected" : ""}`}
                key={c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="dashboard-card no-padding">
        <div className="table-scroll">
          <table className="data-table inventory-table">
            <thead>
              <tr>
                <th>INSUMO & PROVEEDOR</th>
                <th>CATEGORÍA</th>
                <th>CANTIDAD DISPONIBLE</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="stock-name">
                      <span className="stock-icon">
                        <Boxes size={21} />
                      </span>
                      <div>
                        <strong>{i.name}</strong>
                        <small>
                          <span className="code-badge">{i.id}</span> {i.supplier}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="soft-pill">{i.category}</span>
                  </td>
                  <td>
                    <strong className={low(i) ? "danger-text" : "success-text"}>{i.stock}</strong>{" "}
                    <small>{i.unit}</small>
                    <div className="stock-progress">
                      <i
                        className={low(i) ? "low" : ""}
                        style={{ width: `${Math.min(100, (i.stock / i.min) * 45)}%` }}
                      />
                    </div>
                    <small>{Math.round((i.stock / i.min) * 100)}% del mínimo</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Mostrando {shown.length} de 6 registros de muestra · La cifra general de 142 es
          ilustrativa.
        </div>
      </section>
      <div className="inventory-bottom">
        <section className="dashboard-card">
          <div className="overline">✧ RECOMENDACIÓN DE REABASTECIMIENTO</div>
          <h2 className="serif-title">Sugerencia de orden agrupada</h2>
          <p>
            Existen materiales de ejemplo bajo el mínimo. Los proveedores y costos deben validarse
            en la implementación real.
          </p>
          <div className="restock-ideas">
            <span>50 cajas Pino 25×25</span>
            <span>100 sellos de lacre rosa</span>
          </div>
          <button className="btn btn-primary" onClick={() => setNotice(true)}>
            <Truck size={17} /> Generar orden (próximamente)
          </button>
        </section>
        <section className="dashboard-card">
          <div className="overline">SALUD OPERATIVA DE BODEGA</div>
          <h2 className="serif-title">Mermas & Rotación</h2>
          <p>
            Insumos en estado óptimo: <strong className="success-text">91%</strong>
          </p>
          <div className="progress green">
            <i style={{ width: "91%" }} />
          </div>
          <p>
            Tasa de merma mensual: <strong>1,8%</strong>
          </p>
          <div className="progress">
            <i style={{ width: "18%" }} />
          </div>
          <p>
            Tiempo medio de reposición: <strong>1,4 días hábiles</strong>
          </p>
          <Link href="/admin" className="text-link">
            Volver al panel <ArrowRight size={14} />
          </Link>
        </section>
      </div>
      {notice && (
        <div className="demo-notice">
          <AlertCircle size={18} /> Registro de stock y órdenes de compra aún no están conectados a
          una base de datos.{" "}
          <button onClick={() => setNotice(false)} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
    </>
  );
}
