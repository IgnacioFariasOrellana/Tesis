"""Lectura pública y alta administrativa de productos."""

import json
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.core.auth import require_admin
from app.core.config import ConfigurationError
from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.producto_insumo import replace_supplies
from app.schemas.producto_insumo import ProductSupplies
from app.schemas.producto import NewProduct, Product
from app.services.productos import (
    MAX_IMAGE_BYTES,
    ProductError,
    catalog_products,
    create_product,
    invalidate_catalog_cache,
)

router = APIRouter()


@router.get("/api/products", response_model=list[Product])
def list_products():
    try:
        return catalog_products()
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except (SupabaseError, KeyError, TypeError, ValidationError) as exc:
        raise HTTPException(status_code=503, detail="No se pudo consultar el catálogo") from exc


@router.get("/api/products/{slug}", response_model=Product)
def get_product(slug: str):
    try:
        products = catalog_products(slug)
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
    supplies: str = Form(...),
    available_today: str | None = Form(None, alias="availableToday"),
    photo: UploadFile = File(...),
):
    try:
        selection = ProductSupplies(supplies=json.loads(supplies))
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail="Selecciona insumos sin repetir y cantidades mayores que cero, con hasta 3 decimales") from exc
    image = photo.file.read(MAX_IMAGE_BYTES + 1)
    data = NewProduct(
        name=name,
        category=category,
        description=description,
        price=price,
        badge=badge,
        occasions=occasions,
        supplies=selection.supplies,
        available_today=available_today == "on",
    )
    try:
        return create_product(data, image)
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except ProductError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.message) from exc


@router.patch("/api/admin/products/{product_id}/supplies")
def update_supplies(product_id: int, data: ProductSupplies, _: Annotated[dict, Depends(require_admin)]):
    if product_id < 1:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    try:
        replace_supplies(SupabaseClient("SUPABASE_SECRET_KEY"), product_id, data)
        invalidate_catalog_cache()
        return {"updated": True}
    except ConfigurationError as exc:
        raise HTTPException(status_code=503, detail="Supabase no está configurado") from exc
    except SupabaseError as exc:
        if exc.status == 404:
            raise HTTPException(status_code=503, detail="Falta aplicar la migración 004 de insumos") from exc
        if exc.status == 400:
            raise HTTPException(status_code=422, detail="Revisa el producto, los insumos activos y las cantidades") from exc
        raise HTTPException(status_code=503, detail="No se pudieron guardar los insumos del producto") from exc
