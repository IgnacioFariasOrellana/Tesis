-- Ejecutar una vez en Supabase SQL Editor si el esquema ya existe.
begin;
alter table public.usuario
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;
update public.usuario set rol = 'cliente' where rol is null;
alter table public.usuario alter column rol set default 'cliente';
alter table public.usuario alter column rol set not null;
alter table public.usuario drop constraint if exists usuario_rol_check;
alter table public.usuario add constraint usuario_rol_check
  check (rol in ('cliente', 'repartidor', 'admin'));
grant select on table public.usuario to authenticated;
drop policy if exists "Usuario consulta su perfil" on public.usuario;
create policy "Usuario consulta su perfil" on public.usuario
  for select to authenticated using (auth.uid() = auth_user_id);
create or replace function public.crear_perfil_usuario()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.usuario (
    auth_user_id, correo, nombres, apellido_paterno, apellido_materno, telefono, rol, activo
  )
  values (new.id, new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'nombres', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'apellido_paterno', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'apellido_materno', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'telefono', '')), ''),
    'cliente', true);
  return new;
end;
$$;
revoke all on function public.crear_perfil_usuario() from public, anon, authenticated;
drop trigger if exists allicam_usuario_registro on auth.users;
create trigger allicam_usuario_registro after insert on auth.users
  for each row execute function public.crear_perfil_usuario();
commit;
