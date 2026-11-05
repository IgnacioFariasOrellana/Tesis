"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    if (password !== confirm) {
      setNotice("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setNotice("");
    const data = new FormData(form);
    const supabase = createClient();
    const { data: result, error } = await supabase.auth.signUp({
      email: String(data.get("email")),
      password,
      options: {
        data: {
          nombres: String(data.get("nombres")).trim(),
          apellido_paterno: String(data.get("apellido_paterno")).trim(),
          apellido_materno: String(data.get("apellido_materno")).trim(),
          telefono: String(data.get("phone")).trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setBusy(false);
    if (error) {
      setNotice(error.message);
      return;
    }
    if (!result.session) {
      setNotice("Revisa tu correo y confirma tu cuenta para iniciar sesión.");
      return;
    }
    router.replace("/cuenta");
    router.refresh();
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
          <p>Crea tu cuenta de cliente para comprar y consultar tus pedidos.</p>
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
              Nombres
              <input
                className="input"
                name="nombres"
                required
                autoComplete="given-name"
                placeholder="Ej: Camila Fernanda"
              />
            </label>
            <label>
              Apellido paterno
              <input
                className="input"
                name="apellido_paterno"
                required
                autoComplete="family-name"
                placeholder="Ej: Morales"
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Apellido materno <span className="optional-label">(opcional)</span>
              <input
                className="input"
                name="apellido_materno"
                placeholder="Ej: Rojas"
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
          <button className="btn btn-primary btn-full" type="submit" disabled={busy}>
            {busy ? "Creando perfil..." : "Crear perfil"} <ArrowRight size={17} />
          </button>
          {notice && (
            <p className="form-error" role="status">
              {notice}
            </p>
          )}
          <p className="login-register">
            ¿Ya tienes un perfil? <Link href="/cuenta">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
