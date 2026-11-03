"""Lecturas de los productos incluidos en pedidos."""

from app.integrations.supabase import SupabaseClient


def for_orders(client: SupabaseClient, ids: list[int]) -> list[dict]:
    if not ids:
        return []
    return client.request("GET", "rest/v1/detalle_pedido", query={
        "select": "id,id_pedido,id_producto,nombre_producto,cantidad,precio_unitario,subtotal",
        "id_pedido": f"in.({','.join(map(str, ids))})", "order": "id.asc",
    })
