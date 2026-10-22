# Allicam — Tesis PWA (primer incremento funcional)

Este repositorio es un **punto de partida** basado en las diez referencias de interfaz de Allicam y `DESIGN.md`. Stack: **Next.js 15.5.28 / React 19.2.9 / TypeScript**, **FastAPI (Python)** y **Docker Compose**.

> ⚠️ Prototipo académico: el catálogo se consulta en FastAPI si la API está disponible; en su ausencia funciona con productos de ejemplo. Carrito y pedidos de demostración quedan guardados en `localStorage`. **No hay usuarios reales, pagos, GPS, fotos de entrega ni base de datos**. No usar para ventas reales.

## Instalación en Windows (PowerShell)

1. Haz una copia de respaldo si tu carpeta `Tesis` ya contiene código. El ZIP tiene archivos en su raíz: extráelos en un directorio vacío o revisa antes de sobrescribir.
2. Copia el contenido del ZIP a:
   `C:\Users\naxho\OneDrive\Escritorio\U\2026-2\Formulacion de proyecto de titulo\pwa\Tesis`
3. Abre la terminal PowerShell en esa carpeta (puedes escribir `powershell` en la barra de dirección del Explorador):

```powershell
cd 'C:\Users\naxho\OneDrive\Escritorio\U\2026-2\Formulacion de proyecto de titulo\pwa\Tesis'
docker compose up --build
```

Accesos (cuando Docker haya levantado ambos servicios):
- Tienda: http://localhost:3000
- Catálogo: http://localhost:3000/catalogo
- Carrito: http://localhost:3000/carrito
- Checkout simulado: http://localhost:3000/checkout
- Mis pedidos: http://localhost:3000/mis-pedidos
- Cuenta (UI): http://localhost:3000/cuenta
- Administrador (UI): http://localhost:3000/admin
- Inventario: http://localhost:3000/admin/inventario
- Repartidor (UI): http://localhost:3000/repartidor
- API FastAPI: http://localhost:8000/docs
- Estado API: http://localhost:8000/health

Detener servicios: `Ctrl + C`, luego `docker compose down`. Si se modifica `package.json` o el Dockerfile, reconstruir con `docker compose up --build` (si se usa volumen anterior de dependencias, `docker compose down -v` elimina el volumen de node_modules).

### Alternativa sin Docker

En dos terminales diferentes:

```powershell
# Terminal 1: backend (requiere Python 3.12+)
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```powershell
# Terminal 2: frontend (requiere Node.js 22+)
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

## Estructura

```text
Tesis/
├── docker-compose.yml
├── DESIGN.md                  # Sistema visual proporcionado
├── docs/mockups/              # Capturas de referencia originales
├── frontend/
│   ├── public/images/         # Imágenes de demostración recortadas de mockups
│   ├── src/app/(shop)/         # Inicio, catálogo, producto, carrito, checkout, cuenta, mis pedidos
│   ├── src/app/admin/          # Panel administrativo e inventario
│   ├── src/app/repartidor/     # Panel de reparto simulado
│   ├── src/components/        # Header, Footer, Card, vistas reutilizables
│   ├── src/context/           # Estado global del carrito
│   └── src/lib/               # Tipos, catálogo mock, formato, pedidos demo
└── backend/
    └── app/main.py            # GET /health, /api/products y /api/products/{slug}
```

## Qué funciona ya

- Navegación responsive y diseño según `DESIGN.md`.
- Inicio con productos destacados.
- Catálogo: filtrado por ocasión, categoría, presupuesto, entrega hoy y orden por precio.
- Detalle: fecha, franja, dedicatoria, sello y extras; agrega al carrito.
- Carrito: cantidades, eliminación, subtotal y envío **estimado para simulación**.
- Checkout: validación de campos básicos, registro local de pedidos sin pagos reales.
- Mis pedidos: muestra órdenes guardadas en el navegador.
- Panel administrativo y de repartidor con datos ficticios; filtro de inventario; marcar entregas en memoria temporal.
- FastAPI sirve los 7 productos de ejemplo y expone su documentación interactiva.

## Próximas iteraciones recomendadas

1. PostgreSQL + SQLAlchemy y migraciones Alembic para productos, variantes, materiales, usuarios y pedidos.
2. Autenticación JWT con roles (cliente, administrador y repartidor), validación backend y contraseñas hasheadas.
3. CRUD real en el administrador para productos, insumos y pedidos.
4. Gestión de stock y recetas/BOM por producto, reserva de materiales, transacciones.
5. Despachos con cobertura, franjas, estados, evidencias y, si se justifica, geolocalización real con consentimiento.
6. Pasarela de pagos en modo sandbox y webhook verificado; recién después pasar a producción.
7. Mejorar soporte offline, caché versionada, pruebas, accesibilidad y seguridad, más las evaluaciones definidas para la tesis.

### Notas de diseño

Los JPG del prototipo son **recortes** de las capturas entregadas; no son las fotos originales de los productos. Reemplázalos antes de publicar. Los textos de proveedores, cifras, direcciones y operación son *ficticios*. El `manifest.webmanifest`, los íconos y un **service worker básico** se incluyen como punto de partida. El service worker solo se registra en modo producción (`npm run build && npm start`), guarda recursos estáticos y muestra `/offline.html` cuando falla la navegación. **No es una experiencia offline completa**: no cachea pedidos, sesiones ni la API.
