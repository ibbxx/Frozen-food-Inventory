-- ============================================================================
-- MOMQILL INVENTORY — SCRIPT CEK STATUS & KESEHATAN DATABASE
-- ============================================================================
-- Script ini aman dijalankan kapan saja di Supabase SQL Editor.
-- Output akan langsung tampil sebagai tabel pada tab "Results".
-- ============================================================================

select 
  komponen,
  status,
  keterangan
from (
  -- 1. Cek Tabel Realtime Subscription (Internal Supabase)
  select 
    1 as urutan,
    'Tabel realtime.subscription' as komponen,
    case 
      when to_regclass('realtime.subscription') is not null then '✅ BERHASIL'
      else '⚠️ BELUM TERSEDIA'
    end as status,
    case 
      when to_regclass('realtime.subscription') is not null 
        then 'Schema Realtime normal. Service internal Supabase sehat.'
      else 'Tabel belum ada. Lakukan Pause & Restore Project di Supabase Dashboard jika ada error shutdown.'
    end as keterangan

  union all

  -- 2. Cek Publication supabase_realtime
  select 
    2,
    'Publication supabase_realtime',
    case 
      when exists (select 1 from pg_publication where pubname = 'supabase_realtime') then '✅ BERHASIL'
      else '⚠️ TIDAK AKTIF'
    end,
    case 
      when exists (select 1 from pg_publication where pubname = 'supabase_realtime')
        then 'Publication Realtime terdaftar di PostgreSQL.'
      else 'Publication tidak ditemukan.'
    end

  union all

  -- 3. Cek Tabel public.users
  select 
    3,
    'Tabel public.users',
    case when to_regclass('public.users') is not null then '✅ TERSEDIA' else '❌ HILANG' end,
    case when to_regclass('public.users') is not null then 'Tabel users siap digunakan.' else 'Jalankan combined_schema.sql untuk membuat tabel.' end

  union all

  -- 4. Cek Tabel public.products
  select 
    4,
    'Tabel public.products',
    case when to_regclass('public.products') is not null then '✅ TERSEDIA' else '❌ HILANG' end,
    case when to_regclass('public.products') is not null then 'Tabel products siap digunakan.' else 'Jalankan combined_schema.sql untuk membuat tabel.' end

  union all

  -- 5. Cek Tabel public.incoming_items
  select 
    5,
    'Tabel public.incoming_items',
    case when to_regclass('public.incoming_items') is not null then '✅ TERSEDIA' else '❌ HILANG' end,
    case when to_regclass('public.incoming_items') is not null then 'Tabel barang masuk siap digunakan.' else 'Jalankan combined_schema.sql untuk membuat tabel.' end

  union all

  -- 6. Cek Tabel public.outgoing_items
  select 
    6,
    'Tabel public.outgoing_items',
    case when to_regclass('public.outgoing_items') is not null then '✅ TERSEDIA' else '❌ HILANG' end,
    case when to_regclass('public.outgoing_items') is not null then 'Tabel barang keluar siap digunakan.' else 'Jalankan combined_schema.sql untuk membuat tabel.' end

  union all

  -- 7. Cek Tabel public.stock_logs
  select 
    7,
    'Tabel public.stock_logs',
    case when to_regclass('public.stock_logs') is not null then '✅ TERSEDIA' else '❌ HILANG' end,
    case when to_regclass('public.stock_logs') is not null then 'Tabel riwayat stok siap digunakan.' else 'Jalankan combined_schema.sql untuk membuat tabel.' end

  union all

  -- 8. Cek Fungsi RPC process_stock_transaction
  select 
    8,
    'Fungsi RPC process_stock_transaction',
    case 
      when exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'process_stock_transaction'
      ) then '✅ TERSEDIA'
      else '❌ HILANG'
    end,
    case 
      when exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'process_stock_transaction'
      ) then 'Fungsi transaksi stok otomatis siap digunakan.'
      else 'Jalankan combined_schema.sql untuk membuat fungsi ini.'
    end
) checks
order by urutan;
