# Allicam — Tesis PWA

Tienda con Next.js, FastAPI y Supabase. El catálogo usa `categoria` y `producto`; las cuentas usan Supabase Auth y `usuario`. El carrito se conserva temporalmente en el navegador y los pedidos confirmados se registran en Supabase.

## Iniciar el proyecto

Completa `.env` en la raíz siguiendo [.env.example](.env.example): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`. La clave secreta solo llega al backend. Luego ejecuta:

```powershell
docker compose up --build -d
```

Tienda: http://localhost:3000 · API: http://localhost:8000/docs

Sin Docker, instala `backend/requirements.txt` y ejecuta `uvicorn app.main:app --reload --port 8000` desde `backend`. En `frontend`, crea `.env.local` a partir de [frontend/.env.example](frontend/.env.example), instala dependencias con `npm install` y ejecuta `npm run dev`.

## Preparar Supabase Auth

Si ya creaste las tablas, ejecuta las migraciones [001_usuario_auth.sql](backend/app/db/migrations/001_usuario_auth.sql), [002_usuario_nombres_separados.sql](backend/app/db/migrations/002_usuario_nombres_separados.sql) y [003_pedidos_reales.sql](backend/app/db/migrations/003_pedidos_reales.sql) en ese orden en Supabase **SQL Editor**. Si ya ejecutaste alguna, aplica únicamente las siguientes. La migración `003` agrega la función necesaria para confirmar pedidos desde checkout. Si partes de cero, genera el esquema desde `backend` con `python -m app.db.schema --output modelo_allicam.sql` y ejecuta el archivo generado. El esquema nuevo ya incluye la relación con Supabase Auth, el perfil automático y la política de lectura del perfil propio.

En Supabase **Authentication → Providers**, habilita Email. En **Authentication → URL Configuration**, usa `http://localhost:3000` como Site URL y agrega `http://localhost:3000/auth/confirm` a Redirect URLs. Si la confirmación por correo está activa, el registro pide verificar el correo antes de iniciar sesión.

Registra la primera cuenta desde `/registro`. El registro público siempre crea el rol `cliente`. Para habilitar **tu primer administrador**, ejecuta en SQL Editor, reemplazando el correo por el de esa cuenta:

```sql
update public.usuario
set rol = 'admin'
where auth_user_id = (select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM');
```

Después, inicia sesión de nuevo. En `/admin/usuarios` podrás asignar `cliente`, `repartidor` y `admin` a otras cuentas. Los paneles `/admin` y `/repartidor` verifican el rol en el servidor; las operaciones administrativas de FastAPI vuelven a verificar el token y el rol en Supabase. `usuario.contrasena_hash` se conserva por compatibilidad con el modelo anterior, pero las contraseñas nuevas se guardan exclusivamente en Supabase Auth. Los usuarios registrados antes de la migración `002` conservan el nombre completo en `nombres`; corrige sus apellidos manualmente porque no se pueden deducir con certeza.

## Backend y base de datos

`backend/app/api/` contiene rutas por entidad; `repositories/` las consultas por tabla; `services/` la lógica de productos, fotos y pedidos; `integrations/` el cliente de Supabase; `core/` la configuración y autorización. Los 18 archivos de `backend/app/db/tables/` describen las tablas. `security.sql` contiene RLS, `functions/pedido.sql` crea el pedido completo en una transacción y `schema.py` genera el SQL completo. Las migraciones para bases existentes están en `backend/app/db/migrations/`.

El catálogo y las fichas de producto muestran datos de Supabase. Tras aplicar `003`, un cliente con sesión puede registrar un pedido en `/checkout` y verlo en `/mis-pedidos`. El administrador ve pedidos, pagos e insumos guardados en la base; el repartidor ve únicamente las rutas asignadas a su cuenta. El checkout deja el pago pendiente y no registra pagos ni despachos automáticamente.

Para fotos, crea en Supabase Storage un bucket público `product-images` para JPG, PNG o WebP de hasta 5 MB.
