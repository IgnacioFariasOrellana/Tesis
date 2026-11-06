"""Entrada de la API Allicam."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.producto import router as producto_router
from app.api.usuario import router as usuario_router
from app.api.insumo import router as insumo_router
from app.api.pedido import router as pedido_router
from app.api.pago import router as pago_router
from app.api.ruta_reparto import router as ruta_reparto_router
from app.api.resumen import router as resumen_router

app = FastAPI(title="Allicam API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["content-type", "authorization"],
)
app.include_router(producto_router)
app.include_router(usuario_router)
app.include_router(insumo_router)
app.include_router(pedido_router)
app.include_router(pago_router)
app.include_router(ruta_reparto_router)
app.include_router(resumen_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "allicam-api"}
