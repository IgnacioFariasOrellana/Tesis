"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type User = {
  id: number;
  nombres: string | null;
  correo: string | null;
  rol: "cliente" | "repartidor" | "admin";
  activo: boolean;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function UserAdminClient({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { session } } = await createClient().auth.getSession();
        if (!session) throw new Error("La sesión venció.");
        const response = await fetch(`${apiUrl}/api/admin/users`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error("No se pudieron cargar los usuarios.");
        if (active) setUsers(await response.json() as User[]);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Error al cargar usuarios.");
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function changeRole(userId: number, role: User["rol"]) {
    setBusyId(userId);
    setError("");
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) throw new Error("La sesión venció.");
      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rol: role }),
      });
      const result = await response.json() as User & { detail?: string };
      if (!response.ok) throw new Error(result.detail || "No se pudo cambiar el rol.");
      setUsers((current) => current.map((user) => user.id === userId ? result : user));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar el rol.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="dashboard-welcome"><div><div className="overline">ACCESOS</div><h1>Usuarios</h1><p>Asigna los roles de cliente, repartidor o administrador a las cuentas registradas.</p></div></div>
      <section className="dashboard-card">
        {error && <p className="danger-text" role="alert">{error}</p>}
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th><th>Rol</th></tr></thead><tbody>
          {users.map((user) => <tr key={user.id}>
            <td>{user.nombres || "Sin nombre"}{user.id === currentUserId ? " (tú)" : ""}</td>
            <td>{user.correo}</td>
            <td>{user.activo ? "Activo" : "Inactivo"}</td>
            <td><select className="input" aria-label={`Rol de ${user.correo}`} value={user.rol} disabled={user.id === currentUserId || busyId === user.id} onChange={(event) => void changeRole(user.id, event.target.value as User["rol"])}>
              <option value="cliente">Cliente</option><option value="repartidor">Repartidor</option><option value="admin">Administrador</option>
            </select></td>
          </tr>)}
        </tbody></table></div>
        {users.length === 0 && !error && <p>Cargando usuarios...</p>}
      </section>
    </>
  );
}
