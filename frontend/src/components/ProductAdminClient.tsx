"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { currency } from "@/lib/format";
import type { Product } from "@/lib/types";
import type { InventoryItem } from "@/lib/db-types";
import { adminRequest } from "@/lib/admin-api";
import {
  emptySupply,
  ProductSuppliesEditor,
  supplyPayload,
  type SupplyRow,
} from "./ProductSuppliesEditor";

export function ProductAdminClient({
  products,
  initialInventory,
}: {
  products: Product[];
  initialInventory: InventoryItem[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [inventory, setInventory] = useState(initialInventory);
  const [supplies, setSupplies] = useState<SupplyRow[]>([emptySupply()]);
  const [creatingSupply, setCreatingSupply] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editSupplies, setEditSupplies] = useState<SupplyRow[]>([]);
  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState(false);

  function addToInventory(item: InventoryItem) {
    setInventory((current) =>
      [...current.filter((supply) => supply.id !== item.id), item].sort((a, b) =>
        (a.nombre || "").localeCompare(b.nombre || "", "es"),
      ),
    );
  }

  async function saveSupplies(event: FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault();
    if (busy || creatingSupply) return;
    setBusy(true);
    setEditMessage("");
    try {
      await adminRequest(`/api/admin/products/${productId}/supplies`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplies: supplyPayload(editSupplies) }),
      });
      setEditError(false);
      setEditMessage("Insumos guardados. El contenido del catálogo se actualizó.");
      router.refresh();
    } catch (cause) {
      setEditError(true);
      setEditMessage(
        cause instanceof Error ? cause.message : "No se pudieron guardar los insumos.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || creatingSupply) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("supplies", JSON.stringify(supplyPayload(supplies)));
    const photo = data.get("photo");
    if (!(photo instanceof File) || photo.size > 5 * 1024 * 1024) {
      setError(true);
      setMessage("La foto debe pesar 5 MB o menos.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await adminRequest("/api/admin/products", { method: "POST", body: data });
      form.reset();
      setSupplies([emptySupply()]);
      setError(false);
      setMessage("Producto guardado. Ya está disponible en el catálogo.");
      router.refresh();
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "No se pudo guardar el producto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <div className="overline">CATÁLOGO DE PRODUCTOS</div>
          <h1>Administrar productos</h1>
          <p>Agrega tus productos con una foto. Se publicarán en la tienda al guardar.</p>
        </div>
      </div>

      <section className="dashboard-card admin-product-form">
        <h2>Nuevo producto</h2>
        <form onSubmit={submit}>
          <fieldset className="plain-fieldset product-fields" disabled={busy || creatingSupply}>
            <div className="admin-product-fields">
              <label>
                Nombre <input className="input" name="name" maxLength={120} required />
              </label>
              <label>
                Categoría{" "}
                <input
                  className="input"
                  name="category"
                  maxLength={80}
                  required
                  placeholder="Ej. Desayunos"
                />
              </label>
              <label>
                Precio (CLP){" "}
                <input
                  className="input"
                  name="price"
                  type="number"
                  min="1"
                  max="2147483647"
                  step="1"
                  required
                />
              </label>
              <label>
                Etiqueta{" "}
                <input className="input" name="badge" maxLength={80} placeholder="Ej. Nuevo" />
              </label>
            </div>
            <label>
              Descripción{" "}
              <textarea className="input" name="description" rows={3} maxLength={2000} required />
            </label>
            <label>
              Ocasiones{" "}
              <input className="input" name="occasions" placeholder="Cumpleaños, Aniversario" />
            </label>
            <ProductSuppliesEditor
              inventory={inventory}
              value={supplies}
              onChange={setSupplies}
              onCreated={addToInventory}
              onBusyChange={setCreatingSupply}
            />
            <label>
              Foto (JPG, PNG o WebP, máximo 5 MB){" "}
              <input
                className="input"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>
            <label className="today-filter">
              <input name="availableToday" type="checkbox" /> Disponible para entrega hoy
            </label>
            {message && (
              <p role="status" className={error ? "danger-text" : "success-text"}>
                {message}
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={busy || creatingSupply}>
              {busy ? "Guardando..." : "Guardar producto"}
            </button>
          </fieldset>
        </form>
      </section>

      <section className="dashboard-card admin-product-list">
        <h2>Productos publicados ({products.length})</h2>
        {products.length === 0 ? (
          <p>Aún no hay productos. Agrega el primero con el formulario.</p>
        ) : (
          <div className="admin-product-grid">
            {products.map((product) => (
              <div className="admin-product-entry" key={product.id}>
                <div className="admin-product-row">
                  <Image src={product.image} alt="" width={72} height={72} />
                  <div>
                    <strong>{product.name}</strong>
                    <small>
                      {product.category} · {currency(product.price)}
                    </small>
                    <small>
                      {product.supplies.length
                        ? `${product.supplies.length} insumos vinculados`
                        : "Sin insumos vinculados"}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    disabled={busy || creatingSupply}
                    aria-expanded={editing === product.id}
                    onClick={() => {
                      setEditing(editing === product.id ? null : product.id);
                      setEditMessage("");
                      setEditSupplies(
                        product.supplies.length
                          ? product.supplies.map((item) => ({
                              insumoId: String(item.insumoId),
                              quantity: String(item.quantity),
                            }))
                          : [emptySupply()],
                      );
                    }}
                  >
                    Editar insumos
                  </button>
                  <Link className="text-link" href={`/producto/${product.slug}`}>
                    Ver
                  </Link>
                </div>
                {editing === product.id && (
                  <div className="admin-product-form supply-edit-form">
                    <h3>Composición de {product.name}</h3>
                    {!product.supplies.length && product.features.length > 0 && (
                      <p className="hint">
                        Contenido anterior: {product.features.join(", ")}. Selecciona sus insumos
                        para vincularlos al inventario.
                      </p>
                    )}
                    <form onSubmit={(event) => saveSupplies(event, product.id)}>
                      <fieldset
                        className="plain-fieldset product-fields"
                        disabled={busy || creatingSupply}
                      >
                        <ProductSuppliesEditor
                          inventory={inventory}
                          value={editSupplies}
                          onChange={setEditSupplies}
                          onCreated={addToInventory}
                          onBusyChange={setCreatingSupply}
                        />
                        {editMessage && (
                          <p role="status" className={editError ? "danger-text" : "success-text"}>
                            {editMessage}
                          </p>
                        )}
                        <button
                          className="btn btn-primary"
                          type="submit"
                          disabled={busy || creatingSupply}
                        >
                          {busy ? "Guardando..." : "Guardar insumos"}
                        </button>
                      </fieldset>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
