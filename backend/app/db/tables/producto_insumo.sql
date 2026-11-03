create table if not exists public.producto_insumo (
  id_producto bigint not null references public.producto(id) on delete cascade,
  id_insumo bigint not null references public.insumo(id) on delete restrict,
  cantidad_requerida numeric(12,3) not null check (cantidad_requerida > 0),
  primary key (id_producto, id_insumo)
);
create index if not exists producto_insumo_id_insumo_idx on public.producto_insumo (id_insumo);
