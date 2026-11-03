"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, Boxes, Truck, Gift, Package, Wallet, Users, Store } from "lucide-react";
const adminLinks = [
  { href: "/admin", label: "Panel general", Icon: BarChart3 },
  { href: "/admin/inventario", label: "Inventario", Icon: Boxes },
  { href: "/admin/productos", label: "Productos", Icon: Gift },
  { href: "/admin/pedidos", label: "Pedidos", Icon: Package },
  { href: "/admin/pagos", label: "Pagos", Icon: Wallet },
  { href: "/admin/usuarios", label: "Usuarios", Icon: Users },
];
const deliveryLinks = [{ href: "/repartidor", label: "Mi ruta", Icon: Truck }];
export function DashboardShell({ children, role }: { children: React.ReactNode; role: "admin" | "repartidor" }) {
  const path = usePathname();
  const router = useRouter();
  const links = role === "admin" ? adminLinks : deliveryLinks;
  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/cuenta");
    router.refresh();
  }
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link href="/" className="dashboard-brand">
          <Image src="/images/logo-allicam.png" width={59} height={44} alt="" />
          <span>
            <strong>Allicam</strong>
            <small>TALLER & OPERACIONES</small>
          </span>
        </Link>
        <div className="sidebar-caption">{role === "admin" ? "SEDE CENTRAL BOUTIQUE" : "PANEL DE REPARTO"}</div>
        <nav className="sidebar-nav" aria-label="Módulos de administración">
          {links.map(({ href, label, Icon }) => (
            <Link href={href} key={href} className={path === href ? "current" : ""}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/cuenta" className="sidebar-bottom">Mi cuenta</Link>
        <button type="button" className="sidebar-bottom" onClick={signOut}>Cerrar sesión</button>
        <Link href="/" className="sidebar-bottom">
          <Store size={17} /> Ver Tienda Online ↗
        </Link>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-top">
          <span className="soft-pill">{role === "admin" ? "ADMINISTRACIÓN" : "REPARTO"}</span>
          <span>Panel de {role === "admin" ? "administración" : "repartidores"}</span>
          <Link href="/cuenta" className="top-user">
            <Image src="/images/logo-allicam.png" alt="" width={28} height={28} /> Taller Allicam
          </Link>
        </div>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
