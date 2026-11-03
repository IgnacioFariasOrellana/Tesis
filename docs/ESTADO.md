# Estado del prototipo Allicam

- El esquema Supabase está en `backend/app/db/tables/`: 18 archivos SQL con el nombre de cada tabla, más `security.sql`.
- `backend/app/db/schema.py` construye el SQL ejecutable en el orden correcto.
- FastAPI está dividido en `api`, `core`, `schemas`, `repositories`, `services` e `integrations`.
- El alta de productos con foto se realiza en FastAPI; el frontend no conserva claves secretas ni escribe directamente en Supabase.
- Inicio, catálogo y detalle leen los productos publicados desde FastAPI.
- La tabla antigua `public.products` no se usa ni se elimina automáticamente.
- Carrito, pedidos, inventario, pagos y reparto siguen siendo demostrativos aunque sus tablas estén definidas.
- La conexión real requiere ejecutar el SQL generado, crear el bucket `product-images` y configurar `.env`.
