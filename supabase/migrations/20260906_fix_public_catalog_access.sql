-- ============================================================================
-- FIX PUBLIC CATALOG ACCESS: RLS POLICIES & PUBLIC CATALOG VIEW
-- ============================================================================
-- Skrip ini memastikan pengunjung umum (anon) dan pengguna terautentikasi dapat
-- melihat produk yang berstatus 'is_public = true' baik melalui view maupun tabel.
-- ============================================================================

-- 1. Berikan izin penggunaan skema public & SELECT tabel products
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;

-- 2. Tambahkan policy RLS agar role 'anon' (publik) dapat membaca produk dengan is_public = true
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
on public.products
for select
to anon
using (is_public = true);

-- 3. Buat ulang view public_catalog_products tanpa security_invoker agar berjalan dengan aman
drop view if exists public.public_catalog_products cascade;

create view public.public_catalog_products as
select
  id,
  product_name,
  category,
  public_price,
  image_url,
  case
    when current_stock > 10 then 'available'
    when current_stock between 1 and 10 then 'limited'
    else 'out'
  end as stock_status
from public.products
where is_public = true;

-- 4. Berikan hak akses SELECT view public_catalog_products ke publik dan pengguna login
grant select on public.public_catalog_products to anon, authenticated;
