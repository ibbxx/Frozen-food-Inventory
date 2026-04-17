insert into public.product_categories (name, description)
values
  ('Ready to fry', 'Fast-moving frozen products for retail and outlet operations.'),
  ('Dimsum', 'Steamed or fried dimsum products with short FEFO planning windows.'),
  ('Processed meat', 'Frozen sausages, nuggets, meatballs, and similar products.'),
  ('Seafood', 'Frozen fish, shrimp, and other seafood items.')
on conflict (name) do nothing;

insert into public.suppliers (name, phone, email, address, notes)
values
  ('PT Laut Beku Sentosa', '+62 411 880100', 'ops@lautbeku.co.id', 'Makassar Industrial Estate', 'Primary seafood supplier'),
  ('CV Nusantara Frozen Food', '+62 411 880200', 'sales@nusantarafrozen.id', 'Gowa Logistics Hub', 'Processed meat supplier'),
  ('PT Dapur Siap Saji', '+62 411 880300', 'hello@dapursiap.co.id', 'Maros Distribution Park', 'Ready meals and dimsum')
on conflict (name) do nothing;

insert into public.storage_locations (code, name, type, capacity_notes)
values
  ('FRZ-A01', 'Freezer A-01', 'freezer', 'High turnover retail stock'),
  ('FRZ-B02', 'Freezer B-02', 'freezer', 'Dimsum and mixed seafood'),
  ('COLD-QC', 'Quality Hold', 'quality_hold', 'Damaged or inspection stock')
on conflict (code) do nothing;

insert into public.products (
  sku,
  name,
  category_id,
  brand,
  unit,
  pack_size,
  min_stock,
  storage_temp_min,
  storage_temp_max,
  is_active
)
values
  (
    'FF-NUG-500',
    'Chicken Nugget 500g',
    (select id from public.product_categories where name = 'Ready to fry'),
    'Frozen Flow',
    'pack',
    '12 x 500g',
    30,
    -18,
    -12,
    true
  ),
  (
    'FF-DMS-001',
    'Premium Dimsum Shrimp',
    (select id from public.product_categories where name = 'Dimsum'),
    'Frozen Flow',
    'box',
    '20 trays x 250g',
    20,
    -18,
    -12,
    true
  ),
  (
    'FF-BFT-1KG',
    'Beef Meatball 1kg',
    (select id from public.product_categories where name = 'Processed meat'),
    'Cold Kitchen',
    'pack',
    '10 x 1kg',
    25,
    -18,
    -12,
    true
  ),
  (
    'FF-FLF-700',
    'Breaded Fish Fillet 700g',
    (select id from public.product_categories where name = 'Seafood'),
    'Blue Harbor',
    'pack',
    '16 x 700g',
    18,
    -20,
    -14,
    true
  )
on conflict (sku) do nothing;
