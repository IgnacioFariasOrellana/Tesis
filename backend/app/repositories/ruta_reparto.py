"""Lecturas de rutas asignadas a repartidores."""

from app.integrations.supabase import SupabaseClient


def for_driver(client: SupabaseClient, user_id: int) -> list[dict]:
    return client.request("GET", "rest/v1/ruta_reparto", query={
        "select": "id,id_repartidor,fecha_reparto,estado",
        "id_repartidor": f"eq.{user_id}", "order": "fecha_reparto.desc", "limit": "30",
    })
