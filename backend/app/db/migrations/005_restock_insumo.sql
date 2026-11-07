-- Registra reposiciones de inventario mediante una suma atómica.

begin;

create or replace function public.reponer_insumo_allicam(
  p_insumo bigint, p_cantidad numeric
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_insumo public.insumo;
begin
  if p_insumo is null or p_insumo < 1
     or p_cantidad is null or p_cantidad <= 0
     or p_cantidad > 999999999.999
     or p_cantidad <> round(p_cantidad, 3) then
    raise exception 'Datos de reposición inválidos';
  end if;

  update public.insumo
    set stock_actual = stock_actual + p_cantidad
    where id = p_insumo
      and activo
      and stock_actual + p_cantidad <= 999999999.999
    returning * into v_insumo;

  if not found then
    raise exception 'Insumo no disponible o cantidad fuera de rango';
  end if;

  return to_jsonb(v_insumo);
end;
$$;

revoke all on function public.reponer_insumo_allicam(bigint, numeric)
  from public, anon, authenticated;
grant execute on function public.reponer_insumo_allicam(bigint, numeric)
  to service_role;

commit;
