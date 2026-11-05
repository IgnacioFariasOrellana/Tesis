import { createClient } from "@/lib/supabase/client";

export async function adminRequest<T>(path: string, options: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  if (!session) throw new Error("La sesión venció. Vuelve a iniciar sesión.");
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${path}`,
    {
      ...options,
      headers,
    },
  );
  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Revisa los campos y las cantidades ingresadas.",
    );
  }
  return result as T;
}
