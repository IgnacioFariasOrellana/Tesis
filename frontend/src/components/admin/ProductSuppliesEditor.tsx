"use client";

import { useId, useState } from "react";
import type { InventoryItem } from "@/lib/db-types";
import { adminRequest } from "@/lib/admin-api";

export type SupplyRow = { insumoId: string; quantity: string };
export const emptySupply = (): SupplyRow => ({ insumoId: "", quantity: "1" });
export const supplyPayload = (rows: SupplyRow[]) =>
  rows.map((row) => ({
    insumoId: Number(row.insumoId),
    quantity: row.quantity,
  }));

type Props = {
  inventory: InventoryItem[];
  value: SupplyRow[];
  onChange: (value: SupplyRow[]) => void;
  onCreated: (item: InventoryItem) => void;
  onBusyChange: (busy: boolean) => void;
};

export function ProductSuppliesEditor({
  inventory,
  value,
  onChange,
  onCreated,
  onBusyChange,
}: Props) {
  const id = useId();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState({
    nombre: "",
    unidad_medida: "unidad",
    stock_actual: "0",
    stock_minimo: "0",
  });

  const changeRow = (index: number, patch: Partial<SupplyRow>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  async function createSupply() {
    if (creating) return;
    if (
      !draft.nombre.trim() ||
      !draft.unidad_medida.trim() ||
      draft.stock_actual === "" ||
      draft.stock_minimo === ""
    ) {
      setFailed(true);
      setNotice("Completa el nombre, la unidad y las existencias del insumo.");
      return;
    }
    setCreating(true);
    onBusyChange(true);
    setNotice("");
    try {
      const result = await adminRequest<{ item: InventoryItem; created: boolean }>(
        "/api/admin/inventory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      onCreated(result.item);
      const supplyId = String(result.item.id);
      if (!value.some((row) => row.insumoId === supplyId)) {
        const emptyIndex = value.findIndex((row) => !row.insumoId);
        if (emptyIndex >= 0) changeRow(emptyIndex, { insumoId: supplyId });
        else if (value.length < 50) onChange([...value, { insumoId: supplyId, quantity: "1" }]);
      }
      setDraft({ nombre: "", unidad_medida: "unidad", stock_actual: "0", stock_minimo: "0" });
      setShowCreate(false);
      setFailed(false);
      setNotice(
        result.created
          ? "Insumo creado y disponible en el inventario."
          : "Ese insumo ya existía. Se reutilizó sin cambiar su stock.",
      );
    } catch (cause) {
      setFailed(true);
      setNotice(cause instanceof Error ? cause.message : "No se pudo crear el insumo.");
    } finally {
      setCreating(false);
      onBusyChange(false);
    }
  }

  return (
    <section className="product-supplies" aria-label="Insumos del producto">
      <h3>Insumos del producto</h3>
      <p className="hint">
        Indica cuánto se necesita para elaborar una unidad de este producto. Se mostrará como
        contenido en el catálogo.
      </p>
      <fieldset className="plain-fieldset" disabled={creating}>
        {value.map((row, index) => {
          const selected = inventory.find((item) => String(item.id) === row.insumoId);
          return (
            <div className="supply-row" key={index}>
              <label htmlFor={`${id}-supply-${index}`}>
                <span>
                  Insumo <b className="required-mark">*</b>
                </span>
                <select
                  id={`${id}-supply-${index}`}
                  className="input"
                  required
                  value={row.insumoId}
                  onChange={(event) => changeRow(index, { insumoId: event.target.value })}
                >
                  <option value="" disabled>
                    Selecciona un insumo
                  </option>
                  {row.insumoId && !selected && (
                    <option value={row.insumoId}>Insumo #{row.insumoId} (no disponible)</option>
                  )}
                  {inventory
                    .filter(
                      (item) =>
                        String(item.id) === row.insumoId ||
                        !value.some((other) => other.insumoId === String(item.id)),
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre || `Insumo #${item.id}`} · {item.unidad_medida || "unidad"}
                      </option>
                    ))}
                </select>
              </label>
              <label htmlFor={`${id}-quantity-${index}`}>
                <span>
                  Cantidad por producto {selected?.unidad_medida && `(${selected.unidad_medida})`}
                  <b className="required-mark"> *</b>
                </span>
                <input
                  id={`${id}-quantity-${index}`}
                  className="input"
                  type="number"
                  min="0.001"
                  max="999999999.999"
                  step="0.001"
                  required
                  value={row.quantity}
                  onChange={(event) => changeRow(index, { quantity: event.target.value })}
                  onWheel={(event) => event.currentTarget.blur()}
                />
              </label>
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() =>
                  onChange(
                    value.length === 1 ? [emptySupply()] : value.filter((_, i) => i !== index),
                  )
                }
                aria-label={`Quitar ${selected?.nombre || `insumo ${index + 1}`}`}
              >
                Quitar
              </button>
            </div>
          );
        })}
        {inventory.length === 0 && <p>Aún no hay insumos. Crea el primero para seleccionarlo.</p>}
        <div className="supply-actions">
          <button
            className="btn btn-outline btn-small"
            type="button"
            disabled={value.length >= 50}
            onClick={() => onChange([...value, emptySupply()])}
          >
            Añadir otro insumo
          </button>
          <button
            className="btn btn-soft btn-small"
            type="button"
            aria-expanded={showCreate}
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? "Cerrar creación de insumo" : "Crear insumo nuevo"}
          </button>
        </div>
      </fieldset>
      {showCreate && (
        <fieldset className="new-supply-form" disabled={creating}>
          <legend>Nuevo insumo</legend>
          <p className="hint">
            Al pulsar Crear insumo se guardará en el inventario y podrás reutilizarlo en otros
            productos.
          </p>
          <div className="admin-product-fields">
            <label>
              <span>
                Nombre del insumo <b className="required-mark">*</b>
              </span>
              <input
                className="input"
                maxLength={120}
                value={draft.nombre}
                onChange={(event) => setDraft({ ...draft, nombre: event.target.value })}
                placeholder="Ej. Yogurt natural"
              />
            </label>
            <label>
              <span>
                Unidad de medida <b className="required-mark">*</b>
              </span>
              <input
                className="input"
                list={`${id}-units`}
                maxLength={30}
                value={draft.unidad_medida}
                onChange={(event) => setDraft({ ...draft, unidad_medida: event.target.value })}
              />
              <datalist id={`${id}-units`}>
                {["unidad", "g", "kg", "ml", "l", "m"].map((unit) => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
            </label>
            <label>
              <span>
                Stock inicial <b className="required-mark">*</b>
              </span>
              <input
                className="input"
                type="number"
                min="0"
                max="999999999.999"
                step="0.001"
                value={draft.stock_actual}
                onChange={(event) => setDraft({ ...draft, stock_actual: event.target.value })}
                onWheel={(event) => event.currentTarget.blur()}
              />
            </label>
            <label>
              <span>
                Stock mínimo <b className="required-mark">*</b>
              </span>
              <input
                className="input"
                type="number"
                min="0"
                max="999999999.999"
                step="0.001"
                value={draft.stock_minimo}
                onChange={(event) => setDraft({ ...draft, stock_minimo: event.target.value })}
                onWheel={(event) => event.currentTarget.blur()}
              />
            </label>
          </div>
          <button type="button" className="btn btn-primary btn-small" onClick={createSupply}>
            {creating ? "Creando..." : "Crear insumo"}
          </button>
        </fieldset>
      )}
      {notice && (
        <p role="status" className={failed ? "danger-text" : "success-text"}>
          {notice}
        </p>
      )}
    </section>
  );
}
