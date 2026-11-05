"""Lecturas de los datos de entrega de pedidos."""

from app.integrations.supabase import SupabaseClient


def for_orders(client: SupabaseClient, ids: list[int]) -> list[dict]:
    if not ids:
        return []
    return client.request("GET", "rest/v1/datos_entrega", query={
        "select": "id_pedido,nombre_destinatario,telefono_destinatario,fecha_entrega,hora_desde,hora_hasta,direccion,referencia_direccion,dedicatoria,instrucciones",
        "id_pedido": f"in.({','.join(map(str, ids))})",
    })
