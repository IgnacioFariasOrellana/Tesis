"""Lecturas de existencias de insumos."""

from app.integrations.supabase import SupabaseClient


def list_insumos(client: SupabaseClient) -> list[dict]:
    return client.request("GET", "rest/v1/insumo", query={
        "select": "id,nombre,unidad_medida,stock_actual,stock_minimo,activo",
        "activo": "eq.true", "order": "nombre.asc", "limit": "1000",
    })
