-- Vincula productos con insumos existentes. No elimina productos ni existencias.

begin;

-- Crea un insumo o devuelve el activo que ya tiene el mismo nombre y unidad.
-- Solo el backend administrativo puede ejecutar esta función.
create or replace function public.crear_insumo_allicam(
  p_nombre text, p_unidad_medida text, p_stock_actual numeric, p_stock_minimo numeric
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_insumo public.insumo;
  v_nombre text := trim(p_nombre);
  v_unidad text := lower(trim(p_unidad_medida));
begin
  if v_nombre is null or length(v_nombre) not between 1 and 120
     or v_unidad is null or length(v_unidad) not between 1 and 30
     or p_stock_actual is null or p_stock_actual < 0 or p_stock_actual > 999999999.999
     or p_stock_minimo is null or p_stock_minimo < 0 or p_stock_minimo > 999999999.999
     or p_stock_actual <> round(p_stock_actual, 3) or p_stock_minimo <> round(p_stock_minimo, 3) then
    raise exception 'Datos de insumo inválidos';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(lower(v_nombre) || ':' || v_unidad));
  select * into v_insumo from public.insumo
    where lower(trim(nombre)) = lower(v_nombre) and lower(trim(unidad_medida)) = v_unidad
    order by activo desc, id limit 1;
  if found then
    if not v_insumo.activo then raise exception 'El insumo está inactivo'; end if;
    -- Reutilizar un insumo no modifica sus existencias.
    return jsonb_build_object('item', to_jsonb(v_insumo), 'created', false);
  end if;
  insert into public.insumo (nombre, unidad_medida, stock_actual, stock_minimo, activo)
    values (v_nombre, v_unidad, p_stock_actual, p_stock_minimo, true)
    returning * into v_insumo;
  return jsonb_build_object('item', to_jsonb(v_insumo), 'created', true);
end;
$$;
revoke all on function public.crear_insumo_allicam(text, text, numeric, numeric) from public, anon, authenticated;
grant execute on function public.crear_insumo_allicam(text, text, numeric, numeric) to service_role;

-- Reemplaza la composición de un producto de forma atómica.
create or replace function public.asignar_insumos_producto_allicam(p_producto bigint, p_insumos jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_item jsonb;
  v_id bigint;
  v_cantidad numeric;
  v_ids bigint[] := array[]::bigint[];
begin
  perform 1 from public.producto where id = p_producto and activo for update;
  if not found then raise exception 'Producto no disponible'; end if;
  if p_insumos is null or jsonb_typeof(p_insumos) <> 'array' then
    raise exception 'Selecciona una lista de insumos';
  end if;
  if jsonb_array_length(p_insumos) not between 1 and 50 then
    raise exception 'Selecciona entre 1 y 50 insumos';
  end if;
  for v_item in select value from jsonb_array_elements(p_insumos) loop
    v_id := (v_item ->> 'insumoId')::bigint;
    v_cantidad := (v_item ->> 'quantity')::numeric;
    if v_id is null or v_id = any(v_ids) then raise exception 'Insumo inválido o repetido'; end if;
    if v_cantidad is null or v_cantidad <= 0 or v_cantidad > 999999999.999
       or v_cantidad <> round(v_cantidad, 3) then
      raise exception 'Cantidad inválida: usa hasta tres decimales';
    end if;
    perform 1 from public.insumo where id = v_id and activo for share;
    if not found then raise exception 'Insumo no disponible'; end if;
    v_ids := array_append(v_ids, v_id);
  end loop;
  delete from public.producto_insumo where id_producto = p_producto;
  insert into public.producto_insumo (id_producto, id_insumo, cantidad_requerida)
    select p_producto, (value ->> 'insumoId')::bigint, (value ->> 'quantity')::numeric
    from jsonb_array_elements(p_insumos);
end;
$$;
revoke all on function public.asignar_insumos_producto_allicam(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.asignar_insumos_producto_allicam(bigint, jsonb) to service_role;

-- El producto y sus insumos se guardan juntos; un error revierte ambos.
create or replace function public.crear_producto_allicam(p_producto jsonb, p_insumos jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  v_producto bigint;
begin
  insert into public.producto (
    id_categoria, nombre, descripcion, precio, imagen_url, slug, etiqueta,
    ocasiones, disponible_hoy, disponible, activo
  ) values (
    (p_producto ->> 'id_categoria')::bigint, p_producto ->> 'nombre',
    p_producto ->> 'descripcion', (p_producto ->> 'precio')::numeric,
    p_producto ->> 'imagen_url', p_producto ->> 'slug', coalesce(p_producto ->> 'etiqueta', ''),
    coalesce(p_producto -> 'ocasiones', '[]'::jsonb),
    coalesce((p_producto ->> 'disponible_hoy')::boolean, false), true, true
  ) returning id into v_producto;
  perform public.asignar_insumos_producto_allicam(v_producto, p_insumos);
  return v_producto;
end;
$$;
revoke all on function public.crear_producto_allicam(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.crear_producto_allicam(jsonb, jsonb) to service_role;

commit;
