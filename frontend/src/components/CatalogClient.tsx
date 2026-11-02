"use client";
import { useEffect, useMemo, useState } from "react";
import { PackageSearch, Truck, Feather, Clock3, Camera } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { categories, occasions, products as fallback } from "@/lib/products";
import type { Product } from "@/lib/types";

type PriceRange = "Todos" | "0-60000" | "60000-80000" | "80000+";
export function CatalogClient() {
  const [products, setProducts] = useState<Product[]>(fallback);
  const [occasion, setOccasion] = useState<string>("Todas");
  const [category, setCategory] = useState<string>("Todas");
  const [price, setPrice] = useState<PriceRange>("Todos");
  const [sort, setSort] = useState("popular");
  const [today, setToday] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/products`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("API no disponible");
        return r.json() as Promise<Product[]>;
      })
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const visible = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (occasion === "Todas" ||
              p.occasions.includes(occasion as Product["occasions"][number])) &&
            (category === "Todas" || p.category === category) &&
            (price === "Todos" ||
              (price === "0-60000"
                ? p.price < 60000
                : price === "60000-80000"
                  ? p.price >= 60000 && p.price <= 80000
                  : p.price > 80000)) &&
            (!today || p.availableToday),
        )
        .sort((a, b) =>
          sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0,
        ),
    [products, occasion, category, price, today, sort],
  );
  return (
    <>
      <section className="catalog-hero">
        <div className="container">
          <div className="eyebrow">✿ UN DETALLITO HECHO CON AMOR</div>
          <div className="catalog-hero-row">
            <div>
              <h1 className="serif-title">
                Catálogo de Detalles & Regalos
                <br />
                <em>de Autor</em>
              </h1>
              <p>
                Bandejas de madera noble, flores preservadas y repostería artesanal
                <br className="desktop-only" /> horneada cada madrugada. Cada regalo viaja empacado
                con cariño.
              </p>
            </div>
            <div className="delivery-card">
              <Truck size={25} />
              <span>
                <strong>Entregas Matutinas</strong>
                <small>Franjas de 7:30 a 11:30 AM</small>
              </span>
            </div>
          </div>
          <div className="filter-panel">
            <div className="filter-row">
              <span className="filter-label">OCASIÓN:</span>
              <div className="chip-group">
                {occasions.map((o) => (
                  <button
                    key={o}
                    onClick={() => setOccasion(o)}
                    className={`chip ${occasion === o ? "selected" : ""}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              <label className="sort-field">
                Ordenar{" "}
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="popular">Más populares</option>
                  <option value="price-asc">Precio menor</option>
                  <option value="price-desc">Precio mayor</option>
                </select>
              </label>
            </div>
            <div className="filter-row">
              <span className="filter-label">CATEGORÍA:</span>
              <div className="chip-group">
                {categories.map((c) => (
                  <button
                    key={c}
                    className={`chip ${category === c ? "selected" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-row">
              <span className="filter-label">PRESUPUESTO:</span>
              <div className="chip-group">
                {(
                  [
                    { value: "Todos", label: "Todos" },
                    { value: "0-60000", label: "Menos de $60.000" },
                    { value: "60000-80000", label: "$60–$80 mil" },
                    { value: "80000+", label: "Más de $80.000" },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.value}
                    className={`chip ${price === r.value ? "selected" : ""}`}
                    onClick={() => setPrice(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <label className="today-filter">
                <input
                  type="checkbox"
                  checked={today}
                  onChange={(e) => setToday(e.target.checked)}
                />{" "}
                <Clock3 size={14} /> Entrega hoy
              </label>
            </div>
          </div>
        </div>
      </section>
      <section className="container catalog-results">
        <div className="section-between">
          <p className="muted-text">
            Mostrando <strong>{visible.length}</strong> creaciones disponibles
          </p>
          <button
            className="text-link"
            onClick={() => {
              setCategory("Todas");
              setOccasion("Todas");
              setPrice("Todos");
              setToday(false);
            }}
          >
            Limpiar filtros
          </button>
        </div>
        <div className="products-grid">
          {visible.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
        {visible.length === 0 && (
          <div className="empty-state">
            <PackageSearch size={38} />
            <h3>No encontramos detalles con estos filtros</h3>
            <p>Prueba otra ocasión o un presupuesto distinto.</p>
          </div>
        )}
        <div className="catalog-end">
          Detalles elegidos con amor y preparados por nuestro taller.
          <em>“Un detallito hecho con amor, para cada ocasión”</em>
        </div>
        <div className="benefit-row">
          <div>
            <Feather />
            <span>
              <strong>Caligrafía Manuscrita</strong>
              <small>Escribimos a plumilla tu mensaje en papel de algodón.</small>
            </span>
          </div>
          <div>
            <Clock3 />
            <span>
              <strong>Puntualidad Absoluta</strong>
              <small>Rutas coordinadas para que tu sorpresa ocurra en el minuto acordado.</small>
            </span>
          </div>
          <div>
            <Camera />
            <span>
              <strong>Registro Fotográfico</strong>
              <small>Recibe confirmación y fotografía de entrega.</small>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
