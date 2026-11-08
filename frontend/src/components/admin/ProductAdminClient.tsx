"use client";

import { DragEvent, FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  PackagePlus,
  Pencil,
  Plus,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";
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
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editSupplies, setEditSupplies] = useState<SupplyRow[]>([]);
  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [draggingPhoto, setDraggingPhoto] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const editingProduct = products.find((product) => product.id === editing) || null;

  useEffect(() => {
    if (!showCreate && !editingProduct) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || busy || creatingSupply) return;
      setShowCreate(false);
      setEditing(null);
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [showCreate, editingProduct, busy, creatingSupply]);

  function addToInventory(item: InventoryItem) {
    setInventory((current) =>
      [...current.filter((supply) => supply.id !== item.id), item].sort((a, b) =>
        (a.nombre || "").localeCompare(b.nombre || "", "es"),
      ),
    );
  }

  function openCreateModal() {
    setMessage("");
    setError(false);
    setSupplies([emptySupply()]);
    setPhotoName("");
    setShowCreate(true);
  }

  function selectPhoto(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      if (photoInput.current) photoInput.current.value = "";
      setPhotoName("");
      setError(true);
      setMessage("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (photoInput.current) photoInput.current.value = "";
      setPhotoName("");
      setError(true);
      setMessage("La foto debe pesar 5 MB o menos.");
      return;
    }
    const transfer = new DataTransfer();
    transfer.items.add(file);
    if (photoInput.current) photoInput.current.files = transfer.files;
    setPhotoName(file.name);
    setError(false);
    setMessage("");
  }

  function dropPhoto(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDraggingPhoto(false);
    selectPhoto(event.dataTransfer.files[0]);
  }

  function openSupplyModal(product: Product) {
    setEditMessage("");
    setEditError(false);
    setEditSupplies(
      product.supplies.length
        ? product.supplies.map((item) => ({
            insumoId: String(item.insumoId),
            quantity: String(item.quantity),
          }))
        : [emptySupply()],
    );
    setEditing(product.id);
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
      setEditing(null);
      setMessage(`Se actualizó la composición de ${editingProduct?.name || "el producto"}.`);
      setError(false);
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
    if (
      !(photo instanceof File) ||
      !["image/jpeg", "image/png", "image/webp"].includes(photo.type) ||
      photo.size > 5 * 1024 * 1024
    ) {
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
      setPhotoName("");
      setError(false);
      setMessage("Producto guardado. Ya está disponible en el catálogo.");
      setShowCreate(false);
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
      <div className="dashboard-welcome admin-products-heading">
        <div>
          <div className="overline">CATÁLOGO DE PRODUCTOS</div>
          <h1>Administrar productos</h1>
          <p>Consulta el catálogo, revisa su composición y publica nuevos productos.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={openCreateModal}>
          <Plus size={17} /> Nuevo producto
        </button>
      </div>

      {message && !showCreate && (
        <div className={`admin-product-notice ${error ? "is-error" : ""}`} role="status">
          {error ? <X size={17} /> : <CheckCircle2 size={17} />}
          <span>{message}</span>
          <button type="button" aria-label="Cerrar mensaje" onClick={() => setMessage("")}>
            <X size={15} />
          </button>
        </div>
      )}

      <section className="dashboard-card admin-product-list">
        <div className="admin-product-list-heading">
          <div>
            <span className="overline">PRODUCTOS ACTIVOS</span>
            <h2>Catálogo publicado</h2>
          </div>
          <strong>{products.length} producto(s)</strong>
        </div>

        {products.length === 0 ? (
          <div className="admin-product-empty">
            <PackagePlus size={38} />
            <h3>Aún no hay productos publicados</h3>
            <p>Agrega el primero para comenzar a construir el catálogo.</p>
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
              <Plus size={16} /> Agregar producto
            </button>
          </div>
        ) : (
          <div className="admin-product-grid">
            {products.map((product) => (
              <article className="admin-product-entry" key={product.id}>
                <div className="admin-product-thumb">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={116}
                    height={116}
                    sizes="116px"
                  />
                  {product.badge && <span>{product.badge}</span>}
                </div>
                <div className="admin-product-info">
                  <div className="admin-product-topline">
                    <span>{product.category}</span>
                    <span className={product.availableToday ? "is-available" : "is-scheduled"}>
                      {product.availableToday ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                      {product.availableToday ? "Disponible hoy" : "Programado"}
                    </span>
                  </div>
                  <h3>{product.name}</h3>
                  <p className="admin-product-description">{product.description}</p>
                  <div className="admin-product-details">
                    <strong>{currency(product.price)}</strong>
                    <span>
                      {product.supplies.length
                        ? `${product.supplies.length} insumo(s)`
                        : "Sin insumos"}
                    </span>
                  </div>
                  <div className="admin-product-tags">
                    {(product.occasions.length ? product.occasions : ["Sin ocasión definida"])
                      .slice(0, 3)
                      .map((occasion) => (
                        <span key={occasion}>
                          <Tag size={11} /> {occasion}
                        </span>
                      ))}
                  </div>
                  {product.supplies.length > 0 && (
                    <p className="admin-product-supply-preview">
                      <b>Composición:</b>{" "}
                      {product.supplies
                        .slice(0, 3)
                        .map((item) => item.name)
                        .join(", ")}
                      {product.supplies.length > 3 && ` y ${product.supplies.length - 3} más`}
                    </p>
                  )}
                  <div className="admin-product-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      disabled={busy || creatingSupply}
                      onClick={() => openSupplyModal(product)}
                    >
                      <Pencil size={13} /> Editar insumos
                    </button>
                    <Link className="text-link" href={`/producto/${product.slug}`}>
                      Ver producto <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <div
          className="admin-product-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy && !creatingSupply)
              setShowCreate(false);
          }}
        >
          <section
            className="admin-product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-product-title"
          >
            <header className="admin-product-modal-heading">
              <div>
                <span className="overline">NUEVO EN EL CATÁLOGO</span>
                <h2 id="new-product-title">Agregar producto</h2>
                <p>Completa la información y asocia los insumos necesarios.</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar formulario"
                disabled={busy || creatingSupply}
                onClick={() => setShowCreate(false)}
              >
                <X size={20} />
              </button>
            </header>
            <form className="admin-product-form" onSubmit={submit}>
              <fieldset className="plain-fieldset product-fields" disabled={busy || creatingSupply}>
                <p className="required-note">
                  <b>*</b> Campos obligatorios
                </p>
                <div className="admin-product-fields">
                  <label>
                    <span>
                      Nombre <b className="required-mark">*</b>
                    </span>
                    <input className="input" name="name" maxLength={120} required />
                  </label>
                  <label>
                    <span>
                      Categoría <b className="required-mark">*</b>
                    </span>
                    <input
                      className="input"
                      name="category"
                      maxLength={80}
                      required
                      placeholder="Ej. Desayunos"
                    />
                  </label>
                  <label>
                    <span>
                      Precio (CLP) <b className="required-mark">*</b>
                    </span>
                    <input
                      className="input"
                      name="price"
                      type="number"
                      min="1"
                      max="2147483647"
                      step="1"
                      required
                      onWheel={(event) => event.currentTarget.blur()}
                    />
                  </label>
                  <label>
                    Etiqueta{" "}
                    <input className="input" name="badge" maxLength={80} placeholder="Ej. Nuevo" />
                  </label>
                </div>
                <label>
                  <span>
                    Descripción <b className="required-mark">*</b>
                  </span>
                  <textarea
                    className="input"
                    name="description"
                    rows={3}
                    maxLength={2000}
                    required
                  />
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
                <div
                  className={`product-photo-dropzone ${draggingPhoto ? "is-dragging" : ""}`}
                  role="button"
                  tabIndex={0}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDraggingPhoto(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      setDraggingPhoto(false);
                    }
                  }}
                  onDrop={dropPhoto}
                  onKeyDown={(event) => {
                    if (
                      event.target === event.currentTarget &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      photoInput.current?.click();
                    }
                  }}
                >
                  <input
                    ref={photoInput}
                    className="product-photo-input"
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => selectPhoto(event.target.files?.[0])}
                  />
                  <UploadCloud size={27} />
                  <div>
                    <strong>
                      Fotografía del producto <b className="required-mark">*</b>
                    </strong>
                    <span>
                      {photoName || "Arrastra una imagen aquí o selecciónala desde tu equipo."}
                    </span>
                  </div>
                  <button
                    className="btn btn-outline btn-small"
                    type="button"
                    onClick={() => photoInput.current?.click()}
                  >
                    Seleccionar imagen
                  </button>
                  <small>JPG, PNG o WebP · máximo 5 MB</small>
                </div>
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
        </div>
      )}

      {editingProduct && (
        <div
          className="admin-product-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy && !creatingSupply) setEditing(null);
          }}
        >
          <section
            className="admin-product-modal admin-product-supply-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-supplies-title"
          >
            <header className="admin-product-modal-heading">
              <div>
                <span className="overline">COMPOSICIÓN DEL PRODUCTO</span>
                <h2 id="edit-supplies-title">Insumos de {editingProduct.name}</h2>
                <p>Selecciona los materiales utilizados para elaborar una unidad.</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar edición"
                disabled={busy || creatingSupply}
                onClick={() => setEditing(null)}
              >
                <X size={20} />
              </button>
            </header>
            {!editingProduct.supplies.length && editingProduct.features.length > 0 && (
              <p className="hint">
                Contenido anterior: {editingProduct.features.join(", ")}. Selecciona sus insumos
                para vincularlos al inventario.
              </p>
            )}
            <form onSubmit={(event) => saveSupplies(event, editingProduct.id)}>
              <fieldset className="plain-fieldset product-fields" disabled={busy || creatingSupply}>
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
                <button className="btn btn-primary" type="submit" disabled={busy || creatingSupply}>
                  {busy ? "Guardando..." : "Guardar insumos"}
                </button>
              </fieldset>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
