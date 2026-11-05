-- Ejecutar en Supabase SQL Editor si ya se aplicó 001_usuario_auth.sql.
-- El tipo enum hace que rol tenga solo tres opciones; los datos existentes se conservan.
begin;
do $$ begin
  create type public.rol_usuario as enum ('cliente', 'repartidor', 'admin');
exception when duplicate_object then null;
end $$;
alter table public.usuario drop constraint if exists usuario_rol_check;
alter table public.usuario alter column rol drop default;
alter table public.usuario alter column rol type public.rol_usuario
  using rol::public.rol_usuario;
alter table public.usuario alter column rol set default 'cliente'::public.rol_usuario;

-- Supabase Auth conserva el hash en auth.users.encrypted_password.
comment on column public.usuario.contrasena_hash is
  'Campo heredado sin uso. El hash de la contraseña se guarda en auth.users.encrypted_password.';

-- Afecta a registros nuevos; los usuarios anteriores conservan sus nombres actuales.
create or replace function public.crear_perfil_usuario()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.usuario (
    auth_user_id, correo, nombres, apellido_paterno, apellido_materno, telefono, rol, activo
  )
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'nombres', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'apellido_paterno', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'apellido_materno', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'telefono', '')), ''),
    'cliente',
    true
  );
  return new;
end;
$$;
revoke all on function public.crear_perfil_usuario() from public, anon, authenticated;
commit;
