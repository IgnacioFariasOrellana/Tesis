create table if not exists public.producto_promocion (
  id_producto bigint not null references public.producto(id) on delete cascade,
  id_promocion bigint not null references public.promocion(id) on delete cascade,
  primary key (id_producto, id_promocion)
);
create index if not exists producto_promocion_id_promocion_idx on public.producto_promocion (id_promocion);
