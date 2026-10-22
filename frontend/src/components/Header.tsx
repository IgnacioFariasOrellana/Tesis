"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, UserRound } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useState } from "react";

const links = [{href:"/",text:"Inicio"},{href:"/catalogo",text:"Catálogo"},{href:"/mis-pedidos",text:"Mis pedidos"},{href:"/cuenta",text:"Cuenta"}];
export function Header() {
 const {count}=useCart(); const pathname=usePathname(); const [open,setOpen]=useState(false);
 return <header className="site-header"><div className="container nav-wrap">
   <Link href="/" className="brand" onClick={()=>setOpen(false)}><Image src="/images/logo-allicam.png" alt="Logo Allicam" width={56} height={45} className="brand-logo"/><span><strong>Allicam</strong><small>DETALLITOS HECHOS CON AMOR</small></span></Link>
   <nav className={`nav-links ${open?"nav-open":""}`} aria-label="Navegación principal">{links.map(link=><Link key={link.href} className={pathname===link.href?"active":""} href={link.href} onClick={()=>setOpen(false)}>{link.text}</Link>)}</nav>
   <div className="nav-actions"><Link href="/carrito" className="cart-link"><ShoppingBag size={16}/> Carrito ({count})</Link><Link href="/cuenta" className="user-link" aria-label="Ir a mi cuenta"><UserRound size={19}/></Link><button className="mobile-menu icon-button" aria-label="Abrir menú" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div>
 </div></header>;
}
