"""Lectura pública y alta administrativa de productos."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.core.auth import require_admin
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.producto import public_products
from app.schemas.producto import NewProduct, Product
from app.services.productos import MAX_IMAGE_BYTES, ProductError, create_product

router = APIRouter()


@router.get("/api/products", response_model=list[Product])
def list_products():
    try:
        return public_products(SupabaseClient("SUPABASE_PUBLISHABLE_KEY"))
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except (SupabaseError, KeyError, TypeError, ValidationError) as exc:
        raise HTTPException(status_code=503, detail="No se pudo consultar el catálogo") from exc


@router.get("/api/products/{slug}", response_model=Product)
def get_product(slug: str):
    try:
        products = public_products(SupabaseClient("SUPABASE_PUBLISHABLE_KEY"), slug)
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except (SupabaseError, KeyError, TypeError, ValidationError) as exc:
        raise HTTPException(status_code=503, detail="No se pudo consultar el catálogo") from exc
    if not products:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return products[0]


@router.post("/api/admin/products", status_code=201)
def add_product(
    _: Annotated[dict, Depends(require_admin)],
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    badge: str = Form(""),
    occasions: str = Form(""),
    features: str = Form(""),
    available_today: str | None = Form(None, alias="availableToday"),
    photo: UploadFile = File(...),
):
    image = photo.file.read(MAX_IMAGE_BYTES + 1)
    data = NewProduct(
        name=name,
        category=category,
        description=description,
        price=price,
        badge=badge,
        occasions=occasions,
        features=features,
        available_today=available_today == "on",
    )
    try:
        return create_product(data, image)
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except ProductError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.message) from exc
