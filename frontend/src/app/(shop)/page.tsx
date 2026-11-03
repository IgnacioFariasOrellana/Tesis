import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Feather, CheckCheck, Truck, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/product-api";
export default async function Home() {
  const products = await getProducts();
  const featured = products.find((p) => p.slug === "caja-sorpresa-noble") || products[0];
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div>
            <h1 className="serif-title">
              El arte de regalar con el <em>corazón</em> en cada detalle.
            </h1>
            <p>
              Bandejas gourmet, cajas personalizadas y obsequios hechos a mano para sorprender al
              amanecer con aromas cálidos, flores silvestres y memorias imborrables.
            </p>
            <div className="button-row">
              <Link className="btn btn-primary" href="/catalogo">
                Ver catálogo <ArrowRight size={17} />
              </Link>
              <Link className="btn btn-outline" href={featured ? `/producto/${featured.slug}` : "/catalogo"}>
                Armar a medida
              </Link>
            </div>
            <div className="hero-features">
              <span>
                <Truck /> Entrega matutina
              </span>
              <span>
                <Feather /> Caligrafía a mano
              </span>
              <span>
                <CheckCheck /> 100% artesanal
              </span>
            </div>
          </div>
          {featured && (
            <Link href={`/producto/${featured.slug}`} className="hero-feature-product">
              <div className="hero-img">
                <Image
                  src={featured.image}
                  alt={featured.name}
                  fill
                  priority
                  sizes="(max-width: 800px) 100vw, 45vw"
                />
              </div>
              <div>
                <span className="overline">COLECCIÓN MATINAL</span>
                <strong>{featured.name}</strong>
                <small>{featured.description}</small>
              </div>
            </Link>
          )}
        </div>
      </section>
      <section className="container home-featured">
        <div className="section-between section-heading">
          <div>
            <div className="overline">MOMENTOS INOLVIDABLES</div>
            <h2 className="serif-title">Diseñadas para celebrar la vida</h2>
            <p>Elige un detalle tan único como esa persona especial.</p>
          </div>
          <Link href="/catalogo" className="text-link">
            Explorar todo el catálogo <ArrowRight size={16} />
          </Link>
        </div>
        <div className="products-grid">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="how-section">
        <div className="container">
          <div className="center-heading">
            <div className="overline">CUIDADO EN CADA PASO</div>
            <h2 className="serif-title">La experiencia Allicam</h2>
            <p>Desde el primer trazo de tinta hasta el instante en que se abre tu regalo.</p>
          </div>
          <ol className="steps-grid">
            <li>
              <div className="step-marker">
                <Gift aria-hidden="true" />
                <span>01</span>
              </div>
              <h3>Elige o personaliza</h3>
              <p>Selecciona tu bandeja o caja, escribe una dedicatoria y elige la fecha.</p>
            </li>
            <li>
              <div className="step-marker">
                <Feather aria-hidden="true" />
                <span>02</span>
              </div>
              <h3>El arte del empaque</h3>
              <p>Caligrafía, flores y detalles hechos cuidadosamente en el taller.</p>
            </li>
            <li>
              <div className="step-marker">
                <ShieldCheck aria-hidden="true" />
                <span>03</span>
              </div>
              <h3>Entrega al alba</h3>
              <p>Tu sorpresa llega en la franja acordada, con registro de entrega.</p>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
