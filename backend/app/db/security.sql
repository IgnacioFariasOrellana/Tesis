-- Cada tabla del esquema public queda cerrada por defecto a clientes.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'usuario', 'categoria', 'promocion', 'producto', 'producto_promocion',
    'insumo', 'producto_insumo', 'aceptacion_politica_privacidad',
    'carrito', 'detalle_carrito', 'pedido', 'datos_entrega',
    'detalle_pedido', 'pago', 'historial_estado_pedido',
    'ruta_reparto', 'despacho', 'notificacion'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant all on table public.%I to service_role', table_name);
  end loop;
end $$;
grant usage, select on all sequences in schema public to service_role;

-- Cada persona puede consultar su perfil, pero no cambiar su propio rol.
grant select on table public.usuario to authenticated;
drop policy if exists "Usuario consulta su perfil" on public.usuario;
create policy "Usuario consulta su perfil" on public.usuario
  for select to authenticated using (auth.uid() = auth_user_id);

create or replace function public.crear_perfil_usuario()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.usuario (auth_user_id, correo, nombres, telefono, rol, activo)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'nombre', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'telefono', '')), ''),
    'cliente',
    true
  );
  return new;
end;
$$;
revoke all on function public.crear_perfil_usuario() from public, anon, authenticated;
drop trigger if exists allicam_usuario_registro on auth.users;
create trigger allicam_usuario_registro after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

-- El catálogo es público; las demás entidades esperan autenticación y reglas por rol.
grant select on table public.categoria, public.producto to anon, authenticated;
drop policy if exists "Catalogo categorias activas" on public.categoria;
create policy "Catalogo categorias activas" on public.categoria
  for select to anon, authenticated using (activo);
drop policy if exists "Catalogo productos publicados" on public.producto;
create policy "Catalogo productos publicados" on public.producto
  for select to anon, authenticated using (
    activo and disponible and exists (
      select 1 from public.categoria c where c.id = id_categoria and c.activo
    )
  );
