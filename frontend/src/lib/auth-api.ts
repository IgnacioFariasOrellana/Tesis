import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const apiUrl = process.env.API_URL || "http://localhost:8000";

const getAccessToken = cache(async (): Promise<string> => {
  const supabase = await createClient();
  const { data: claims, error } = await supabase.auth.getClaims();
  if (error || !claims?.claims?.sub) redirect("/cuenta");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/cuenta");
  return session.access_token;
});

export async function getAuthorizedData<T>(path: string): Promise<T> {
  const accessToken = await getAccessToken();
  const request = () =>
    fetch(`${apiUrl}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  let response = await request();
  if ([502, 503, 504].includes(response.status)) response = await request();
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail || `No se pudieron cargar los datos (${response.status})`);
  }
  return (await response.json()) as T;
}
