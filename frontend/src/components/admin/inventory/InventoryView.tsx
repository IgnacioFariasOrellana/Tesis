import Link from "next/link";
import { ArrowRight, Boxes, PackageCheck, TriangleAlert } from "lucide-react";
import { getAuthorizedData } from "@/lib/auth-api";
import type { InventoryItem } from "@/lib/db-types";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";

export default async function InventoryView() {
  const inventory = await getAuthorizedData<InventoryItem[]>("/api/admin/inventory");
  const low = inventory.filter((item) => item.stock_actual < item.stock_minimo);
  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <div className="overline">CONTROL DE INSUMOS</div>
          <h1>Inventario del taller</h1>
          <p>Existencias registradas en Supabase.</p>
        </div>
      </div>
      <div className="admin-metrics admin-metrics-two">
        <AdminMetricCard
          title="Insumos activos"
          value={inventory.length}
          description="Materiales disponibles para elaborar productos."
          Icon={PackageCheck}
          progress={inventory.length ? 100 : 0}
          tone="sage"
        />
        <AdminMetricCard
          title="Bajo mínimo"
          value={low.length}
          description="Insumos que requieren reposición de existencias."
          Icon={TriangleAlert}
          progress={inventory.length ? (low.length / inventory.length) * 100 : 0}
          tone="amber"
        />
      </div>
      <section className="dashboard-card no-padding">
        {inventory.length === 0 ? (
          <div className="empty-state">
            <Boxes size={42} />
            <h2>Aún no hay insumos registrados</h2>
            <p>Cuando se agreguen insumos a la base de datos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table inventory-table">
              <thead>
                <tr>
                  <th>INSUMO</th>
                  <th>STOCK ACTUAL</th>
                  <th>STOCK MÍNIMO</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="stock-name">
                        <span className="stock-icon">
                          <Boxes size={21} />
                        </span>
                        <div>
                          <strong>{item.nombre || `Insumo #${item.id}`}</strong>
                          <small>
                            <span className="code-badge">#{item.id}</span>
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{item.stock_actual}</strong> {item.unidad_medida || "unidades"}
                    </td>
                    <td>
                      {item.stock_minimo} {item.unidad_medida || "unidades"}
                    </td>
                    <td>
                      <span className="status-pill">
                        {item.stock_actual < item.stock_minimo ? "Bajo mínimo" : "Disponible"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">{inventory.length} insumo(s) activos registrados</div>
      </section>
      <Link href="/admin" className="text-link">
        Volver al panel <ArrowRight size={14} />
      </Link>
    </>
  );
}
