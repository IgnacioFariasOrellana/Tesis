"""Datos necesarios para registrar un pedido desde el checkout."""

from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class OrderItem(BaseModel):
    productId: int = Field(gt=0)
    quantity: int = Field(ge=1, le=20)
    expectedUnitPrice: float = Field(ge=0, allow_inf_nan=False)
    balloon: bool = False
    treat: bool = False
    dedication: str = Field(default="", max_length=280)


class NewOrder(BaseModel):
    requestId: UUID
    recipient: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=30)
    address: str = Field(min_length=5, max_length=250)
    comuna: str = Field(min_length=2, max_length=100)
    instructions: str = Field(default="", max_length=2000)
    deliveryDate: date
    deliverySlot: Literal["07:30 - 08:30", "08:30 - 10:00", "10:00 - 11:30"]
    items: list[OrderItem] = Field(min_length=1, max_length=20)
