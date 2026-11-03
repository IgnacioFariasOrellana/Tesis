import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const apiUrl = process.env.API_URL || "http://localhost:8000";

export async function getAuthorizedData<T>(path: string): Promise<T> {
  const supabase = await createClient();
  const { data: claims, error } = await supabase.auth.getClaims();
  if (error || !claims?.claims?.sub) redirect("/cuenta");
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/cuenta");
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`No se pudieron cargar los datos (${response.status})`);
  return await response.json() as T;
}
