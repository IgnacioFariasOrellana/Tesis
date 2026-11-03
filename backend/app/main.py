"""Entrada de la API Allicam."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.producto import router as producto_router

app = FastAPI(title="Allicam API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["content-type", "x-admin-password"],
)
app.include_router(producto_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "allicam-api"}
