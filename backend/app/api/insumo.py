"""Inventario real para administración."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_admin
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.insumo import create_insumo, list_insumos, restock_insumo
from app.schemas.insumo import NewInsumo, RestockInsumo

router = APIRouter()


@router.get("/api/admin/inventory")
def inventory(_: Annotated[dict, Depends(require_admin)]):
    try:
        return list_insumos(SupabaseClient("SUPABASE_SECRET_KEY"))
    except (ConfigurationError, SupabaseError) as exc:
        raise HTTPException(status_code=503, detail="No se pudo consultar el inventario") from exc


@router.post("/api/admin/inventory")
def add_insumo(data: NewInsumo, _: Annotated[dict, Depends(require_admin)]):
    try:
        return create_insumo(SupabaseClient("SUPABASE_SECRET_KEY"), data)
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except SupabaseError as exc:
        if exc.status == 404:
            raise HTTPException(status_code=503, detail="Falta aplicar la migración 004 de insumos") from exc
        if exc.status in (400, 409):
            raise HTTPException(status_code=422, detail="Revisa los datos; un insumo con ese nombre y unidad podría estar inactivo") from exc
        raise HTTPException(status_code=503, detail="No se pudo guardar el insumo") from exc


@router.patch("/api/admin/inventory/{insumo_id}/restock")
def restock(
    insumo_id: int,
    data: RestockInsumo,
    _: Annotated[dict, Depends(require_admin)],
):
    if insumo_id < 1:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    try:
        item = restock_insumo(SupabaseClient("SUPABASE_SECRET_KEY"), insumo_id, data)
        return {"item": item}
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except SupabaseError as exc:
        if exc.status == 404:
            raise HTTPException(status_code=503, detail="Falta aplicar la migración 005 de reposición") from exc
        if exc.status == 400:
            raise HTTPException(status_code=422, detail="Revisa el insumo y la cantidad de reposición") from exc
        raise HTTPException(status_code=503, detail="No se pudo registrar la reposición") from exc
