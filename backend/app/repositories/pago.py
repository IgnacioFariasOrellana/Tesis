"""Lecturas de pagos registrados."""

from app.integrations.supabase import SupabaseClient


def list_pagos(client: SupabaseClient) -> list[dict]:
    return client.request("GET", "rest/v1/pago", query={
        "select": "id,id_pedido,metodo_pago,proveedor,referencia_externa,monto,estado,fecha_pago,fecha_creacion",
        "order": "fecha_creacion.desc", "limit": "200",
    })
