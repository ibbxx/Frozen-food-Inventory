-- ============================================================
-- Migration: product_categories
-- Deskripsi : Buat tabel untuk menyimpan kategori produk
--             secara dinamis, menggantikan hardcoded enum.
-- Tanggal   : 2026-09-07
-- ============================================================

-- 1. Buat tabel
CREATE TABLE IF NOT EXISTS public.product_categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_categories_name_unique UNIQUE (name)
);

-- 2. Komentar tabel dan kolom
COMMENT ON TABLE  public.product_categories          IS 'Daftar kategori produk frozen food yang dapat dikelola secara dinamis.';
COMMENT ON COLUMN public.product_categories.id       IS 'Primary key UUID yang digenerate otomatis.';
COMMENT ON COLUMN public.product_categories.name     IS 'Nama kategori yang unik, ditampilkan di form dan katalog.';
COMMENT ON COLUMN public.product_categories.created_at IS 'Waktu pembuatan record.';

-- 3. Row Level Security
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Baca: semua user yang sudah login boleh membaca kategori
CREATE POLICY "Authenticated users can read categories"
  ON public.product_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Tulis (INSERT / UPDATE / DELETE): hanya admin
CREATE POLICY "Admins can insert categories"
  ON public.product_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON public.product_categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON public.product_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- 4. Seed — 17 kategori yang sebelumnya hardcoded
INSERT INTO public.product_categories (name) VALUES
  ('Daging'),
  ('Suki'),
  ('Paket Hemat'),
  ('Bumbu'),
  ('Sosis'),
  ('Mayo'),
  ('Bakso'),
  ('Kulit'),
  ('Snack Frozen'),
  ('Sapi'),
  ('Keju'),
  ('Saos'),
  ('Marinasi'),
  ('Sayuran Frozen'),
  ('Nuggets'),
  ('Kentang'),
  ('Ayam')
ON CONFLICT (name) DO NOTHING;
