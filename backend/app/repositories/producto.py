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


def slug_exists(client: SupabaseClient, slug: str) -> bool:
    rows = client.request(
        "GET",
        "rest/v1/producto",
        query={"select": "id", "slug": f"eq.{slug}", "limit": "1"},
    )
    return bool(rows)


def insert_product(client: SupabaseClient, values: dict[str, Any]) -> None:
    client.request("POST", "rest/v1/producto", payload=values)
