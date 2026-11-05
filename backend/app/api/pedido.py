"""Consultas de pedidos propios y del taller."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import current_user, require_admin
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.pedido import list_pedidos
from app.services.pedidos import enrich_orders
from app.schemas.pedido import NewOrder

router = APIRouter()


def _orders(user_id: int | None = None):
    try:
        client = SupabaseClient("SUPABASE_SECRET_KEY")
        return enrich_orders(client, list_pedidos(client, user_id))
    except (ConfigurationError, SupabaseError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="No se pudieron consultar los pedidos") from exc


@router.get("/api/orders")
def own_orders(user: Annotated[dict, Depends(current_user)]):
    return _orders(user["id"])


@router.get("/api/admin/orders")
def admin_orders(_: Annotated[dict, Depends(require_admin)]):
    return _orders()


@router.post("/api/orders", status_code=201)
def create_order(order: NewOrder, user: Annotated[dict, Depends(current_user)]):
    time_from, time_to = order.deliverySlot.split(" - ")
    try:
        return SupabaseClient("SUPABASE_SECRET_KEY").request(
            "POST", "rest/v1/rpc/crear_pedido_allicam", payload={
                "p_usuario": user["id"],
                "p_destinatario": order.recipient.strip(),
                "p_telefono": order.phone.strip(),
                "p_direccion": f"{order.address.strip()}, {order.comuna.strip()}",
                "p_instrucciones": order.instructions.strip(),
                "p_fecha_entrega": order.deliveryDate.isoformat(),
                "p_hora_desde": time_from,
                "p_hora_hasta": time_to,
                "p_items": [item.model_dump() for item in order.items],
                "p_request_id": str(order.requestId),
            },
        )
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except SupabaseError as exc:
        if exc.status == 404:
            raise HTTPException(status_code=503, detail="Falta aplicar la migración de pedidos") from exc
        if exc.status == 400:
            raise HTTPException(status_code=422, detail="Revisa la fecha, los productos y los datos de entrega") from exc
        raise HTTPException(status_code=503, detail="No se pudo registrar el pedido") from exc
