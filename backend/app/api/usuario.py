"""Gestión de roles, disponible solo para administradores."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import require_admin
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.usuario import list_users, update_role

router = APIRouter()


class RoleChange(BaseModel):
    rol: Literal["cliente", "repartidor", "admin"]


@router.get("/api/admin/users")
def users(_: Annotated[dict, Depends(require_admin)]):
    try:
        return list_users(SupabaseClient("SUPABASE_SECRET_KEY"))
    except (ConfigurationError, SupabaseError) as exc:
        raise HTTPException(status_code=503, detail="No se pudieron consultar los usuarios") from exc


@router.patch("/api/admin/users/{user_id}/role")
def change_role(user_id: int, change: RoleChange, admin: Annotated[dict, Depends(require_admin)]):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="No puedes cambiar tu propio rol")
    try:
        user = update_role(SupabaseClient("SUPABASE_SECRET_KEY"), user_id, change.rol)
    except (ConfigurationError, SupabaseError) as exc:
        raise HTTPException(status_code=503, detail="No se pudo actualizar el rol") from exc
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
