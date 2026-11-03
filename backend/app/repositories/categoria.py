"""Consultas de la tabla categoria."""

from app.integrations.supabase import SupabaseClient, SupabaseError


def ensure_category(client: SupabaseClient, name: str) -> int:
    rows = client.request(
        "POST",
        "rest/v1/categoria",
        query={"on_conflict": "nombre"},
        payload={"nombre": name, "activo": True},
        headers={"Prefer": "resolution=merge-duplicates,return=representation"},
    )
    if not isinstance(rows, list) or not rows or not isinstance(rows[0].get("id"), int):
        raise SupabaseError()
    return rows[0]["id"]
