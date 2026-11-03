"use client";

export default function ShopError({ reset }: { reset: () => void }) {
  return (
    <section className="container empty-state">
      <h1>No pudimos cargar los productos</h1>
      <p>Revisa la conexión con Supabase y vuelve a intentarlo.</p>
      <button type="button" className="btn btn-primary" onClick={reset}>
        Reintentar
      </button>
    </section>
  );
}
