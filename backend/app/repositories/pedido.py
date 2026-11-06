"""Lecturas de pedidos."""

from app.integrations.supabase import SupabaseClient

SELECT = (
    "id,id_usuario,numero_pedido,estado_actual,subtotal,costo_entrega,total,"
    "fecha_creacion,fecha_actualizacion,"
    "detalle_pedido(id,id_producto,nombre_producto,cantidad,precio_unitario,subtotal,"
    "producto(imagen_url)),"
    "datos_entrega(nombre_destinatario,telefono_destinatario,fecha_entrega,hora_desde,"
    "hora_hasta,direccion,dedicatoria,instrucciones)"
)


def list_pedidos(client: SupabaseClient, user_id: int | None = None) -> list[dict]:
    query = {"select": SELECT, "order": "fecha_creacion.desc", "limit": "200"}
    if user_id is not None:
        query["id_usuario"] = f"eq.{user_id}"
    return client.request("GET", "rest/v1/pedido", query=query)


def by_ids(client: SupabaseClient, ids: list[int]) -> list[dict]:
    if not ids:
        return []
    return client.request("GET", "rest/v1/pedido", query={
        "select": SELECT, "id": f"in.({','.join(map(str, ids))})",
    })
