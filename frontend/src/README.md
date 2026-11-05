# Organización del frontend

La aplicación separa las rutas, los componentes y sus estilos por responsabilidad.

## Carpetas

- `app/`: rutas de Next.js. Cada `page.tsx` debe limitarse a obtener parámetros o datos y renderizar una vista.
- `components/layout/`: encabezado, pie de página y estructura compartida.
- `components/common/`: componentes transversales sin dominio propio.
- `components/auth/`: inicio de sesión, registro y cuenta.
- `components/catalog/`: catálogo, tarjetas y detalle de productos.
- `components/shop/`: vistas del proceso de compra, agrupadas por página.
- `components/admin/`: shell y vistas administrativas, agrupadas por módulo.
- `components/delivery/`: interfaz del repartidor.
- `styles/`: estilos realmente globales, como variables, normalización y reglas responsive compartidas.

## CSS

Cada componente mantiene su archivo CSS junto a su archivo TSX. Los archivos
`app/globals.css` y `app/admin/admin.css` son solamente manifiestos de importación;
no deben volver a concentrar reglas de todos los módulos.

Cuando se agregue una vista nueva:

1. Crear su componente dentro del dominio correspondiente.
2. Crear el CSS al lado del componente.
3. Dejar la página como un wrapper pequeño que renderice esa vista.
4. Importar el CSS desde el manifiesto global correspondiente mientras se mantenga
   el sistema actual de clases globales.
