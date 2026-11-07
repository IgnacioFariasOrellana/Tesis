"""Cliente HTTP mínimo para Supabase Data API y Storage."""

import json
from http.client import (
    HTTPConnection,
    HTTPException as HTTPClientException,
    HTTPSConnection,
    CannotSendRequest,
    RemoteDisconnected,
)
from queue import Empty, Full, LifoQueue
from threading import Lock
from typing import Any
from urllib.parse import urlencode, urlsplit

from app.core.config import required, supabase_url


class SupabaseError(Exception):
    def __init__(self, status: int | None = None):
        self.status = status
        super().__init__(f"Supabase respondió con estado {status}")


class _ConnectionPool:
    """Reutiliza conexiones TLS y evita un handshake nuevo por consulta."""

    def __init__(self, max_connections: int = 8):
        self.max_connections = max_connections
        self._queues: dict[tuple[str, str, int | None], LifoQueue] = {}
        self._lock = Lock()

    def _key(self, scheme: str, host: str, port: int | None):
        return scheme, host, port

    def _queue(self, scheme: str, host: str, port: int | None) -> LifoQueue:
        key = self._key(scheme, host, port)
        with self._lock:
            return self._queues.setdefault(key, LifoQueue(self.max_connections))

    def acquire(self, scheme: str, host: str, port: int | None):
        queue = self._queue(scheme, host, port)
        try:
            return queue.get_nowait()
        except Empty:
            connection_type = HTTPSConnection if scheme == "https" else HTTPConnection
            return connection_type(host, port=port, timeout=15)

    def release(self, scheme: str, host: str, port: int | None, connection) -> None:
        queue = self._queue(scheme, host, port)
        try:
            queue.put_nowait(connection)
        except Full:
            connection.close()


_connections = _ConnectionPool()


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
        parsed = urlsplit(url)
        if not parsed.hostname or parsed.scheme not in ("http", "https"):
            raise SupabaseError()
        target = parsed.path or "/"
        if parsed.query:
            target += f"?{parsed.query}"

        for attempt in range(2):
            connection = _connections.acquire(parsed.scheme, parsed.hostname, parsed.port)
            try:
                connection.request(method, target, body=body, headers=request_headers)
                response = connection.getresponse()
                raw = response.read()
                status = response.status
                if response.will_close:
                    connection.close()
                else:
                    _connections.release(
                        parsed.scheme, parsed.hostname, parsed.port, connection
                    )
                if status >= 400:
                    if method in ("GET", "HEAD") and status in (429, 502, 503, 504) and attempt == 0:
                        continue
                    raise SupabaseError(status)
                return json.loads(raw) if raw else None
            except SupabaseError:
                raise
            except (
                BrokenPipeError,
                CannotSendRequest,
                ConnectionResetError,
                HTTPClientException,
                OSError,
                RemoteDisconnected,
                TimeoutError,
                ValueError,
            ) as exc:
                connection.close()
                if attempt == 1:
                    raise SupabaseError() from exc
        raise SupabaseError()
