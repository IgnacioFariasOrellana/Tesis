"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, UserRound } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useEffect, useRef, useState } from "react";
import { LoginForm } from "@/components/LoginForm";

const links = [
  { href: "/", text: "Inicio" },
  { href: "/catalogo", text: "Catálogo" },
  { href: "/mis-pedidos", text: "Mis pedidos" },
];

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!loginRef.current?.contains(event.target as Node)) setLoginOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLoginOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header className={`site-header ${pathname === "/catalogo" ? "catalog-header" : ""}`}>
      <div className="container nav-wrap">
        <Link
          href="/"
          className="brand"
          onClick={() => {
            setOpen(false);
            setLoginOpen(false);
          }}
        >
          <Image
            src="/images/logo-allicam.png"
            alt="Logo Allicam"
            width={56}
            height={45}
            className="brand-logo"
          />
          <span>
            <strong>Allicam</strong>
            <small>DETALLITOS HECHOS CON AMOR</small>
          </span>
        </Link>
        <nav className={`nav-links ${open ? "nav-open" : ""}`} aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              key={link.href}
              className={pathname === link.href ? "active" : ""}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.text}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link href="/carrito" className="cart-link" aria-label={`Carrito con ${count} productos`}>
            <ShoppingBag size={16} />
            <span className="cart-label">Carrito</span>
            <span>({count})</span>
          </Link>
          <div className="login-menu" ref={loginRef}>
            <button
              type="button"
              className="user-link"
              aria-label="Iniciar sesión"
              aria-expanded={loginOpen}
              aria-controls="login-dropdown"
              onClick={() => {
                setLoginOpen((value) => !value);
                setOpen(false);
              }}
            >
              <UserRound size={19} />
            </button>
            {loginOpen && (
              <div className="login-dropdown" id="login-dropdown">
                <LoginForm compact onRegisterClick={() => setLoginOpen(false)} />
              </div>
            )}
          </div>
          <button
            className="mobile-menu icon-button"
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => {
              setOpen(!open);
              setLoginOpen(false);
            }}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
