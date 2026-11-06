"""Carga agrupada de los datos necesarios para el panel administrativo."""

from concurrent.futures import ThreadPoolExecutor
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.pago import payment_rows
from app.api.pedido import _orders
from app.core.auth import require_admin
from app.integrations.supabase import SupabaseClient
from app.repositories.insumo import list_insumos
from app.services.productos import catalog_products

router = APIRouter()


def _inventory_rows() -> list[dict]:
    return list_insumos(SupabaseClient("SUPABASE_SECRET_KEY"))


@router.get("/api/admin/overview")
def admin_overview(_: Annotated[dict, Depends(require_admin)]):
    """Evita repetir autenticación y espera las consultas independientes en paralelo."""
    with ThreadPoolExecutor(max_workers=4) as executor:
        orders_future = executor.submit(_orders)
        payments_future = executor.submit(payment_rows)
        inventory_future = executor.submit(_inventory_rows)
        products_future = executor.submit(catalog_products)
        return {
            "orders": orders_future.result(),
            "payments": payments_future.result(),
            "inventory": inventory_future.result(),
            "products": products_future.result(),
        }
