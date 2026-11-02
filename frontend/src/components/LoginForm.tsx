"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, LogIn } from "lucide-react";

export function LoginForm({
  compact = false,
  onRegisterClick,
}: {
  compact?: boolean;
  onRegisterClick?: () => void;
}) {
  const [notice, setNotice] = useState("");
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("El inicio de sesión aún no está disponible. No se enviaron ni guardaron tus datos.");
  }
  return (
    <form
      className={compact ? "login-form login-form-compact" : "account-card login-form"}
      onSubmit={onSubmit}
    >
      <div className="account-card-title">
        <LogIn />
        <div>
          <small>BIENVENIDO DE NUEVO</small>
          <h2>Iniciar sesión</h2>
        </div>
      </div>
      <label>
        Correo electrónico
        <input
          className="input"
          type="email"
          required
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
        />
      </label>
      <label>
        Contraseña
        <input
          className="input"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          autoComplete="current-password"
        />
      </label>
      <button className="btn btn-primary btn-full" type="submit">
        Ingresar <ArrowRight size={17} />
      </button>
      {notice && (
        <p className="form-error" role="status">
          {notice}
        </p>
      )}
      <p className="login-register">
        ¿Aún no tienes perfil?{" "}
        <Link href="/registro" onClick={onRegisterClick}>
          Crear perfil
        </Link>
      </p>
      <p className="login-demo-hint">
        Acceso de demostración: la autenticación todavía no está conectada.
      </p>
    </form>
  );
}
