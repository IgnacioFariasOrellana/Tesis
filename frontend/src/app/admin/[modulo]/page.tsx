import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Wrench } from "lucide-react";

const modules: Record<string, string> = {
  pedidos: "Administración de pedidos",
  pagos: "Pagos y transacciones",
};

export function generateStaticParams() {
  return Object.keys(modules).map((modulo) => ({ modulo }));
}

export default async function ModulePage({ params }: { params: Promise<{ modulo: string }> }) {
  const { modulo } = await params;
  if (!modules[modulo]) notFound();
  return (
    <div className="empty-state admin-placeholder">
      <Wrench size={45} />
      <h1>{modules[modulo]}</h1>
      <p>
        Este módulo está planificado para una próxima iteración. Por ahora puedes navegar y probar
        las pantallas incluidas.
      </p>
      <Link href="/admin" className="btn btn-primary">
        <ArrowLeft size={17} /> Volver al panel
      </Link>
    </div>
  );
}
