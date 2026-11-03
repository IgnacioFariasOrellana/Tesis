"""Fotos de productos en Supabase Storage."""

from app.integrations.supabase import SupabaseClient

BUCKET = "product-images"


def upload_photo(client: SupabaseClient, name: str, data: bytes, mime: str) -> str:
    client.request(
        "POST",
        f"storage/v1/object/{BUCKET}/{name}",
        body=data,
        content_type=mime,
        headers={"cache-control": "3600"},
    )
    return f"{client.base_url}/storage/v1/object/public/{BUCKET}/{name}"


def delete_photo(client: SupabaseClient, name: str) -> None:
    client.request("DELETE", f"storage/v1/object/{BUCKET}/{name}")
