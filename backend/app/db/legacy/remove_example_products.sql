-- Opcional: solo si ejecutaste la antigua carga de siete ejemplos en public.products.
-- La tabla anterior no se usa con el nuevo modelo; este archivo no la elimina.
do $$
begin
  if to_regclass('public.products') is not null then
    delete from public.products
    where (id, slug) in (
      ('p1', 'bandeja-amanecer'),
      ('p2', 'caja-noble-cafe'),
      ('p3', 'cesta-lavanda'),
      ('p4', 'box-cumpleanos'),
      ('p5', 'arreglo-jardin-rose'),
      ('p6', 'bandeja-campina'),
      ('p7', 'caja-sorpresa-noble')
    );
  end if;
end $$;
