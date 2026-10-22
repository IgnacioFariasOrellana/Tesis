# Estado del primer incremento — Allicam

## Implementado

- Next.js App Router / TypeScript + estilos responsive basados en `DESIGN.md`.
- `/`, `/catalogo`, `/producto/[slug]`, `/carrito`, `/checkout`, `/cuenta`, `/mis-pedidos`.
- `/admin`, `/admin/inventario`, `/repartidor` y placeholders para productos/pedidos/pagos/usuarios.
- FastAPI: `GET /health`, `GET /api/products`, `GET /api/products/{slug}`.
- Docker Compose con contenedores separados para frontend y backend.
- Estado persistente de carrito y pedidos de demostración con `localStorage`.
- Manifest PWA, íconos y service worker estático básico (registrado solo en producción).
- Imágenes derivadas de las capturas originales entregadas por el usuario.

## Validaciones completadas en el entorno de preparación

- Prueba de FastAPI con TestClient: salud 200, lista 200 (7 productos), detalle 200 y producto ausente 404.
- Compilación bytecode Python y validación de `docker-compose.yml` como YAML.
- Análisis de sintaxis TypeScript y TSX mediante TypeScript: 27 archivos, 0 errores de sintaxis.

## No se pudo validar aquí

- `npm install`, `npm run build`, `npm run typecheck` y `npm run lint`, por fallo de DNS al intentar acceder al registro de npm.
- `docker compose up --build`, porque Docker no está disponible en el entorno de preparación.
- Prueba visual real en navegador. Requiere levantamiento en tu equipo y revisión responsive.

## Limitaciones de implementación

- Ni login, ni registro, ni pagos, ni inventario ni pedidos están conectados a una base de datos.
- En `/cuenta` los formularios son solo demostrativos: no envían credenciales.
- El backend actualmente sirve datos de demostración.
- En `/repartidor` la ruta es ficticia; no se usa GPS ni se suben fotografías reales.
- El catálogo tiene 7 artículos de muestra, no 18 como algunos de los mockups.
- La reserva por 24 h que aparece en carrito es puramente texto visual; no reserva stock ni franjas.
- El checkout simulado no procesa transacciones bancarias ni envíos.
- Las imágenes proceden de recortes de capturas y deben sustituirse por fotos originales.

## Siguiente paso sugerido

1. Extraer el ZIP en la carpeta de trabajo y ejecutar `docker compose up --build`.
2. Comprobar pantallas a 1440, 768 y 390 píxeles, tomar notas y adaptar a tus mockups.
3. Añadir PostgreSQL, migraciones Alembic y entidades de clientes, productos, insumos, pedidos y despachos.
4. Implementar autenticación segura por roles antes de abrir los endpoints administrativos.
5. Añadir pruebas unitarias, funcionales y de usabilidad pertinentes a la tesis.
