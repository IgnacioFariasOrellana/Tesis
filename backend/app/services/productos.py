"""Creación de productos y coordinación con Storage."""

import re
import unicodedata
from threading import RLock
from time import monotonic
from uuid import uuid4

from app.integrations.supabase import SupabaseClient, SupabaseError
from app.repositories.categoria import ensure_category
from app.repositories.producto import insert_product, public_products, slug_exists
from app.repositories.producto_insumo import for_products
from app.schemas.producto import NewProduct, Product
from app.schemas.producto_insumo import ProductSupply
from app.services.storage import delete_photo, upload_photo

MAX_IMAGE_BYTES = 5 * 1024 * 1024
CATALOG_CACHE_SECONDS = 30

_catalog_cache: dict[str, tuple[float, list[Product]]] = {}
_catalog_cache_lock = RLock()


def invalidate_catalog_cache() -> None:
    """Descarta el catálogo almacenado después de modificar productos."""
    with _catalog_cache_lock:
        _catalog_cache.clear()


def _copy_products(products: list[Product]) -> list[Product]:
    return [product.model_copy(deep=True) for product in products]


class ProductError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message
        super().__init__(message)


def _slug(name: str) -> str:
    plain = unicodedata.normalize("NFD", name)
    plain = "".join(character for character in plain if unicodedata.category(character) != "Mn")
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", plain.lower()))


def _items(value: str, limit: int, max_length: int) -> list[str]:
    items = [item.strip() for item in re.split(r"[\n,]+", value) if item.strip()]
    if len(items) > limit or any(len(item) > max_length for item in items):
        raise ProductError(400, "Revisa la longitud de ocasiones y contenido")
    return items


def _photo_type(data: bytes) -> tuple[str, str]:
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", "jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png", "png"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image/webp", "webp"
    raise ProductError(400, "Usa una imagen JPG, PNG o WebP")


def create_product(data: NewProduct, photo: bytes) -> dict[str, str]:
    name = data.name.strip()
    category = data.category.strip()
    description = data.description.strip()
    badge = data.badge.strip()
    slug = _slug(name)
    if not name or len(name) > 120 or not slug or not category or len(category) > 80:
        raise ProductError(400, "Completa nombre y categoría con textos válidos")
    if not description or len(description) > 2000 or len(badge) > 80:
        raise ProductError(400, "Completa la descripción con un texto válido")
    try:
        price = int(data.price)
    except ValueError as exc:
        raise ProductError(400, "Ingresa un precio válido en pesos") from exc
    if price <= 0 or price > 2147483647:
        raise ProductError(400, "Ingresa un precio válido en pesos")
    occasions = _items(data.occasions, 20, 50)
    if not photo or len(photo) > MAX_IMAGE_BYTES:
        raise ProductError(400, "Selecciona una foto de hasta 5 MB")
    mime, extension = _photo_type(photo)

    client = SupabaseClient("SUPABASE_SECRET_KEY")
    try:
        if slug_exists(client, slug):
            raise ProductError(409, "Ya existe un producto con ese nombre")
        category_id = ensure_category(client, category)
    except SupabaseError as exc:
        raise ProductError(502, "No se pudo preparar el producto en Supabase") from exc

    photo_name = f"{uuid4()}.{extension}"
    try:
        image_url = upload_photo(client, photo_name, photo, mime)
    except SupabaseError as exc:
        raise ProductError(502, "No se pudo subir la foto. Comprueba el bucket product-images") from exc

    try:
        insert_product(client, {
            "id_categoria": category_id,
            "slug": slug,
            "nombre": name,
            "descripcion": description,
            "precio": price,
            "imagen_url": image_url,
            "disponible": True,
            "activo": True,
            "etiqueta": badge,
            "ocasiones": occasions,
            "disponible_hoy": data.available_today,
        }, [item.model_dump(mode="json") for item in data.supplies])
    except SupabaseError as exc:
        try:
            delete_photo(client, photo_name)
        except SupabaseError:
            pass
        if exc.status == 409:
            raise ProductError(409, "Ya existe un producto con ese nombre") from exc
        if exc.status == 404:
            raise ProductError(503, "Falta aplicar la migración 004 de insumos") from exc
        if exc.status == 400:
            raise ProductError(422, "Revisa los insumos y sus cantidades; deben estar activos") from exc
        raise ProductError(502, "No se pudo guardar el producto") from exc
    invalidate_catalog_cache()
    return {"slug": slug, "image": image_url}


def catalog_products(slug: str | None = None):
    cache_key = slug or "*"
    now = monotonic()
    with _catalog_cache_lock:
        cached = _catalog_cache.get(cache_key)
        if cached and cached[0] > now:
            return _copy_products(cached[1])

    # Primero se aplica RLS con la clave pública. Solo se completa el contenido
    # de los productos publicados; nunca se incluyen existencias del inventario.
    products = public_products(SupabaseClient("SUPABASE_PUBLISHABLE_KEY"), slug)
    if not products:
        with _catalog_cache_lock:
            _catalog_cache[cache_key] = (
                monotonic() + CATALOG_CACHE_SECONDS,
                [],
            )
        return []
    rows = for_products(SupabaseClient("SUPABASE_SECRET_KEY"), [int(product.id) for product in products])
    by_id = {int(product.id): product for product in products}
    for row in rows:
        supply = row["insumo"]
        by_id[row["id_producto"]].supplies.append(ProductSupply(
            insumoId=row["id_insumo"], name=supply["nombre"] or "Insumo",
            unit=supply["unidad_medida"] or "unidad", quantity=row["cantidad_requerida"],
        ))
    for product in products:
        if product.supplies:
            product.features = [
                f"{item.name} · {item.quantity:g} {item.unit}" for item in product.supplies
            ]
    with _catalog_cache_lock:
        _catalog_cache[cache_key] = (
            monotonic() + CATALOG_CACHE_SECONDS,
            _copy_products(products),
        )
    return _copy_products(products)
