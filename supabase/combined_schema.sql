-- ============================================================================
-- MOMQILL INVENTORY DATABASE SCHEMA (CONSOLIDATED - NO ROLE RESTRICTIONS)
-- ============================================================================
-- Berkas skema gabungan ini mendefinisikan struktur database lengkap untuk 
-- proyek Momqill Inventory. Semua tabel, tipe data, view, fungsi, trigger, 
-- dan kebijakan keamanan (RLS) diinisialisasi dalam bentuk finalnya.
-- Pada versi ini, pembatasan hak akses berbasis role (admin/staff) dinonaktifkan
-- sehingga semua pengguna terautentikasi memiliki akses penuh.
--
-- Jalankan file ini dari Supabase SQL Editor saat database sudah "available".
-- Jika database pernah memakai schema batch lama, blok kompatibilitas di bawah
-- akan mengganti objek inventory lama dengan schema sederhana yang dipakai
-- frontend saat ini. Data auth.users tidak dihapus.
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. COMPATIBILITY GUARDS

-- Simpan data user/profil yang masih bisa dipertahankan sebelum objek lama
-- dibersihkan. Temp table ini hanya hidup selama eksekusi SQL Editor berjalan.
create temp table if not exists _momqill_user_backup (
  id uuid primary key,
  email text,
  full_name text,
  role text
) on commit preserve rows;

do $$
begin
  if to_regclass('public.users') is not null
    and not exists (
      select 1
      from (
        values ('id'), ('email'), ('full_name'), ('role')
      ) as required_columns(column_name)
      where not exists (
        select 1
        from information_schema.columns c
        where c.table_schema = 'public'
          and c.table_name = 'users'
          and c.column_name = required_columns.column_name
      )
    )
  then
    execute $copy_users$
      insert into pg_temp._momqill_user_backup (id, email, full_name, role)
      select id, email, full_name, role::text
      from public.users
      on conflict (id) do update
        set email = excluded.email,
            full_name = coalesce(excluded.full_name, pg_temp._momqill_user_backup.full_name),
            role = coalesce(excluded.role, pg_temp._momqill_user_backup.role)
    $copy_users$;
  end if;

  if to_regclass('public.profiles') is not null
    and exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'profiles'
        and c.relkind in ('r', 'p')
    )
    and not exists (
      select 1
      from (
        values ('id'), ('full_name'), ('role')
      ) as required_columns(column_name)
      where not exists (
        select 1
        from information_schema.columns c
        where c.table_schema = 'public'
          and c.table_name = 'profiles'
          and c.column_name = required_columns.column_name
      )
    )
  then
    execute $copy_profiles$
      insert into pg_temp._momqill_user_backup (id, email, full_name, role)
      select
        p.id,
        au.email,
        p.full_name,
        case
          when p.role::text in ('admin', 'staff') then p.role::text
          else 'admin'
        end
      from public.profiles p
      join auth.users au on au.id = p.id
      on conflict (id) do update
        set email = coalesce(excluded.email, pg_temp._momqill_user_backup.email),
            full_name = coalesce(excluded.full_name, pg_temp._momqill_user_backup.full_name),
            role = coalesce(excluded.role, pg_temp._momqill_user_backup.role)
    $copy_profiles$;
  end if;
end;
$$;

-- Jika public.products berasal dari schema batch lama, "create table if not
-- exists" tidak cukup karena kolom yang dibutuhkan frontend tidak ada.
do $$
declare
  v_products_incompatible boolean;
  v_profiles_kind "char";
begin
  select
    to_regclass('public.products') is not null
    and exists (
      select 1
      from (
        values
          ('product_name'),
          ('category'),
          ('public_price'),
          ('image_url'),
          ('is_public'),
          ('current_stock'),
          ('min_stock')
      ) as required_columns(column_name)
      where not exists (
        select 1
        from information_schema.columns c
        where c.table_schema = 'public'
          and c.table_name = 'products'
          and c.column_name = required_columns.column_name
      )
    )
  into v_products_incompatible;

  if v_products_incompatible then
    drop trigger if exists on_auth_user_created on auth.users;

    drop function if exists public.handle_new_user() cascade;
    drop function if exists public.handle_new_auth_user() cascade;
    drop function if exists public.current_user_role() cascade;
    drop function if exists public.process_stock_transaction(date, text, uuid, integer, text) cascade;
    drop function if exists public.record_incoming(date, uuid, integer, text) cascade;
    drop function if exists public.record_incoming_item(date, uuid, integer, text) cascade;
    drop function if exists public.record_outgoing(date, uuid, integer, text) cascade;
    drop function if exists public.record_outgoing_item(date, uuid, integer, text) cascade;

    -- Fungsi lama dari model batch.
    drop function if exists public.receive_stock(uuid, uuid, uuid, text, integer, date, date, numeric, numeric, text) cascade;
    drop function if exists public.transfer_stock(uuid, uuid, integer, text) cascade;
    drop function if exists public.dispatch_stock(uuid, text, text, integer, numeric, text) cascade;

    if to_regtype('public.adjustment_type') is not null then
      execute 'drop function if exists public.create_stock_adjustment(uuid, public.adjustment_type, integer, text) cascade';
    end if;

    drop view if exists public.public_catalog_products cascade;
    drop view if exists public.inventory_snapshot cascade;
    drop view if exists public.recent_stock_movements cascade;
    drop view if exists public.dashboard_summary cascade;

    select c.relkind
    into v_profiles_kind
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles';

    if v_profiles_kind = 'v' then
      execute 'drop view public.profiles cascade';
    elsif v_profiles_kind = 'm' then
      execute 'drop materialized view public.profiles cascade';
    elsif v_profiles_kind is not null then
      execute 'drop table public.profiles cascade';
    end if;

    drop table if exists
      public.stock_logs,
      public.incoming_items,
      public.outgoing_items,
      public.stock_movements,
      public.stock_adjustments,
      public.dispatch_items,
      public.dispatches,
      public.goods_receipt_items,
      public.goods_receipts,
      public.inventory_stocks,
      public.inventory_batches,
      public.storage_locations,
      public.suppliers,
      public.product_categories,
      public.products,
      public.users
    cascade;

    drop type if exists public.app_role cascade;
    drop type if exists public.unit_type cascade;
    drop type if exists public.movement_type cascade;
    drop type if exists public.adjustment_type cascade;
  end if;
end;
$$;

-- Pastikan nama public.profiles tersedia sebagai view pada schema final.
do $$
declare
  v_profiles_kind "char";
begin
  select c.relkind
  into v_profiles_kind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'profiles';

  if v_profiles_kind in ('m') then
    execute 'drop materialized view public.profiles cascade';
  elsif v_profiles_kind is not null and v_profiles_kind <> 'v' then
    execute 'drop table public.profiles cascade';
  end if;
end;
$$;

-- 3. TABLES

-- Tabel Users (Referensi langsung dari auth.users)
-- Catatan: Kolom 'role' tetap dipertahankan sebagai text dengan default 'admin'
-- agar kompatibel dengan query select frontend tanpa memicu error.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.users (id, email, full_name, role)
select
  au.id,
  au.email,
  coalesce(
    nullif(trim(backup.full_name), ''),
    nullif(trim(au.raw_user_meta_data ->> 'full_name'), ''),
    'Admin'
  ) as full_name,
  case
    when backup.role in ('admin', 'staff') then backup.role
    else 'admin'
  end as role
from auth.users au
left join pg_temp._momqill_user_backup backup on backup.id = au.id
where au.email is not null
on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.users.full_name, excluded.full_name),
      role = case
        when public.users.role in ('admin', 'staff') then public.users.role
        else excluded.role
      end;

-- Tabel Products (Daftar produk inventaris)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  category text not null default 'Daging',
  public_price numeric,
  image_url text,
  is_public boolean not null default true,
  current_stock integer not null default 0 check (current_stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint products_category_check check (category in ('Daging', 'Suki', 'Paket Hemat', 'Bumbu', 'Sosis', 'Mayo', 'Bakso', 'Kulit', 'Snack Frozen', 'Sapi', 'Keju', 'Saos', 'Marinasi', 'Sayuran Frozen', 'Nuggets', 'Kentang', 'Ayam'))
);

-- Pastikan constraint kategori di database aktif selalu sinkron dengan 17 kategori
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'products' and constraint_name = 'products_category_check'
  ) then
    alter table public.products drop constraint products_category_check;
    alter table public.products add constraint products_category_check
      check (category in ('Daging', 'Suki', 'Paket Hemat', 'Bumbu', 'Sosis', 'Mayo', 'Bakso', 'Kulit', 'Snack Frozen', 'Sapi', 'Keju', 'Saos', 'Marinasi', 'Sayuran Frozen', 'Nuggets', 'Kentang', 'Ayam'));
  end if;
end;
$$;

-- Tabel Incoming Items (Pencatatan barang masuk)
create table if not exists public.incoming_items (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  supplier_name text not null,
  created_by uuid references public.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now())
);

-- Tabel Outgoing Items (Pencatatan barang keluar)
create table if not exists public.outgoing_items (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  description text,
  created_by uuid references public.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now())
);

-- Tabel Stock Logs (Pencatatan riwayat audit stok yang aktif)
create table if not exists public.stock_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  source_transaction_id uuid,
  old_stock integer not null check (old_stock >= 0),
  change_amount integer not null,
  new_stock integer not null check (new_stock >= 0),
  type text not null check (type in ('incoming', 'outgoing')),
  notes text,
  created_by uuid not null default auth.uid() references public.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

-- 4. INDEXES
create index if not exists idx_products_name on public.products (product_name);
create index if not exists idx_incoming_items_date on public.incoming_items (date desc);
create index if not exists idx_incoming_items_product_id on public.incoming_items (product_id);
create index if not exists idx_incoming_items_created_by on public.incoming_items (created_by);
create index if not exists idx_outgoing_items_date on public.outgoing_items (date desc);
create index if not exists idx_outgoing_items_product_id on public.outgoing_items (product_id);
create index if not exists idx_outgoing_items_created_by on public.outgoing_items (created_by);
create index if not exists idx_stock_logs_product_id on public.stock_logs (product_id);
create index if not exists idx_stock_logs_created_by on public.stock_logs (created_by);
create index if not exists idx_stock_logs_created_at on public.stock_logs (created_at desc);

-- 5. VIEWS

-- View Profiles (Ringkasan profil staf/admin)
create or replace view public.profiles with (security_invoker = true) as
select
  id,
  case
    when full_name is null or trim(full_name) = '' or full_name ilike '%ibnu%ajar%' or full_name = split_part(email, '@', 1)
      then case when role = 'admin' then 'Admin' else 'Staf Gudang' end
    else full_name
  end as full_name,
  role
from public.users;

-- View Public Catalog Products (Daftar produk yang ditampilkan secara publik)
create or replace view public.public_catalog_products with (security_invoker = true) as
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

-- 6. FUNCTIONS & TRIGGERS

-- Fungsi Trigger untuk menyalin user baru dari auth.users
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
begin
  v_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    'Admin'
  );

  if v_full_name ilike '%ibnu%ajar%' then
    v_full_name := 'Admin';
  end if;

  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, v_full_name, 'admin')
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.users.full_name, excluded.full_name);

  return new;
end;
$$;

-- Trigger pada auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Fungsi untuk mendapatkan role user aktif.
create or replace function public.current_user_role()
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select role
  from public.users
  where id = auth.uid()
$$;

-- Fungsi Utama untuk memproses transaksi stok (Atomik)
create or replace function public.process_stock_transaction(
  p_date date,
  p_notes text,
  p_product_id uuid,
  p_quantity integer,
  p_type text
)
returns public.stock_logs
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_current_stock integer;
  v_new_stock integer;
  v_incoming public.incoming_items;
  v_outgoing public.outgoing_items;
  v_log public.stock_logs;
begin
  if v_actor_id is null then
    raise exception 'not authenticated';
  end if;

  if p_type not in ('incoming', 'outgoing') then
    raise exception 'invalid transaction type';
  end if;

  if p_quantity <= 0 then
    raise exception 'quantity must be greater than zero';
  end if;

  select current_stock
  into v_current_stock
  from public.products
  where id = p_product_id
  for update;

  if v_current_stock is null then
    raise exception 'product not found';
  end if;

  if p_type = 'outgoing' and p_quantity > v_current_stock then
    raise exception 'insufficient stock';
  end if;

  v_new_stock := case
    when p_type = 'incoming' then v_current_stock + p_quantity
    else v_current_stock - p_quantity
  end;

  update public.products
  set current_stock = v_new_stock
  where id = p_product_id;

  if p_type = 'incoming' then
    insert into public.incoming_items (
      date,
      product_id,
      quantity,
      supplier_name,
      created_by
    )
    values (
      p_date,
      p_product_id,
      p_quantity,
      coalesce(nullif(trim(p_notes), ''), 'Transaksi stok masuk internal'),
      v_actor_id
    )
    returning * into v_incoming;

    insert into public.stock_logs (
      product_id,
      source_transaction_id,
      old_stock,
      change_amount,
      new_stock,
      type,
      notes,
      created_by
    )
    values (
      p_product_id,
      v_incoming.id,
      v_current_stock,
      p_quantity,
      v_new_stock,
      'incoming',
      nullif(trim(p_notes), ''),
      v_actor_id
    )
    returning * into v_log;
  else
    insert into public.outgoing_items (
      date,
      product_id,
      quantity,
      description,
      created_by
    )
    values (
      p_date,
      p_product_id,
      p_quantity,
      nullif(trim(p_notes), ''),
      v_actor_id
    )
    returning * into v_outgoing;

    insert into public.stock_logs (
      product_id,
      source_transaction_id,
      old_stock,
      change_amount,
      new_stock,
      type,
      notes,
      created_by
    )
    values (
      p_product_id,
      v_outgoing.id,
      v_current_stock,
      p_quantity * -1,
      v_new_stock,
      'outgoing',
      nullif(trim(p_notes), ''),
      v_actor_id
    )
    returning * into v_log;
  end if;

  return v_log;
end;
$$;

-- Fungsi pencatatan barang masuk (memanggil process_stock_transaction)
create or replace function public.record_incoming(
  p_date date,
  p_product_id uuid,
  p_quantity integer,
  p_supplier_name text
)
returns public.incoming_items
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_log public.stock_logs;
  v_item public.incoming_items;
begin
  select public.process_stock_transaction(
    p_date,
    p_supplier_name,
    p_product_id,
    p_quantity,
    'incoming'
  )
  into v_log;

  select *
  into v_item
  from public.incoming_items
  where id = v_log.source_transaction_id;

  return v_item;
end;
$$;

-- Fungsi pencatatan barang keluar (memanggil process_stock_transaction)
create or replace function public.record_outgoing(
  p_date date,
  p_product_id uuid,
  p_quantity integer,
  p_description text default null
)
returns public.outgoing_items
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_log public.stock_logs;
  v_item public.outgoing_items;
begin
  select public.process_stock_transaction(
    p_date,
    p_description,
    p_product_id,
    p_quantity,
    'outgoing'
  )
  into v_log;

  select *
  into v_item
  from public.outgoing_items
  where id = v_log.source_transaction_id;

  return v_item;
end;
$$;

-- Alias kompatibilitas untuk pemanggil lama.
create or replace function public.record_incoming_item(
  p_date date,
  p_product_id uuid,
  p_quantity integer,
  p_supplier_name text
)
returns public.incoming_items
language sql
security invoker
set search_path = public
as $$
  select public.record_incoming(p_date, p_product_id, p_quantity, p_supplier_name)
$$;

create or replace function public.record_outgoing_item(
  p_date date,
  p_product_id uuid,
  p_quantity integer,
  p_description text default null
)
returns public.outgoing_items
language sql
security invoker
set search_path = public
as $$
  select public.record_outgoing(p_date, p_product_id, p_quantity, p_description)
$$;

-- 7. GRANTS
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.incoming_items to authenticated;
grant select, insert, update, delete on public.outgoing_items to authenticated;
grant select, insert, update, delete on public.stock_logs to authenticated;

grant select on public.profiles to authenticated;
grant select on public.public_catalog_products to anon, authenticated;

-- Revoke default execute on security definer functions from public role
-- Revoke default execute on security definer trigger function
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

-- Revoke default execute on security invoker functions to be explicit
revoke execute on function public.current_user_role() from public;
revoke execute on function public.process_stock_transaction(date, text, uuid, integer, text) from public;
revoke execute on function public.record_incoming(date, uuid, integer, text) from public;
revoke execute on function public.record_outgoing(date, uuid, integer, text) from public;
revoke execute on function public.record_incoming_item(date, uuid, integer, text) from public;
revoke execute on function public.record_outgoing_item(date, uuid, integer, text) from public;

-- Grant execute access only to authenticated users
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.process_stock_transaction(date, text, uuid, integer, text) to authenticated;
grant execute on function public.record_incoming(date, uuid, integer, text) to authenticated;
grant execute on function public.record_outgoing(date, uuid, integer, text) to authenticated;
grant execute on function public.record_incoming_item(date, uuid, integer, text) to authenticated;
grant execute on function public.record_outgoing_item(date, uuid, integer, text) to authenticated;

-- 8. ROW LEVEL SECURITY & POLICIES
-- Seluruh kebijakan RLS dikonfigurasi agar dapat diakses oleh semua 
-- pengguna yang terautentikasi (authenticated) tanpa pembatasan role.

-- Tabel Users
alter table public.users enable row level security;

drop policy if exists "users_select_self_or_admin" on public.users;
drop policy if exists "users_select_all_authenticated" on public.users;
create policy "users_select_all_authenticated"
on public.users
for select
to authenticated
using (true);

drop policy if exists "users_update_admin_only" on public.users;
drop policy if exists "users_update_self_or_all" on public.users;
create policy "users_update_self_or_all"
on public.users
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Tabel Products
alter table public.products enable row level security;

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
on public.products
for select
to authenticated
using (true);

drop policy if exists "products_insert_admin_only" on public.products;
drop policy if exists "products_insert_authenticated" on public.products;
create policy "products_insert_authenticated"
on public.products
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "products_update_admin_only" on public.products;
drop policy if exists "products_update_authenticated" on public.products;
create policy "products_update_authenticated"
on public.products
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "products_delete_admin_only" on public.products;
drop policy if exists "products_delete_authenticated" on public.products;
create policy "products_delete_authenticated"
on public.products
for delete
to authenticated
using (auth.uid() is not null);

-- Tabel Incoming Items
alter table public.incoming_items enable row level security;

drop policy if exists "incoming_read_authenticated" on public.incoming_items;
create policy "incoming_read_authenticated"
on public.incoming_items
for select
to authenticated
using (true);

drop policy if exists "incoming_insert_admin_staff" on public.incoming_items;
drop policy if exists "incoming_insert_authenticated" on public.incoming_items;
create policy "incoming_insert_authenticated"
on public.incoming_items
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "incoming_update_admin_only" on public.incoming_items;
drop policy if exists "incoming_update_authenticated" on public.incoming_items;
create policy "incoming_update_authenticated"
on public.incoming_items
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "incoming_delete_admin_only" on public.incoming_items;
drop policy if exists "incoming_delete_authenticated" on public.incoming_items;
create policy "incoming_delete_authenticated"
on public.incoming_items
for delete
to authenticated
using (auth.uid() is not null);

-- Tabel Outgoing Items
alter table public.outgoing_items enable row level security;

drop policy if exists "outgoing_read_authenticated" on public.outgoing_items;
create policy "outgoing_read_authenticated"
on public.outgoing_items
for select
to authenticated
using (true);

drop policy if exists "outgoing_insert_admin_staff" on public.outgoing_items;
drop policy if exists "outgoing_insert_authenticated" on public.outgoing_items;
create policy "outgoing_insert_authenticated"
on public.outgoing_items
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "outgoing_update_admin_only" on public.outgoing_items;
drop policy if exists "outgoing_update_authenticated" on public.outgoing_items;
create policy "outgoing_update_authenticated"
on public.outgoing_items
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "outgoing_delete_admin_only" on public.outgoing_items;
drop policy if exists "outgoing_delete_authenticated" on public.outgoing_items;
create policy "outgoing_delete_authenticated"
on public.outgoing_items
for delete
to authenticated
using (auth.uid() is not null);

-- Tabel Stock Logs
alter table public.stock_logs enable row level security;

drop policy if exists "stock_logs_select_role_window" on public.stock_logs;
drop policy if exists "stock_logs_select_authenticated" on public.stock_logs;
create policy "stock_logs_select_authenticated"
on public.stock_logs
for select
to authenticated
using (true);

drop policy if exists "stock_logs_insert_admin_only" on public.stock_logs;
drop policy if exists "stock_logs_insert_authenticated" on public.stock_logs;
create policy "stock_logs_insert_authenticated"
on public.stock_logs
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "stock_logs_update_admin_only" on public.stock_logs;
drop policy if exists "stock_logs_update_authenticated" on public.stock_logs;
create policy "stock_logs_update_authenticated"
on public.stock_logs
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "stock_logs_delete_admin_only" on public.stock_logs;
drop policy if exists "stock_logs_delete_authenticated" on public.stock_logs;
create policy "stock_logs_delete_authenticated"
on public.stock_logs
for delete
to authenticated
using (auth.uid() is not null);

