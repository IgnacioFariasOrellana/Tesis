"""Lectura y asignación de insumos mediante la tabla producto_insumo."""

from app.integrations.supabase import SupabaseClient
from app.schemas.producto_insumo import ProductSupplies


def for_products(client: SupabaseClient, ids: list[int]) -> list[dict]:
    if not ids:
        return []
    rows: list[dict] = []
    # Una consulta pequeña por grupo evita URLs demasiado largas.
    for start in range(0, len(ids), 20):
        rows.extend(client.request("GET", "rest/v1/producto_insumo", query={
            "select": "id_producto,id_insumo,cantidad_requerida,insumo(nombre,unidad_medida)",
            "id_producto": f"in.({','.join(map(str, ids[start:start + 20]))})",
            "order": "id_insumo.asc",
        }))
    return rows


def replace_supplies(client: SupabaseClient, product_id: int, data: ProductSupplies) -> None:
    client.request("POST", "rest/v1/rpc/asignar_insumos_producto_allicam", payload={
        "p_producto": product_id,
        "p_insumos": data.model_dump(mode="json")["supplies"],
    })
