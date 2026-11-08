"""Consultas de la tabla producto y su categoría."""

from typing import Any

from app.integrations.supabase import SupabaseClient
from app.schemas.producto import Product

PRODUCT_COLUMNS = (
    "id,slug,nombre,descripcion,precio,imagen_url,etiqueta,"
    "ocasiones,caracteristicas,disponible_hoy,categoria(nombre)"
)


def public_products(client: SupabaseClient, slug: str | None = None) -> list[Product]:
    query = {
        "select": PRODUCT_COLUMNS,
        "activo": "eq.true",
        "disponible": "eq.true",
        "order": "id.asc",
    }
    if slug is not None:
        query.update({"slug": f"eq.{slug}", "limit": "1"})
    rows = client.request("GET", "rest/v1/producto", query=query)
    return [
        Product(
            id=str(row["id"]),
            slug=row["slug"],
            name=row["nombre"],
            category=row["categoria"]["nombre"],
            occasions=row["ocasiones"],
            description=row["descripcion"],
            price=row["precio"],
            image=row["imagen_url"] or "/images/logo-allicam.png",
            badge=row["etiqueta"],
            availableToday=row["disponible_hoy"],
            features=row["caracteristicas"],
        )
        for row in rows
    ]


def slug_exists(client: SupabaseClient, slug: str, exclude_id: int | None = None) -> bool:
    query = {"select": "id", "slug": f"eq.{slug}", "limit": "1"}
    if exclude_id is not None:
        query["id"] = f"neq.{exclude_id}"
    rows = client.request(
        "GET",
        "rest/v1/producto",
        query=query,
    )
    return bool(rows)


def product_for_update(client: SupabaseClient, product_id: int) -> dict | None:
    rows = client.request("GET", "rest/v1/producto", query={
        "select": "id,slug,imagen_url,disponible_hoy,activo",
        "id": f"eq.{product_id}", "limit": "1",
    })
    return rows[0] if rows else None


def images_by_ids(client: SupabaseClient, ids: list[int]) -> dict[int, str | None]:
    if not ids:
        return {}
    rows = client.request("GET", "rest/v1/producto", query={
        "select": "id,imagen_url", "id": f"in.({','.join(map(str, ids))})",
    })
    return {row["id"]: row["imagen_url"] for row in rows}


def insert_product(client: SupabaseClient, values: dict[str, Any], supplies: list[dict]) -> None:
    client.request("POST", "rest/v1/rpc/crear_producto_allicam", payload={
        "p_producto": values, "p_insumos": supplies,
    })


def update_product_row(
    client: SupabaseClient, product_id: int, values: dict[str, Any], supplies: list[dict]
) -> None:
    client.request("POST", "rest/v1/rpc/actualizar_producto_allicam", payload={
        "p_producto": product_id, "p_datos": values, "p_insumos": supplies,
    })
