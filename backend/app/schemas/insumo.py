"""Datos para crear un insumo del inventario."""

from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class NewInsumo(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    unidad_medida: str = Field(min_length=1, max_length=30)
    stock_actual: Decimal = Field(default=Decimal(0), ge=0, max_digits=12, decimal_places=3)
    stock_minimo: Decimal = Field(default=Decimal(0), ge=0, max_digits=12, decimal_places=3)

    @field_validator("nombre", "unidad_medida", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value
