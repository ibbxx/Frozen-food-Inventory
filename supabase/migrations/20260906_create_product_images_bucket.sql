-- ============================================================================
-- SUPABASE STORAGE: BUCKET PRODUCT-IMAGES & POLICIES
-- ============================================================================
-- Skrip ini membuat bucket 'product-images' publik untuk penyimpanan foto produk,
-- serta mengatur Row Level Security (RLS) agar publik dapat melihat foto dan
-- pengguna terautentikasi (admin/staff) dapat mengunggah dan menghapus file.
-- ============================================================================

-- 1. Buat bucket jika belum ada
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB batas keamanan di sisi storage (di client sudah dikompresi ke < 500 KB)
  array['image/webp', 'image/jpeg', 'image/png', 'image/jpg']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'image/jpg'];

-- 2. Catatan: RLS pada storage.objects sudah aktif secara default oleh Supabase,
-- sehingga tidak perlu menjalankan ALTER TABLE (akan memicu error 42501 must be owner).

-- 3. Policy SELECT: Siapa saja dapat melihat foto produk (untuk katalog publik)
drop policy if exists "Public Access to Product Images" on storage.objects;
create policy "Public Access to Product Images"
on storage.objects for select
using (bucket_id = 'product-images');

-- 4. Policy INSERT: Pengguna terautentikasi dapat mengunggah gambar
drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and auth.uid() is not null
);

-- 5. Policy UPDATE: Pengguna terautentikasi dapat memperbarui gambar
drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and auth.uid() is not null
)
with check (
  bucket_id = 'product-images'
  and auth.uid() is not null
);

-- 6. Policy DELETE: Pengguna terautentikasi dapat menghapus file fisik di storage
drop policy if exists "Authenticated users can delete product images" on storage.objects;
create policy "Authenticated users can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and auth.uid() is not null
);
