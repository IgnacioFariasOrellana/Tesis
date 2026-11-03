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
