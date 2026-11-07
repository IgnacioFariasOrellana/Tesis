"""Lecturas de existencias de insumos."""

from app.integrations.supabase import SupabaseClient
from app.schemas.insumo import NewInsumo, RestockInsumo


def list_insumos(client: SupabaseClient) -> list[dict]:
    return client.request("GET", "rest/v1/insumo", query={
        "select": "id,nombre,unidad_medida,stock_actual,stock_minimo,activo",
        "activo": "eq.true", "order": "nombre.asc", "limit": "1000",
    })


def create_insumo(client: SupabaseClient, data: NewInsumo) -> dict:
    values = data.model_dump(mode="json")
    return client.request("POST", "rest/v1/rpc/crear_insumo_allicam", payload={
        f"p_{key}": value for key, value in values.items()
    })


def restock_insumo(client: SupabaseClient, insumo_id: int, data: RestockInsumo) -> dict:
    return client.request("POST", "rest/v1/rpc/reponer_insumo_allicam", payload={
        "p_insumo": insumo_id,
        "p_cantidad": data.model_dump(mode="json")["cantidad"],
    })
