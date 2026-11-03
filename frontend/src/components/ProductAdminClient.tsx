"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { currency } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductAdminClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const photo = data.get("photo");
    if (!(photo instanceof File) || photo.size > 5 * 1024 * 1024) {
      setError(true);
      setMessage("La foto debe pesar 5 MB o menos.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/admin/products`, {
        method: "POST",
        headers: { "x-admin-password": password },
        body: data,
      });
      const result = (await response.json()) as { detail?: string };
      if (!response.ok) throw new Error(result.detail || "No se pudo guardar el producto.");
      form.reset();
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
          <div className="admin-product-fields">
            <label>Nombre <input className="input" name="name" maxLength={120} required /></label>
            <label>Categoría <input className="input" name="category" maxLength={80} required placeholder="Ej. Desayunos" /></label>
            <label>Precio (CLP) <input className="input" name="price" type="number" min="1" max="2147483647" step="1" required /></label>
            <label>Etiqueta <input className="input" name="badge" maxLength={80} placeholder="Ej. Nuevo" /></label>
          </div>
          <label>Descripción <textarea className="input" name="description" rows={3} maxLength={2000} required /></label>
          <div className="admin-product-fields">
            <label>Ocasiones <input className="input" name="occasions" placeholder="Cumpleaños, Aniversario" /></label>
            <label>Contenido (uno por línea) <textarea className="input" name="features" rows={3} placeholder={"Caja artesanal\nTarjeta personalizada"} /></label>
          </div>
          <label>Foto (JPG, PNG o WebP, máximo 5 MB) <input className="input" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required /></label>
          <label className="today-filter"><input name="availableToday" type="checkbox" /> Disponible para entrega hoy</label>
          <label>Contraseña de administración <input className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {message && <p role="status" className={error ? "danger-text" : "success-text"}>{message}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Guardando..." : "Guardar producto"}</button>
        </form>
      </section>

      <section className="dashboard-card admin-product-list">
        <h2>Productos publicados ({products.length})</h2>
        {products.length === 0 ? <p>Aún no hay productos. Agrega el primero con el formulario.</p> : (
          <div className="admin-product-grid">
            {products.map((product) => (
              <div className="admin-product-row" key={product.id}>
                <Image src={product.image} alt="" width={72} height={72} />
                <div><strong>{product.name}</strong><small>{product.category} · {currency(product.price)}</small></div>
                <Link className="text-link" href={`/producto/${product.slug}`}>Ver</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
