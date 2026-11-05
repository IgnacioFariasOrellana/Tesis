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
