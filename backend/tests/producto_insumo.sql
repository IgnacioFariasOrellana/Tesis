-- Ejecutar únicamente en una base vacía de pruebas (psql -v ON_ERROR_STOP=1).
-- Las fuentes se copian a /tmp/allicam-db en el contenedor de pruebas.
create role anon;
create role authenticated;
create role service_role;
\i /tmp/allicam-db/tables/categoria.sql
\i /tmp/allicam-db/tables/producto.sql
\i /tmp/allicam-db/tables/insumo.sql
\i /tmp/allicam-db/tables/producto_insumo.sql
\i /tmp/allicam-db/migrations/004_producto_insumo.sql

do $$
declare
  v_categoria bigint;
  v_insumo bigint;
  v_otro bigint;
  v_producto bigint;
  v_segundo bigint;
  v_resultado jsonb;
begin
  insert into public.categoria (nombre) values ('Prueba') returning id into v_categoria;
  v_resultado := public.crear_insumo_allicam(' Yogurt ', ' Unidad ', 10, 2);
  v_insumo := (v_resultado -> 'item' ->> 'id')::bigint;
  if not (v_resultado ->> 'created')::boolean then raise exception 'No creó insumo'; end if;
  v_resultado := public.crear_insumo_allicam('yogurt', 'unidad', 999, 999);
  if (v_resultado ->> 'created')::boolean or (v_resultado -> 'item' ->> 'id')::bigint <> v_insumo
     or (v_resultado -> 'item' ->> 'stock_actual')::numeric <> 10 then
    raise exception 'Duplicó el insumo o modificó stock al reutilizarlo';
  end if;
  v_resultado := public.crear_insumo_allicam('Granola', 'kg', 5, 1);
  v_otro := (v_resultado -> 'item' ->> 'id')::bigint;
  v_producto := public.crear_producto_allicam(jsonb_build_object(
    'id_categoria', v_categoria, 'nombre', 'Bandeja', 'descripcion', 'Prueba', 'precio', 1000, 'slug', 'bandeja'
  ), jsonb_build_array(jsonb_build_object('insumoId', v_insumo, 'quantity', 2)));
  v_segundo := public.crear_producto_allicam(jsonb_build_object(
    'id_categoria', v_categoria, 'nombre', 'Otra bandeja', 'descripcion', 'Prueba', 'precio', 1000, 'slug', 'otra'
  ), jsonb_build_array(jsonb_build_object('insumoId', v_insumo, 'quantity', 1)));
  if (select count(*) from public.producto_insumo where id_insumo = v_insumo) <> 2 then
    raise exception 'No permite reutilizar insumo en varios productos';
  end if;
  perform public.asignar_insumos_producto_allicam(v_producto,
    jsonb_build_array(jsonb_build_object('insumoId', v_otro, 'quantity', 0.125)));
  if (select cantidad_requerida from public.producto_insumo where id_producto = v_producto and id_insumo = v_otro) is distinct from 0.125
     or exists (select 1 from public.producto_insumo where id_producto = v_producto and id_insumo = v_insumo) then
    raise exception 'No reemplazó la composición';
  end if;
  begin
    perform public.asignar_insumos_producto_allicam(v_producto, jsonb_build_array(
      jsonb_build_object('insumoId', v_insumo, 'quantity', 1), jsonb_build_object('insumoId', v_insumo, 'quantity', 2)));
    raise exception using errcode = 'XX000', message = 'Aceptó insumos repetidos';
  exception when raise_exception then null;
  end;
  begin
    perform public.asignar_insumos_producto_allicam(v_producto,
      jsonb_build_array(jsonb_build_object('insumoId', v_otro, 'quantity', 0.0001)));
    raise exception using errcode = 'XX000', message = 'Redondeó una cantidad inválida';
  exception when raise_exception then null;
  end;
  update public.insumo set activo = false where id = v_insumo;
  begin
    perform public.crear_producto_allicam(jsonb_build_object(
      'id_categoria', v_categoria, 'nombre', 'Inválido', 'descripcion', 'Prueba', 'precio', 1000, 'slug', 'invalido'
    ), jsonb_build_array(jsonb_build_object('insumoId', v_insumo, 'quantity', 1)));
    raise exception using errcode = 'XX000', message = 'Aceptó insumo inactivo';
  exception when raise_exception then null;
  end;
  if exists (select 1 from public.producto where slug = 'invalido') then raise exception 'Dejó producto incompleto'; end if;
  if (select cantidad_requerida from public.producto_insumo where id_producto = v_producto and id_insumo = v_otro) is distinct from 0.125 then
    raise exception 'Una edición fallida modificó la composición';
  end if;
  if (select stock_actual from public.insumo where id = v_otro) <> 5 then raise exception 'Descontó stock'; end if;
  if has_function_privilege('anon', 'public.crear_producto_allicam(jsonb,jsonb)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.asignar_insumos_producto_allicam(bigint,jsonb)', 'EXECUTE')
     or has_function_privilege('anon', 'public.crear_insumo_allicam(text,text,numeric,numeric)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.crear_producto_allicam(jsonb,jsonb)', 'EXECUTE') then
    raise exception 'Permisos de funciones incorrectos';
  end if;
end;
$$;
select 'Pruebas de producto_insumo correctas' as resultado;
