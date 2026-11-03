# Esquema Allicam

Cada archivo en `tables/` crea una tabla con el mismo nombre y sus índices. `schema.py` los concatena en el orden de las claves foráneas y luego agrega `security.sql` y `functions/pedido.sql`, todo dentro de una transacción.

Para agregar una tabla: crea `tables/<nombre>.sql`, agrega su nombre a `TABLE_ORDER` en `schema.py` según sus dependencias y agrégala a la lista de `security.sql`. Los archivos individuales no se ejecutan en orden alfabético.

Desde `backend`, genera el SQL para Supabase:

```powershell
python -m app.db.schema --output modelo_allicam.sql
```

El archivo generado es un artefacto para SQL Editor; la fuente mantenida son los archivos por tabla. No hay datos de ejemplo.

Si la base ya existe, aplica las migraciones de `migrations/` en orden. Después de
`001_usuario_auth.sql`, ejecuta `002_usuario_nombres_separados.sql` para guardar
los nombres y apellidos del nuevo formulario y convertir `usuario.rol` en un enum
con `cliente`, `repartidor` y `admin`. Los perfiles ya registrados no se dividen
automáticamente: un nombre completo no permite identificar con certeza cada apellido.

Después ejecuta `003_pedidos_reales.sql`. Agrega `pedido.checkout_token` para evitar
duplicados al reintentar una solicitud y la función `crear_pedido_allicam` que registra
pedido, líneas, datos de entrega e historial en una sola transacción. La función
solo permite la ejecución desde el backend con la clave `service_role`.

`usuario.contrasena_hash` es una columna heredada sin uso. Supabase Auth guarda el
hash de la contraseña en `auth.users.encrypted_password`; no se duplica en `public`.
