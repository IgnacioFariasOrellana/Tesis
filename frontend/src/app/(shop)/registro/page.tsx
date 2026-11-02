"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [notice, setNotice] = useState("");
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    if (password !== confirm) {
      setNotice("Las contraseñas no coinciden.");
      return;
    }
    setNotice(
      "La creación de perfiles aún no está disponible. No se enviaron ni guardaron tus datos.",
    );
  }
  return (
    <div className="account-bg">
      <div className="container account-wrap account-wrap-narrow">
        <div className="account-heading">
          <Image
            src="/images/logo-allicam.png"
            alt="Allicam"
            width={180}
            height={90}
            style={{ objectFit: "contain" }}
          />
          <span className="eyebrow">✿ UN DETALLE HECHO PARA TI</span>
          <h1>Crea tu perfil</h1>
          <p>Prepara tus datos para una futura experiencia de compra personalizada.</p>
        </div>
        <form className="account-card" onSubmit={onSubmit}>
          <div className="account-card-title">
            <UserPlus />
            <div>
              <small>NUEVO EN ALLICAM</small>
              <h2>Tus datos</h2>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Nombre y apellido
              <input
                className="input"
                name="name"
                required
                autoComplete="name"
                placeholder="Ej: Camila Morales"
              />
            </label>
            <label>
              Teléfono móvil
              <input
                className="input"
                type="tel"
                name="phone"
                required
                autoComplete="tel"
                placeholder="+56 9 1123 4567"
              />
            </label>
          </div>
          <label>
            Correo electrónico
            <input
              className="input"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="camila@ejemplo.com"
            />
          </label>
          <div className="form-grid">
            <label>
              Crear contraseña
              <input
                className="input"
                name="password"
                required
                minLength={8}
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
              />
            </label>
            <label>
              Confirmar contraseña
              <input
                className="input"
                name="confirmPassword"
                required
                minLength={8}
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
              />
            </label>
          </div>
          <button className="btn btn-primary btn-full" type="submit">
            Crear perfil <ArrowRight size={17} />
          </button>
          {notice && (
            <p className="form-error" role="status">
              {notice}
            </p>
          )}
          <p className="login-register">
            ¿Ya tienes un perfil? <Link href="/cuenta">Iniciar sesión</Link>
          </p>
          <p className="login-demo-hint">
            Registro de demostración: los perfiles todavía no se guardan.
          </p>
        </form>
      </div>
    </div>
  );
}
