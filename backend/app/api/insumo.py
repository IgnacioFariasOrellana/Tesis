"""Inventario real para administración."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_admin
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.insumo import list_insumos

router = APIRouter()


@router.get("/api/admin/inventory")
def inventory(_: Annotated[dict, Depends(require_admin)]):
    try:
        return list_insumos(SupabaseClient("SUPABASE_SECRET_KEY"))
    except (ConfigurationError, SupabaseError) as exc:
        raise HTTPException(status_code=503, detail="No se pudo consultar el inventario") from exc
