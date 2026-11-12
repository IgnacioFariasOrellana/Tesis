# Pruebas automatizadas — Iteración 1

Los casos se separan en backend, base de datos desechable e interfaz. Ninguna prueba contiene
tokens, claves ni datos personales. El caso que crea productos se habilita únicamente contra un
entorno de prueba.

## Ejecución visual recomendada

Desde la raíz del repositorio ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pruebas-iteracion-1.ps1
```

El script presenta tres bloques coloreados —seguridad, base de datos e interfaz— y termina con un
resumen general apto para capturar en el informe. Ejecuta los seis casos. Para CP-I1-04 crea un
administrador temporal, registra el producto desde la interfaz y elimina los datos de prueba al
finalizar; ninguna credencial temporal se imprime ni se conserva.

## Ejecución

### FastAPI y autorización (CP-I1-01, CP-I1-02)

```powershell
cd backend
python -m pip install -r requirements-test.txt
python -m pytest tests/test_iteration1_auth.py -v
```

### Asociación producto-insumo (CP-I1-05)

Docker debe estar iniciado. La prueba crea y elimina automáticamente un contenedor PostgreSQL;
no usa Supabase ni modifica la base principal.

```powershell
cd backend
$env:RUN_DB_TESTS="1"
python -m pytest tests/test_iteration1_database.py -v -s
Remove-Item Env:RUN_DB_TESTS
```

### Interfaz con Playwright (CP-I1-03, CP-I1-04, CP-I1-06)

Primero levanta la aplicación con `docker compose up -d`. Luego:

```powershell
cd frontend
npm install
npx playwright install chromium
npm run test:e2e
```

La evidencia se genera mediante capturas e informe HTML; las pruebas no requieren FFmpeg ni
grabación de video.

Si Windows bloquea el Chromium descargado, se puede usar Edge instalado:

```powershell
$env:PLAYWRIGHT_EXECUTABLE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npm run test:e2e
```

CP-I1-03 y CP-I1-06 son de lectura. CP-I1-04 utiliza únicamente un administrador y un producto
temporales generados por la prueba y los elimina al finalizar.

## Evidencia sugerida para el informe

| Caso | Archivo automatizado | Evidencia útil |
| --- | --- | --- |
| CP-I1-01 | `backend/tests/test_iteration1_auth.py` | Salida `PASSED` y aserciones 200/`updated` |
| CP-I1-02 | `backend/tests/test_iteration1_auth.py` | Salida `PASSED`, estado 403 y servicio no invocado |
| CP-I1-03 | `frontend/tests/e2e/iteration1.spec.ts` | Producto visible y enlace a su ficha |
| CP-I1-04 | `frontend/tests/e2e/iteration1.spec.ts` | Respuesta 201 y producto recuperado desde la API |
| CP-I1-05 | `backend/tests/test_iteration1_database.py` + `backend/tests/producto_insumo.sql` | `Pruebas de producto_insumo correctas` |
| CP-I1-06 | `frontend/tests/e2e/iteration1.spec.ts` | Producto, subtotal (1) y total estimado visibles |

Para una captura consolidada usa la salida de consola de `pytest -v` y `npm run test:e2e`. Si un
caso Playwright falla, quedan captura, traza y video en `frontend/test-results/`; el informe HTML
se genera en `frontend/playwright-report/` y se abre con `npm run test:e2e:report`.

## Resultado de la ejecución del 9 de noviembre de 2026

| Caso | Resultado | Observación |
| --- | --- | --- |
| CP-I1-01 | Aprobado | La sesión simulada se validó y el rol administrador obtuvo 200 |
| CP-I1-02 | Aprobado | El rol cliente recibió 403 y no se llamó al servicio de creación |
| CP-I1-03 | Aprobado | Playwright encontró en pantalla un producto publicado por la API |
| CP-I1-04 | Aprobado | Creó, verificó y eliminó un administrador y un producto temporales |
| CP-I1-05 | Aprobado | PostgreSQL desechable conservó la cantidad requerida `0.125` |
| CP-I1-06 | Aprobado | El carrito mostró el producto, subtotal para 1 unidad y total estimado |

