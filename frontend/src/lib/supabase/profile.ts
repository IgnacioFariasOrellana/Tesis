import { redirect } from "next/navigation";
import { createClient } from "./server";

export type Role = "cliente" | "repartidor" | "admin";
export type Profile = {
  id: number;
  nombres: string | null;
  correo: string | null;
  rol: Role;
  activo: boolean;
};

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const { data: profile } = await supabase
    .from("usuario")
    .select("id,nombres,correo,rol,activo")
    .eq("auth_user_id", data.claims.sub)
    .single();
  return profile?.activo ? (profile as Profile) : null;
}

export async function requireRole(role: Role) {
  const profile = await getProfile();
  if (!profile) redirect("/cuenta");
  if (profile.rol !== role) redirect(profile.rol === "admin" ? "/admin" : profile.rol === "repartidor" ? "/repartidor" : "/cuenta");
  return profile;
}
