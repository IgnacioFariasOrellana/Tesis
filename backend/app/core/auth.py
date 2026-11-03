"""Valida la sesión de Supabase y consulta el rol vigente en la base."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException

from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.usuario import get_by_auth_id


def current_user(authorization: Annotated[str | None, Header()] = None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Inicia sesión para continuar")
    token = authorization[7:].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    try:
        auth = SupabaseClient("SUPABASE_PUBLISHABLE_KEY")
        identity = auth.request("GET", "auth/v1/user", headers={"Authorization": f"Bearer {token}"})
        user = get_by_auth_id(SupabaseClient("SUPABASE_SECRET_KEY"), identity["id"])
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except SupabaseError as exc:
        if exc.status in (401, 403):
            raise HTTPException(status_code=401, detail="Sesión inválida o vencida") from exc
        raise HTTPException(status_code=503, detail="No se pudo verificar la sesión") from exc
    except (KeyError, TypeError) as exc:
        raise HTTPException(status_code=503, detail="Respuesta de autenticación inválida") from exc
    if not user or not user["activo"]:
        raise HTTPException(status_code=403, detail="Perfil inactivo o no disponible")
    return user


def require_admin(user: Annotated[dict, Depends(current_user)]) -> dict:
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Se requiere acceso de administración")
    return user
