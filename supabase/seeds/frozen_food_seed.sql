insert into public.products (
  product_name,
  category,
  public_price,
  image_url,
  is_public,
  current_stock,
  min_stock
)
select *
from (
  values
    ('Nugget Ayam Original 500gr', 'Daging', 45000, null, true, 48, 15),
    ('Sosis Sapi Premium 1kg', 'Daging', 52000, null, true, 22, 10),
    ('Kentang Goreng Crinkle 1kg', 'Paket Hemat', 39000, null, true, 35, 12),
    ('Dimsum Ayam Udang 250gr', 'Suki', 47000, null, true, 18, 8),
    ('Tempura Kepiting 500gr', 'Suki', 43000, null, true, 0, 6)
) as seed(product_name, category, public_price, image_url, is_public, current_stock, min_stock)
where not exists (
  select 1
  from public.products
  where products.product_name = seed.product_name
);

insert into public.incoming_items (
  date,
  product_id,
  quantity,
  supplier_name,
  created_by
)
select
  seed.date,
  products.id,
  seed.quantity,
  seed.supplier_name,
  null
from (
  values
    ('2026-04-17'::date, 'Nugget Ayam Original 500gr', 12, 'PT Beku Jaya'),
    ('2026-04-17'::date, 'Kentang Goreng Crinkle 1kg', 10, 'CV Mitra Frozen'),
    ('2026-04-10'::date, 'Dimsum Ayam Udang 250gr', 8, 'PT Laut Dingin')
) as seed(date, product_name, quantity, supplier_name)
join public.products on products.product_name = seed.product_name
where not exists (
  select 1
  from public.incoming_items
  where incoming_items.date = seed.date
    and incoming_items.product_id = products.id
    and incoming_items.quantity = seed.quantity
);

insert into public.outgoing_items (
  date,
  product_id,
  quantity,
  description,
  created_by
)
select
  seed.date,
  products.id,
  seed.quantity,
  seed.description,
  null
from (
  values
    ('2026-04-18'::date, 'Nugget Ayam Original 500gr', 6, 'Penjualan marketplace'),
    ('2026-04-18'::date, 'Sosis Sapi Premium 1kg', 4, 'Penjualan toko'),
    ('2026-04-19'::date, 'Tempura Kepiting 500gr', 2, 'Pesanan reseller')
) as seed(date, product_name, quantity, description)
join public.products on products.product_name = seed.product_name
where not exists (
  select 1
  from public.outgoing_items
  where outgoing_items.date = seed.date
    and outgoing_items.product_id = products.id
    and outgoing_items.quantity = seed.quantity
);
