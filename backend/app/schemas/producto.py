"""Representación pública de productos."""

from dataclasses import dataclass

from pydantic import BaseModel, Field

from app.schemas.producto_insumo import ProductSupply, SupplySelection


class Product(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    occasions: list[str]
    description: str
    price: float
    image: str
    badge: str
    availableToday: bool
    features: list[str]
    supplies: list[ProductSupply] = Field(default_factory=list)


@dataclass(frozen=True)
class NewProduct:
    name: str
    category: str
    description: str
    price: str
    badge: str
    occasions: str
    supplies: list[SupplySelection]
    available_today: bool
