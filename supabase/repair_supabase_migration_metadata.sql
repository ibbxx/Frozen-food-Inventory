-- ============================================================================
-- SUPABASE MIGRATION METADATA REPAIR
-- ============================================================================
-- Jalankan file kecil ini hanya jika log Supabase menampilkan:
-- relation "supabase_migrations.schema_migrations" does not exist
--
-- Error ini berasal dari metadata migrasi Supabase, bukan dari tabel aplikasi
-- Momqill. Setelah metadata ini tersedia, lanjutkan dengan menjalankan:
-- supabase/combined_schema.sql
-- ============================================================================

create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
  version text primary key,
  statements text[],
  name text
);

create table if not exists supabase_migrations.seed_files (
  path text primary key,
  hash text not null
);
