"""Consulta administrativa de pagos registrados."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_admin
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.pago import list_pagos

router = APIRouter()


def payment_rows() -> list[dict]:
    client = SupabaseClient("SUPABASE_SECRET_KEY")
    rows = list_pagos(client)
    return [{
        "id": row["id"], "orderId": row["id_pedido"],
        "orderNumber": (row.get("pedido") or {}).get("numero_pedido") or f"AL-{row['id_pedido']}",
        "method": row["metodo_pago"], "provider": row["proveedor"],
        "reference": row["referencia_externa"], "amount": float(row["monto"]),
        "status": row["estado"], "paidAt": row["fecha_pago"],
        "createdAt": row["fecha_creacion"],
    } for row in rows]


@router.get("/api/admin/payments")
def payments(_: Annotated[dict, Depends(require_admin)]):
    try:
        return payment_rows()
    except (ConfigurationError, SupabaseError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="No se pudieron consultar los pagos") from exc
