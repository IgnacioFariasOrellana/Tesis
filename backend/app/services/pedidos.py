"""Combina pedido, detalle y entrega para las pantallas."""

from app.integrations.supabase import SupabaseClient
from app.repositories import datos_entrega, detalle_pedido, producto


def enrich_orders(client: SupabaseClient, rows: list[dict]) -> list[dict]:
    ids = [row["id"] for row in rows]
    details = detalle_pedido.for_orders(client, ids)
    delivery = {row["id_pedido"]: row for row in datos_entrega.for_orders(client, ids)}
    images = producto.images_by_ids(client, list({row["id_producto"] for row in details}))
    items: dict[int, list[dict]] = {id_: [] for id_ in ids}
    for row in details:
        items[row["id_pedido"]].append({
            "productId": row["id_producto"],
            "name": row["nombre_producto"] or "Producto",
            "quantity": row["cantidad"],
            "unitPrice": float(row["precio_unitario"]),
            "subtotal": float(row["subtotal"]),
            "image": images.get(row["id_producto"]),
        })
    return [{
        "id": row["id"],
        "number": row["numero_pedido"] or f"AL-{row['id']}",
        "userId": row["id_usuario"],
        "status": row["estado_actual"] or "pendiente",
        "subtotal": float(row["subtotal"]),
        "shipping": float(row["costo_entrega"]),
        "total": float(row["total"]),
        "createdAt": row["fecha_creacion"],
        "updatedAt": row["fecha_actualizacion"],
        "recipient": delivery.get(row["id"], {}).get("nombre_destinatario"),
        "phone": delivery.get(row["id"], {}).get("telefono_destinatario"),
        "address": delivery.get(row["id"], {}).get("direccion"),
        "deliveryDate": delivery.get(row["id"], {}).get("fecha_entrega"),
        "timeFrom": delivery.get(row["id"], {}).get("hora_desde"),
        "timeTo": delivery.get(row["id"], {}).get("hora_hasta"),
        "instructions": delivery.get(row["id"], {}).get("instrucciones"),
        "dedication": delivery.get(row["id"], {}).get("dedicatoria"),
        "items": items.get(row["id"], []),
    } for row in rows]
