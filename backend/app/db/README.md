# Esquema Allicam

Cada archivo en `tables/` crea una tabla con el mismo nombre y sus índices. `schema.py` los concatena en el orden de las claves foráneas y luego agrega `security.sql`, todo dentro de una transacción.

Para agregar una tabla: crea `tables/<nombre>.sql`, agrega su nombre a `TABLE_ORDER` en `schema.py` según sus dependencias y agrégala a la lista de `security.sql`. Los archivos individuales no se ejecutan en orden alfabético.

Desde `backend`, genera el SQL para Supabase:

```powershell
python -m app.db.schema --output modelo_allicam.sql
```

El archivo generado es un artefacto para SQL Editor; la fuente mantenida son los archivos por tabla. No hay datos de ejemplo.
