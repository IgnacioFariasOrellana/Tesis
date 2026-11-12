-- Permite editar un producto y su composición de forma atómica.

begin;

create or replace function public.actualizar_producto_allicam(
  p_producto bigint, p_datos jsonb, p_insumos jsonb
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.producto
  set id_categoria = (p_datos ->> 'id_categoria')::bigint,
      nombre = p_datos ->> 'nombre',
      descripcion = p_datos ->> 'descripcion',
      precio = (p_datos ->> 'precio')::numeric,
      imagen_url = p_datos ->> 'imagen_url',
      slug = p_datos ->> 'slug',
      etiqueta = coalesce(p_datos ->> 'etiqueta', ''),
      ocasiones = coalesce(p_datos -> 'ocasiones', '[]'::jsonb),
      disponible_hoy = coalesce((p_datos ->> 'disponible_hoy')::boolean, false)
  where id = p_producto and activo;

  if not found then raise exception 'Producto no disponible'; end if;
  perform public.asignar_insumos_producto_allicam(p_producto, p_insumos);
end;
$$;

revoke all on function public.actualizar_producto_allicam(bigint, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.actualizar_producto_allicam(bigint, jsonb, jsonb)
  to service_role;

commit;
