"""Representación pública de productos."""

from dataclasses import dataclass

from pydantic import BaseModel


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


@dataclass(frozen=True)
class NewProduct:
    name: str
    category: str
    description: str
    price: str
    badge: str
    occasions: str
    features: str
    available_today: bool
