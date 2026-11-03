"""Consultas de perfiles y roles de usuario."""

from app.integrations.supabase import SupabaseClient

USER_COLUMNS = "id,auth_user_id,nombres,correo,telefono,rol,activo"


def get_by_auth_id(client: SupabaseClient, auth_id: str) -> dict | None:
    rows = client.request("GET", "rest/v1/usuario", query={
        "select": USER_COLUMNS, "auth_user_id": f"eq.{auth_id}", "limit": "1"
    })
    return rows[0] if rows else None


def list_users(client: SupabaseClient) -> list[dict]:
    return client.request("GET", "rest/v1/usuario", query={
        "select": USER_COLUMNS, "auth_user_id": "not.is.null", "order": "id.asc"
    })


def update_role(client: SupabaseClient, user_id: int, role: str) -> dict | None:
    rows = client.request("PATCH", "rest/v1/usuario", query={
        "id": f"eq.{user_id}", "select": USER_COLUMNS
    }, payload={"rol": role}, headers={"Prefer": "return=representation"})
    return rows[0] if rows else None
