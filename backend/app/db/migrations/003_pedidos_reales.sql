-- Para bases existentes: ejecutar una vez en Supabase SQL Editor.
-- La función fuente se mantiene en ../functions/pedido.sql.
begin;
alter table public.pedido add column if not exists checkout_token uuid unique;

create or replace function public.crear_pedido_allicam(
  p_usuario bigint, p_destinatario text, p_telefono text, p_direccion text,
  p_instrucciones text, p_fecha_entrega date, p_hora_desde time,
  p_hora_hasta time, p_items jsonb, p_request_id uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_item jsonb;
  v_lines jsonb := '[]'::jsonb;
  v_product record;
  v_product_id bigint;
  v_quantity integer;
  v_extra numeric(12,2);
  v_unit_price numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_order_id bigint;
  v_number text;
  v_dedications text := '';
  v_dedication text;
begin
  if not exists (select 1 from public.usuario where id = p_usuario and activo and auth_user_id is not null) then
    raise exception 'Usuario no disponible';
  end if;
  if p_request_id is null then raise exception 'Falta identificador de solicitud'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_request_id::text));
  select id, numero_pedido into v_order_id, v_number
    from public.pedido where checkout_token = p_request_id and id_usuario = p_usuario;
  if found then return jsonb_build_object('id', v_order_id, 'number', v_number); end if;
  if exists (select 1 from public.pedido where checkout_token = p_request_id) then
    raise exception 'Identificador de solicitud ya utilizado';
  end if;
  if p_destinatario is null or length(trim(p_destinatario)) < 2
     or p_telefono is null or length(trim(p_telefono)) < 8
     or p_direccion is null or length(trim(p_direccion)) < 5 then
    raise exception 'Datos de entrega incompletos';
  end if;
  if p_fecha_entrega is null or p_fecha_entrega < (now() at time zone 'America/Santiago')::date
     or p_hora_desde is null or p_hora_hasta is null or p_hora_hasta <= p_hora_desde then
    raise exception 'Fecha o franja de entrega inválida';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'El pedido debe contener entre 1 y 20 productos';
  end if;
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product_id := (v_item ->> 'productId')::bigint;
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity is null or v_quantity < 1 or v_quantity > 20 then raise exception 'Cantidad de producto inválida'; end if;
    select p.nombre, p.precio into v_product
      from public.producto p join public.categoria c on c.id = p.id_categoria
      where p.id = v_product_id and p.activo and p.disponible and c.activo;
    if not found then raise exception 'Producto no disponible'; end if;
    v_extra := (case when coalesce((v_item ->> 'balloon')::boolean, false) then 4000 else 0 end)
             + (case when coalesce((v_item ->> 'treat')::boolean, false) then 6000 else 0 end);
    v_unit_price := v_product.precio + v_extra;
    if (v_item ->> 'expectedUnitPrice')::numeric is distinct from v_unit_price then
      raise exception 'El precio del producto cambió';
    end if;
    v_subtotal := v_subtotal + v_unit_price * v_quantity;
    v_dedication := trim(coalesce(v_item ->> 'dedication', ''));
    if length(v_dedication) > 280 then raise exception 'La dedicatoria es demasiado larga'; end if;
    if v_dedication <> '' then
      v_dedications := v_dedications || case when v_dedications = '' then '' else E'\n' end
        || v_product.nombre || ': ' || v_dedication;
    end if;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'productId', v_product_id, 'name', v_product.nombre,
      'quantity', v_quantity, 'unitPrice', v_unit_price
    ));
  end loop;
  insert into public.pedido (id_usuario, estado_actual, subtotal, costo_entrega, total, checkout_token)
    values (p_usuario, 'pendiente', v_subtotal, 6000, v_subtotal + 6000, p_request_id)
    returning id into v_order_id;
  v_number := 'AL-' || lpad(v_order_id::text, 6, '0');
  update public.pedido set numero_pedido = v_number where id = v_order_id;
  for v_item in select value from jsonb_array_elements(v_lines) loop
    insert into public.detalle_pedido (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
      values (v_order_id, (v_item ->> 'productId')::bigint, v_item ->> 'name',
              (v_item ->> 'quantity')::integer, (v_item ->> 'unitPrice')::numeric,
              (v_item ->> 'unitPrice')::numeric * (v_item ->> 'quantity')::integer);
  end loop;
  insert into public.datos_entrega (id_pedido, nombre_destinatario, telefono_destinatario,
    fecha_entrega, hora_desde, hora_hasta, direccion, dedicatoria, instrucciones)
    values (v_order_id, trim(p_destinatario), trim(p_telefono), p_fecha_entrega,
      p_hora_desde, p_hora_hasta, trim(p_direccion), nullif(v_dedications, ''),
      nullif(trim(coalesce(p_instrucciones, '')), ''));
  insert into public.historial_estado_pedido (id_pedido, id_usuario_responsable, estado)
    values (v_order_id, p_usuario, 'pendiente');
  return jsonb_build_object('id', v_order_id, 'number', v_number);
end;
$$;
revoke all on function public.crear_pedido_allicam(
  bigint, text, text, text, text, date, time, time, jsonb, uuid
) from public, anon, authenticated;
grant execute on function public.crear_pedido_allicam(
  bigint, text, text, text, text, date, time, time, jsonb, uuid
) to service_role;
commit;
