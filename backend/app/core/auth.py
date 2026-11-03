"""Protección provisional de escrituras administrativas."""

from hmac import compare_digest

from fastapi import HTTPException

from app.core.config import ConfigurationError, required


def verify_admin_password(supplied: str) -> None:
    try:
        expected = required("ADMIN_PASSWORD")
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Administración no configurada") from exc
    if not compare_digest(supplied.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Contraseña de administración incorrecta")
