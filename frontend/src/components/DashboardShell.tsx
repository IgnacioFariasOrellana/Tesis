"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, Truck, Gift, Package, Wallet, Users, Store } from "lucide-react";
const links = [{href:"/admin",label:"Panel general",Icon:BarChart3},{href:"/admin/inventario",label:"Inventario",Icon:Boxes},{href:"/repartidor",label:"Repartidor",Icon:Truck},{href:"/admin/productos",label:"Productos",Icon:Gift},{href:"/admin/pedidos",label:"Pedidos",Icon:Package},{href:"/admin/pagos",label:"Pagos",Icon:Wallet},{href:"/admin/usuarios",label:"Usuarios",Icon:Users}];
export function DashboardShell({children}:{children:React.ReactNode}){
 const path=usePathname();return <div className="dashboard-layout"><aside className="dashboard-sidebar"><Link href="/" className="dashboard-brand"><Image src="/images/logo-allicam.png" width={59} height={44} alt=""/><span><strong>Allicam</strong><small>TALLER & OPERACIONES</small></span></Link><div className="sidebar-caption">SEDE CENTRAL BOUTIQUE</div><nav className="sidebar-nav" aria-label="Módulos de administración">{links.map(({href,label,Icon})=><Link href={href} key={href} className={path===href?"current":""}><Icon size={18}/>{label}</Link>)}</nav><Link href="/" className="sidebar-bottom"><Store size={17}/> Ver Tienda Online ↗</Link></aside><div className="dashboard-main"><div className="dashboard-top"><span className="soft-pill">✿ TURNO ACTIVO: ENVÍOS FLORALES</span><span>● 8 entregas programadas (datos de ejemplo)</span><div className="top-user"><Image src="/images/logo-allicam.png" alt="" width={28} height={28}/> Taller Allicam</div></div><div className="dashboard-content">{children}</div></div></div>;
}
