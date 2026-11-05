"""Insumos y cantidades que componen una unidad de producto."""

from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class SupplySelection(BaseModel):
    insumoId: int = Field(gt=0)
    quantity: Decimal = Field(gt=0, max_digits=12, decimal_places=3)


class ProductSupplies(BaseModel):
    supplies: list[SupplySelection] = Field(min_length=1, max_length=50)

    @field_validator("supplies")
    @classmethod
    def unique_supplies(cls, supplies: list[SupplySelection]) -> list[SupplySelection]:
        if len({item.insumoId for item in supplies}) != len(supplies):
            raise ValueError("Selecciona cada insumo una sola vez")
        return supplies


class ProductSupply(BaseModel):
    insumoId: int
    name: str
    unit: str
    quantity: float
