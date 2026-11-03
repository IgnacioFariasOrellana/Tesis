"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/profile";

export function AccountProfile({ profile }: { profile: Profile }) {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/cuenta");
    router.refresh();
  }
  return (
    <div className="account-card">
      <h2>Tu perfil</h2>
      <p><strong>{profile.nombres || "Usuario"}</strong></p>
      <p>{profile.correo}</p>
      <p>Rol: {profile.rol === "cliente" ? "Cliente" : profile.rol === "admin" ? "Administración" : "Repartidor"}</p>
      {profile.rol === "admin" && <p><Link className="text-link" href="/admin">Ir al panel de administración</Link></p>}
      {profile.rol === "repartidor" && <p><Link className="text-link" href="/repartidor">Ir al panel de reparto</Link></p>}
      <button className="btn btn-outline" type="button" onClick={signOut}>Cerrar sesión</button>
    </div>
  );
}
