"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  compact = false,
  onRegisterClick,
  onModeChange,
  onSuccess,
}: {
  compact?: boolean;
  onRegisterClick?: () => void;
  onModeChange?: () => void;
  onSuccess?: () => void;
}) {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setNotice("");
    const supabase = createClient();
    const { data: session, error } = await supabase.auth.signInWithPassword({
      email: String(data.get("email")),
      password: String(data.get("password")),
    });
    if (error) {
      setNotice("Correo o contraseña incorrectos, o correo sin confirmar.");
      setBusy(false);
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from("usuario")
      .select("rol,activo")
      .eq("auth_user_id", session.user.id)
      .single();
    if (profileError || !profile?.activo) {
      await supabase.auth.signOut();
      setNotice("No se encontró un perfil activo. Revisa la migración de usuarios.");
      setBusy(false);
      return;
    }
    onSuccess?.();
    router.replace(
      profile.rol === "admin" ? "/admin" : profile.rol === "repartidor" ? "/repartidor" : "/cuenta",
    );
    router.refresh();
  }
  return (
    <form
      className={compact ? "login-form login-form-compact" : "login-form auth-split-form"}
      onSubmit={onSubmit}
    >
      {compact && (
        <div className="account-card-title">
          <LogIn />
          <div>
            <small>BIENVENIDO DE NUEVO</small>
            <h2>Iniciar sesión</h2>
          </div>
        </div>
      )}
      <label>
        Correo electrónico
        <input
          className="input"
          type="email"
          name="email"
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
          name="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          autoComplete="current-password"
        />
      </label>
      <button className="btn btn-primary btn-full" type="submit" disabled={busy}>
        {busy ? "Ingresando..." : "Ingresar"} <ArrowRight size={17} />
      </button>
      {notice && (
        <p className="form-error" role="status">
          {notice}
        </p>
      )}
      <p className="login-register">
        ¿Aún no tienes perfil?{" "}
        {compact ? (
          <Link href="/registro" onClick={onRegisterClick}>
            Crear perfil
          </Link>
        ) : (
          <button type="button" onClick={onModeChange}>
            Crear perfil
          </button>
        )}
      </p>
    </form>
  );
}
