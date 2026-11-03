"""Construye el SQL completo a partir de un archivo por tabla."""

import argparse
from pathlib import Path

DB_DIR = Path(__file__).parent
TABLE_ORDER = (
    "usuario",
    "categoria",
    "promocion",
    "producto",
    "producto_promocion",
    "insumo",
    "producto_insumo",
    "aceptacion_politica_privacidad",
    "carrito",
    "detalle_carrito",
    "pedido",
    "datos_entrega",
    "detalle_pedido",
    "pago",
    "historial_estado_pedido",
    "ruta_reparto",
    "despacho",
    "notificacion",
)


def render_schema() -> str:
    parts = [
        "-- Modelo de datos Allicam. No inserta datos ni elimina tablas existentes.",
        "begin;",
    ]
    for table in TABLE_ORDER:
        parts.append((DB_DIR / "tables" / f"{table}.sql").read_text(encoding="utf-8").strip())
    parts.append((DB_DIR / "security.sql").read_text(encoding="utf-8").strip())
    parts.append((DB_DIR / "functions" / "pedido.sql").read_text(encoding="utf-8").strip())
    parts.append("commit;")
    return "\n\n".join(parts) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera SQL para el editor de Supabase")
    parser.add_argument("--output", type=Path, help="Guarda el SQL en esta ruta")
    args = parser.parse_args()
    schema = render_schema()
    if args.output:
        args.output.write_text(schema, encoding="utf-8")
        print(f"Esquema generado en {args.output}")
    else:
        print(schema, end="")


if __name__ == "__main__":
    main()
