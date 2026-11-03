# Allicam — Tesis PWA

Tienda de demostración con Next.js, FastAPI y Supabase. El catálogo lee `categoria` y `producto`. El carrito y los pedidos aún se guardan en el navegador; las demás tablas están preparadas, pero sus funciones todavía no están conectadas.

## Estructura del backend

```text
backend/app/
├── main.py                 # Crea FastAPI y registra rutas
├── api/producto.py         # GET del catálogo y POST administrativo
├── core/                   # Variables de entorno y contraseña de administración
├── schemas/producto.py     # Datos de entrada y salida
├── repositories/           # categoria.py y producto.py: consultas por tabla
├── services/               # Validación de productos y fotos en Storage
├── integrations/           # Cliente HTTP de Supabase
└── db/
    ├── tables/             # Un archivo SQL con el nombre de cada tabla (18)
    ├── security.sql         # RLS y permisos
    ├── schema.py            # Genera el SQL completo en orden de dependencias
    └── legacy/             # Limpieza opcional de ejemplos anteriores
```

El frontend solo presenta el formulario y llama a FastAPI. `SUPABASE_SECRET_KEY` y `ADMIN_PASSWORD` pertenecen exclusivamente al backend.

## Crear las tablas en Supabase

Desde `backend`, genera el archivo que reúne los 18 SQL de `app/db/tables/` y `security.sql`:

```powershell
python -m app.db.schema --output modelo_allicam.sql
```

Si usas Docker y no tienes Python instalado en Windows:

```powershell
docker compose up --build -d
docker compose exec backend python -m app.db.schema --output /app/app/db/modelo_allicam.sql
```

En ese caso el archivo queda en `backend/app/db/modelo_allicam.sql`. Copia su contenido al **SQL Editor** de Supabase y ejecútalo una vez. El generador no inserta productos de ejemplo ni borra tablas existentes. La tabla anterior `public.products`, si existe, se conserva y la aplicación ya no la usa. Si necesitas retirar sus siete ejemplos, revisa [remove_example_products.sql](backend/app/db/legacy/remove_example_products.sql) antes de ejecutarlo.

En **Storage**, crea un bucket público llamado `product-images` para fotos JPG, PNG o WebP de hasta 5 MB.

## Configuración

En la raíz, crea `.env` a partir de [.env.example](.env.example) y completa:

```dotenv
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
SUPABASE_SECRET_KEY=sb_secret_TU_CLAVE
ADMIN_PASSWORD=UNA_CONTRASENA_LARGA_Y_UNICA
```

Ejecuta `docker compose up --build` desde la raíz. La tienda está en `http://localhost:3000`, la administración de productos en `http://localhost:3000/admin/productos` y la documentación de FastAPI en `http://localhost:8000/docs`.

Para ejecutar sin Docker, instala `backend/requirements.txt`, define las cuatro variables en el entorno del proceso FastAPI y ejecuta `uvicorn app.main:app --reload --port 8000` desde `backend`. En `frontend`, crea `.env.local` a partir de [frontend/.env.example](frontend/.env.example), instala dependencias y ejecuta `npm run dev`.

La contraseña compartida del formulario es una protección inicial. Antes de publicar una tienda real se necesitan sesiones y roles de administrador. `usuario.contrasena_hash` sigue el diagrama y todavía no está conectado con Supabase Auth.
