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
