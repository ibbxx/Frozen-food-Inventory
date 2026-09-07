-- ==============================================================================
-- Script: delete_account_completely.sql
-- Deskripsi: Menghapus akun dan seluruh data terkait akun "ibnufajar"
--            secara menyeluruh dari Supabase (auth.users, public.users, logs).
-- ==============================================================================

do $$
declare
  r record;
begin
  for r in (
    select id, email 
    from auth.users 
    where email ilike '%ibnu%' 
       or email ilike '%fajar%'
       or raw_user_meta_data ->> 'full_name' ilike '%ibnu%'
       or raw_user_meta_data ->> 'full_name' ilike '%fajar%'
  ) loop
    raise notice 'Menghapus data terkait user: % (ID: %)', r.email, r.id;

    -- 1. Hapus riwayat audit stok yang dibuat oleh user ini
    delete from public.stock_logs where created_by = r.id;

    -- 2. Hapus / null-kan barang masuk & keluar yang dibuat oleh user ini
    delete from public.incoming_items where created_by = r.id;
    delete from public.outgoing_items where created_by = r.id;

    -- 3. Hapus data profil di public.users
    delete from public.users where id = r.id;

    -- 4. Hapus upload storage (jika ada)
    begin
      delete from storage.objects where owner = r.id::text;
    exception when others then
      null; -- Abaikan jika skema storage tidak memiliki kolom owner langsung
    end;

    -- 5. Hapus akun permanen dari auth.users
    delete from auth.users where id = r.id;

    raise notice 'User % berhasil dihapus secara keseluruhan.', r.email;
  end loop;
end $$;
