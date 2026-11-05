"""Consulta administrativa de pagos registrados."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_admin
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.pago import list_pagos
from app.repositories.pedido import by_ids

router = APIRouter()


@router.get("/api/admin/payments")
def payments(_: Annotated[dict, Depends(require_admin)]):
    try:
        client = SupabaseClient("SUPABASE_SECRET_KEY")
        rows = list_pagos(client)
        numbers = {row["id"]: row["numero_pedido"] or f"AL-{row['id']}"
                   for row in by_ids(client, list({row["id_pedido"] for row in rows}))}
        return [{
            "id": row["id"], "orderId": row["id_pedido"],
            "orderNumber": numbers.get(row["id_pedido"], f"AL-{row['id_pedido']}"),
            "method": row["metodo_pago"], "provider": row["proveedor"],
            "reference": row["referencia_externa"], "amount": float(row["monto"]),
            "status": row["estado"], "paidAt": row["fecha_pago"],
            "createdAt": row["fecha_creacion"],
        } for row in rows]
    except (ConfigurationError, SupabaseError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="No se pudieron consultar los pagos") from exc
