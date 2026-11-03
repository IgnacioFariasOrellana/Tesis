"""Rutas y entregas asignadas al repartidor autenticado."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import current_user
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories import despacho, pedido, ruta_reparto
from app.services.pedidos import enrich_orders

router = APIRouter()


@router.get("/api/delivery/routes")
def routes(user: Annotated[dict, Depends(current_user)]):
    if user["rol"] != "repartidor":
        raise HTTPException(status_code=403, detail="Se requiere acceso de repartidor")
    try:
        client = SupabaseClient("SUPABASE_SECRET_KEY")
        rows = ruta_reparto.for_driver(client, user["id"])
        dispatches = despacho.for_routes(client, [row["id"] for row in rows])
        orders = {row["id"]: row for row in enrich_orders(
            client, pedido.by_ids(client, list({row["id_pedido"] for row in dispatches}))
        )}
        return [{
            "id": row["id"], "date": row["fecha_reparto"], "status": row["estado"],
            "stops": [{
                "id": stop["id"], "status": stop["estado"],
                "orderSuggested": stop["orden_sugerido"],
                "orderFinal": stop["orden_final"],
                "departureAt": stop["hora_salida"], "deliveredAt": stop["hora_entrega"],
                "order": orders.get(stop["id_pedido"]),
            } for stop in dispatches if stop["id_ruta"] == row["id"]],
        } for row in rows]
    except (ConfigurationError, SupabaseError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="No se pudieron consultar las rutas") from exc
