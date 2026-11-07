"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircleOff,
  Layers3,
  PackageCheck,
  PackagePlus,
  Plus,
  RefreshCcw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { adminRequest } from "@/lib/admin-api";
import type { InventoryItem } from "@/lib/db-types";

const number = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 3 });

type Modal = "create" | "restock" | null;
type Notice = { text: string; error: boolean; retry?: boolean } | null;

function itemName(item: InventoryItem) {
  return item.nombre || `Insumo #${item.id}`;
}

function stockState(item: InventoryItem) {
  if (item.stock_actual <= 0) return "empty";
  if (item.stock_actual < item.stock_minimo) return "low";
  return "healthy";
}

export function InventoryAdminClient({
  initialInventory,
  initialLoadError = "",
}: {
  initialInventory: InventoryItem[];
  initialLoadError?: string;
}) {
  const router = useRouter();
  const [inventory, setInventory] = useState(initialInventory);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(
    initialLoadError ? { text: initialLoadError, error: true, retry: true } : null,
  );
  const [formError, setFormError] = useState("");
  const [restockAmount, setRestockAmount] = useState("1");
  const [draft, setDraft] = useState({
    nombre: "",
    unidad_medida: "unidad",
    stock_actual: "0",
    stock_minimo: "0",
  });

  useEffect(() => {
    setInventory(initialInventory);
    setNotice(initialLoadError ? { text: initialLoadError, error: true, retry: true } : null);
  }, [initialInventory, initialLoadError]);

  const lowStock = useMemo(
    () => inventory.filter((item) => stockState(item) !== "healthy"),
    [inventory],
  );
  const lowOnlyStock = useMemo(
    () => inventory.filter((item) => stockState(item) === "low"),
    [inventory],
  );
  const emptyStock = useMemo(() => inventory.filter((item) => item.stock_actual <= 0), [inventory]);
  const healthyStock = useMemo(
    () =>
      inventory.filter((item) => item.stock_actual >= item.stock_minimo && item.stock_actual > 0),
    [inventory],
  );
  const priorities = useMemo(
    () =>
      [...lowStock]
        .sort(
          (first, second) =>
            second.stock_minimo - second.stock_actual - (first.stock_minimo - first.stock_actual),
        )
        .slice(0, 5),
    [lowStock],
  );
  const visibleInventory = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es-CL");
    if (!normalized) return inventory;
    return inventory.filter((item) =>
      `${item.nombre || ""} ${item.unidad_medida || ""} ${item.id}`
        .toLocaleLowerCase("es-CL")
        .includes(normalized),
    );
  }, [inventory, query]);

  const replaceItem = (updated: InventoryItem) =>
    setInventory((current) =>
      [...current.filter((item) => item.id !== updated.id), updated].sort((first, second) =>
        itemName(first).localeCompare(itemName(second), "es"),
      ),
    );

  function closeModal() {
    if (busy) return;
    setModal(null);
    setSelected(null);
    setFormError("");
  }

  function openCreate() {
    setDraft({ nombre: "", unidad_medida: "unidad", stock_actual: "0", stock_minimo: "0" });
    setFormError("");
    setModal("create");
  }

  function openRestock(item: InventoryItem) {
    setSelected(item);
    setRestockAmount("1");
    setFormError("");
    setModal("restock");
  }

  async function createSupply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFormError("");
    try {
      const result = await adminRequest<{ item: InventoryItem; created: boolean }>(
        "/api/admin/inventory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      replaceItem(result.item);
      setNotice({
        error: false,
        text: result.created
          ? `${itemName(result.item)} se agregó al inventario.`
          : `${itemName(result.item)} ya estaba registrado; no se modificaron sus existencias.`,
      });
      setModal(null);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "No se pudo crear el insumo.");
    } finally {
      setBusy(false);
    }
  }

  async function restockSupply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || busy) return;
    const quantity = Number(restockAmount);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFormError("Ingresa una cantidad mayor que cero.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const result = await adminRequest<{ item: InventoryItem }>(
        `/api/admin/inventory/${selected.id}/restock`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cantidad: restockAmount }),
        },
      );
      replaceItem(result.item);
      setNotice({
        error: false,
        text: `Se agregaron ${number.format(quantity)} ${selected.unidad_medida || "unidades"} a ${itemName(selected)}.`,
      });
      setModal(null);
      setSelected(null);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "No se pudo registrar la reposición.");
    } finally {
      setBusy(false);
    }
  }

  const distribution = [
    { label: "Stock saludable", count: healthyStock.length, tone: "healthy" },
    { label: "Bajo el mínimo", count: lowOnlyStock.length, tone: "low" },
    { label: "Sin existencias", count: emptyStock.length, tone: "empty" },
  ];

  return (
    <>
      <div className="dashboard-welcome inventory-header">
        <div>
          <div className="overline">CONTROL DE INSUMOS</div>
          <h1>Inventario del taller</h1>
          <p>Resumen de existencias, alertas y reposiciones registradas en Supabase.</p>
        </div>
        <div className="inventory-header-actions">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => openRestock(priorities[0] || inventory[0])}
            disabled={!inventory.length}
          >
            <RefreshCcw size={16} /> Restock rápido
          </button>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            <Plus size={17} /> Nuevo insumo
          </button>
        </div>
      </div>

      {notice && (
        <div className={`inventory-notice ${notice.error ? "is-error" : ""}`} role="status">
          {notice.error ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
          <span>{notice.text}</span>
          {notice.retry && (
            <button
              className="inventory-notice-retry"
              type="button"
              onClick={() => router.refresh()}
            >
              <RefreshCcw size={14} /> Reintentar
            </button>
          )}
          <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar mensaje">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="admin-metrics admin-metrics-four">
        <AdminMetricCard
          title="Insumos activos"
          value={inventory.length}
          description="Materiales registrados para las preparaciones."
          Icon={Layers3}
          progress={inventory.length ? 100 : 0}
          tone="plum"
        />
        <AdminMetricCard
          title="Stock saludable"
          value={healthyStock.length}
          description="Insumos que cumplen o superan su mínimo."
          Icon={PackageCheck}
          progress={inventory.length ? (healthyStock.length / inventory.length) * 100 : 0}
          tone="sage"
        />
        <AdminMetricCard
          title="Bajo mínimo"
          value={lowStock.length}
          description="Materiales que necesitan una reposición."
          Icon={TriangleAlert}
          progress={inventory.length ? (lowStock.length / inventory.length) * 100 : 0}
          tone="amber"
        />
        <AdminMetricCard
          title="Sin existencias"
          value={emptyStock.length}
          description="Insumos con stock actual igual a cero."
          Icon={CircleOff}
          progress={inventory.length ? (emptyStock.length / inventory.length) * 100 : 0}
        />
      </div>

      <div className="inventory-overview-grid">
        <section className="dashboard-card inventory-health-card">
          <div className="admin-card-heading">
            <div>
              <span className="admin-section-label">PANORAMA GENERAL</span>
              <h2>Salud del inventario</h2>
            </div>
            <Boxes size={19} />
          </div>
          <div className="inventory-health-total">
            <strong>{inventory.length}</strong>
            <span>insumos activos monitoreados</span>
          </div>
          <div className="inventory-distribution">
            {distribution.map((item) => {
              const percentage = inventory.length ? (item.count / inventory.length) * 100 : 0;
              return (
                <div className="inventory-distribution-row" key={item.label}>
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div
                    className="inventory-progress"
                    aria-label={`${item.label}: ${Math.round(percentage)}%`}
                  >
                    <span className={`is-${item.tone}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-card inventory-priority-card">
          <div className="admin-card-heading">
            <div>
              <span className="admin-section-label">ACCIÓN REQUERIDA</span>
              <h2>Reposición prioritaria</h2>
            </div>
            <span className={`admin-count-badge ${priorities.length ? "is-alert" : ""}`}>
              {priorities.length}
            </span>
          </div>
          {priorities.length ? (
            <ul className="inventory-priority-list">
              {priorities.map((item) => (
                <li key={item.id}>
                  <span className="inventory-alert-icon">
                    <AlertTriangle size={16} />
                  </span>
                  <div>
                    <strong>{itemName(item)}</strong>
                    <small>
                      {number.format(item.stock_actual)} de {number.format(item.stock_minimo)}{" "}
                      {item.unidad_medida || "unidades"}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-soft btn-small"
                    onClick={() => openRestock(item)}
                  >
                    Reponer
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="inventory-all-good">
              <CheckCircle2 size={27} />
              <div>
                <strong>Inventario en orden</strong>
                <p>Todos los insumos están sobre su mínimo.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-card no-padding inventory-list-card">
        <div className="admin-table-heading inventory-table-heading">
          <div>
            <span className="admin-section-label">EXISTENCIAS</span>
            <h2>Todos los insumos</h2>
          </div>
          <label className="inventory-search">
            <Search size={15} />
            <span className="sr-only">Buscar insumo</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, unidad o ID"
            />
          </label>
        </div>
        {visibleInventory.length === 0 ? (
          <div className="admin-empty">
            <span>
              <Boxes size={28} />
            </span>
            <h2>{inventory.length ? "No hay coincidencias" : "Aún no hay insumos"}</h2>
            <p>
              {inventory.length
                ? "Prueba con otro término de búsqueda."
                : "Agrega el primer insumo para comenzar a controlar existencias."}
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table inventory-table inventory-management-table">
              <thead>
                <tr>
                  <th>INSUMO</th>
                  <th>STOCK ACTUAL</th>
                  <th>STOCK MÍNIMO</th>
                  <th>ESTADO</th>
                  <th>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {visibleInventory.map((item) => {
                  const state = stockState(item);
                  const coverage =
                    item.stock_minimo > 0
                      ? Math.min(100, (item.stock_actual / item.stock_minimo) * 100)
                      : item.stock_actual > 0
                        ? 100
                        : 0;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="stock-name">
                          <span className="stock-icon">
                            <Boxes size={20} />
                          </span>
                          <div>
                            <strong>{itemName(item)}</strong>
                            <small>
                              <span className="code-badge">#{item.id}</span>{" "}
                              {item.unidad_medida || "unidad"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="inventory-stock-value">
                          <strong>{number.format(item.stock_actual)}</strong>
                          <span>{item.unidad_medida || "unidades"}</span>
                        </div>
                        <div className="inventory-mini-progress">
                          <span className={`is-${state}`} style={{ width: `${coverage}%` }} />
                        </div>
                      </td>
                      <td>
                        {number.format(item.stock_minimo)} {item.unidad_medida || "unidades"}
                      </td>
                      <td>
                        <span className={`inventory-status is-${state}`}>
                          {state === "empty"
                            ? "Sin stock"
                            : state === "low"
                              ? "Bajo mínimo"
                              : "Disponible"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          onClick={() => openRestock(item)}
                        >
                          <PackagePlus size={14} /> Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer inventory-table-footer">
          <span>
            {visibleInventory.length} de {inventory.length} insumo(s)
          </span>
          <Link href="/admin" className="text-link">
            Volver al panel <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {modal && (
        <div
          className="inventory-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
        >
          <section
            className="inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-modal-title"
          >
            <div className="inventory-modal-heading">
              <div>
                <span className="admin-section-label">
                  {modal === "create" ? "NUEVO REGISTRO" : "MOVIMIENTO DE STOCK"}
                </span>
                <h2 id="inventory-modal-title">
                  {modal === "create"
                    ? "Agregar insumo"
                    : `Reponer ${selected ? itemName(selected) : "insumo"}`}
                </h2>
              </div>
              <button type="button" onClick={closeModal} disabled={busy} aria-label="Cerrar">
                <X size={19} />
              </button>
            </div>

            {modal === "create" ? (
              <form onSubmit={createSupply} className="inventory-form">
                <label>
                  Nombre del insumo
                  <input
                    className="input"
                    required
                    maxLength={120}
                    value={draft.nombre}
                    onChange={(event) => setDraft({ ...draft, nombre: event.target.value })}
                    placeholder="Ej. Yogurt natural"
                  />
                </label>
                <div className="inventory-form-grid">
                  <label>
                    Unidad de medida
                    <input
                      className="input"
                      required
                      list="inventory-units"
                      maxLength={30}
                      value={draft.unidad_medida}
                      onChange={(event) =>
                        setDraft({ ...draft, unidad_medida: event.target.value })
                      }
                    />
                  </label>
                  <datalist id="inventory-units">
                    {["unidad", "g", "kg", "ml", "l", "m"].map((unit) => (
                      <option key={unit} value={unit} />
                    ))}
                  </datalist>
                  <label>
                    Stock inicial
                    <input
                      className="input"
                      required
                      type="number"
                      min="0"
                      max="999999999.999"
                      step="0.001"
                      value={draft.stock_actual}
                      onChange={(event) => setDraft({ ...draft, stock_actual: event.target.value })}
                    />
                  </label>
                  <label>
                    Stock mínimo
                    <input
                      className="input"
                      required
                      type="number"
                      min="0"
                      max="999999999.999"
                      step="0.001"
                      value={draft.stock_minimo}
                      onChange={(event) => setDraft({ ...draft, stock_minimo: event.target.value })}
                    />
                  </label>
                </div>
                <p className="inventory-form-hint">
                  El stock mínimo se utilizará para generar alertas de reposición.
                </p>
                {formError && (
                  <p className="danger-text" role="alert">
                    {formError}
                  </p>
                )}
                <div className="inventory-modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeModal}
                    disabled={busy}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={busy}>
                    {busy ? "Guardando..." : "Guardar insumo"}
                  </button>
                </div>
              </form>
            ) : (
              selected && (
                <form onSubmit={restockSupply} className="inventory-form">
                  <div className="inventory-restock-summary">
                    <span className="stock-icon">
                      <Boxes size={21} />
                    </span>
                    <div>
                      <small>STOCK ACTUAL</small>
                      <strong>
                        {number.format(selected.stock_actual)}{" "}
                        {selected.unidad_medida || "unidades"}
                      </strong>
                    </div>
                    <ArrowRight size={17} />
                    <div>
                      <small>NUEVO STOCK</small>
                      <strong>
                        {number.format(
                          Number(selected.stock_actual) + Math.max(0, Number(restockAmount) || 0),
                        )}{" "}
                        {selected.unidad_medida || "unidades"}
                      </strong>
                    </div>
                  </div>
                  <label>
                    Cantidad que ingresa
                    <input
                      className="input"
                      autoFocus
                      required
                      type="number"
                      min="0.001"
                      max="999999999.999"
                      step="0.001"
                      value={restockAmount}
                      onChange={(event) => setRestockAmount(event.target.value)}
                    />
                  </label>
                  <p className="inventory-form-hint">
                    La cantidad se sumará al stock actual y quedará disponible inmediatamente.
                  </p>
                  {formError && (
                    <p className="danger-text" role="alert">
                      {formError}
                    </p>
                  )}
                  <div className="inventory-modal-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={closeModal}
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                      {busy ? "Registrando..." : "Confirmar restock"}
                    </button>
                  </div>
                </form>
              )
            )}
          </section>
        </div>
      )}
    </>
  );
}
