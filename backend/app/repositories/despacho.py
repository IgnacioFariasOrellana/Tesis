"""Lecturas de despachos asignados a rutas."""

from app.integrations.supabase import SupabaseClient


def for_routes(client: SupabaseClient, ids: list[int]) -> list[dict]:
    if not ids:
        return []
    return client.request("GET", "rest/v1/despacho", query={
        "select": "id,id_pedido,id_ruta,orden_sugerido,orden_final,estado,hora_salida,hora_entrega",
        "id_ruta": f"in.({','.join(map(str, ids))})", "order": "orden_sugerido.asc.nullslast",
    })
