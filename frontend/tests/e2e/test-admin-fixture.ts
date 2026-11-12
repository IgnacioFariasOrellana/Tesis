import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type TemporaryAdmin = {
  id: string;
  email: string;
  password: string;
};

type ProductRecord = {
  id: number;
  id_categoria: number;
  imagen_url: string | null;
};

const allowedEnvironmentKeys = ["SUPABASE_URL", "SUPABASE_SECRET_KEY"] as const;

function loadBackendEnvironment() {
  const missing = allowedEnvironmentKeys.filter((key) => !process.env[key]);
  if (missing.length === 0) return;

  const environmentFile = path.resolve(process.cwd(), "..", ".env");
  if (!existsSync(environmentFile)) return;
  const values = new Map<string, string>();
  for (const sourceLine of readFileSync(environmentFile, "utf8").split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  for (const key of missing) {
    const value = values.get(key);
    if (value) process.env[key] = value;
  }
}

function configuration() {
  loadBackendEnvironment();
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "CP-I1-04 necesita SUPABASE_URL y SUPABASE_SECRET_KEY en el entorno local del backend.",
    );
  }
  return { url, key };
}

async function serviceRequest<T>(
  resource: string,
  options: RequestInit = {},
  allowMissing = false,
): Promise<T | null> {
  const { url, key } = configuration();
  const headers = new Headers(options.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  if (options.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${url}/${resource.replace(/^\//, "")}`, { ...options, headers });
  if (allowMissing && response.status === 404) return null;
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 400);
    throw new Error(`Supabase rechazó la preparación E2E (${response.status}): ${detail}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : null;
}

export async function createTemporaryAdmin(): Promise<TemporaryAdmin> {
  const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const email = `allicam-e2e-${suffix}@example.com`;
  const password = `E2e!${randomUUID()}Aa9`;
  const user = await serviceRequest<{ id: string }>("auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombres: "Prueba E2E",
        apellido_paterno: "Automatizada",
        apellido_materno: "Temporal",
      },
    }),
  });
  if (!user?.id) throw new Error("Supabase no devolvió el identificador del usuario E2E");

  const profiles = await serviceRequest<Array<{ id: number }>>(
    `rest/v1/usuario?auth_user_id=eq.${encodeURIComponent(user.id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ rol: "admin", activo: true }),
    },
  );
  if (!profiles?.length) {
    await serviceRequest("rest/v1/usuario", {
      method: "POST",
      body: JSON.stringify({
        auth_user_id: user.id,
        correo: email,
        nombres: "Prueba E2E",
        apellido_paterno: "Automatizada",
        apellido_materno: "Temporal",
        rol: "admin",
        activo: true,
      }),
    });
  }
  return { id: user.id, email, password };
}

export async function deleteTemporaryAdmin(userId: string) {
  await serviceRequest(`auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  }, true);
}

export async function cleanupTemporaryProduct(slug: string, supplyName?: string) {
  const rows = await serviceRequest<ProductRecord[]>(
    `rest/v1/producto?select=id,id_categoria,imagen_url&slug=eq.${encodeURIComponent(slug)}`,
  );
  const product = rows?.[0];
  if (product) {
    await serviceRequest(`rest/v1/producto?id=eq.${product.id}`, { method: "DELETE" });
    const marker = "/storage/v1/object/public/product-images/";
    if (product.imagen_url?.includes(marker)) {
      const objectName = product.imagen_url.split(marker, 2)[1];
      await serviceRequest(
        `storage/v1/object/product-images/${objectName.split("/").map(encodeURIComponent).join("/")}`,
        { method: "DELETE" },
        true,
      );
    }
    await serviceRequest(`rest/v1/categoria?id=eq.${product.id_categoria}`, { method: "DELETE" });
  }
  if (supplyName) {
    await serviceRequest(
      `rest/v1/insumo?nombre=eq.${encodeURIComponent(supplyName)}`,
      { method: "DELETE" },
    );
  }
}

