"""Variables de entorno que usa FastAPI."""

import os


class ConfigurationError(Exception):
    pass


def required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ConfigurationError(f"Falta configurar {name}")
    return value


def supabase_url() -> str:
    return required("SUPABASE_URL").rstrip("/")
