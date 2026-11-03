"""Cliente HTTP mínimo para Supabase Data API y Storage."""

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import required, supabase_url


class SupabaseError(Exception):
    def __init__(self, status: int | None = None):
        self.status = status
        super().__init__(f"Supabase respondió con estado {status}")


class SupabaseClient:
    def __init__(self, key_name: str):
        self.base_url = supabase_url()
        self.key = required(key_name)

    def request(
        self,
        method: str,
        path: str,
        *,
        query: dict[str, str] | None = None,
        payload: dict[str, Any] | None = None,
        body: bytes | None = None,
        content_type: str | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        url = f"{self.base_url}/{path.lstrip('/')}"
        if query:
            url += "?" + urlencode(query)
        request_headers = {"apikey": self.key, "Accept": "application/json", **(headers or {})}
        if payload is not None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            request_headers["Content-Type"] = "application/json"
        elif content_type:
            request_headers["Content-Type"] = content_type
        request = Request(url, data=body, method=method, headers=request_headers)
        try:
            with urlopen(request, timeout=15) as response:
                raw = response.read()
                return json.loads(raw) if raw else None
        except HTTPError as exc:
            raise SupabaseError(exc.code) from exc
        except (URLError, TimeoutError, ValueError) as exc:
            raise SupabaseError() from exc
