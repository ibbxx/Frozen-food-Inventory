-- ============================================================================
-- MOMQILL INVENTORY DATABASE SCHEMA (CONSOLIDATED)
-- ============================================================================
-- Berkas skema gabungan ini mendefinisikan struktur database lengkap untuk 
-- proyek Momqill Inventory. Semua tabel, tipe data, view, fungsi, trigger, 
-- dan kebijakan keamanan (RLS) diinisialisasi dalam bentuk finalnya.
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. ENUM TYPES
do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'user_role'
  ) then
    create type public.user_role as enum ('admin', 'staff');
  end if;
end $$;

-- 3. TABLES

-- Tabel Users (Referensi langsung dari auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'staff',
  created_at timestamptz not null default timezone('utc', now())
);

-- Tabel Products (Daftar produk inventaris)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  category text not null default 'Daging',
  public_price numeric(12, 2),
  image_url text,
  is_public boolean not null default true,
  current_stock integer not null default 0 check (current_stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint products_category_check check (category in ('Daging', 'Suki', 'Paket Hemat'))
);

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

-- Tabel Inventory Logs (Dipertahankan untuk kompatibilitas skema TypeScript)
create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  source_table text not null check (source_table in ('incoming_items', 'outgoing_items', 'products')),
  source_id uuid not null,
  movement_type text not null check (movement_type in ('incoming', 'outgoing', 'adjustment')),
  quantity_delta integer not null,
  stock_before integer not null check (stock_before >= 0),
  stock_after integer not null check (stock_after >= 0),
  notes text,
  created_by uuid not null default auth.uid() references public.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

-- Tabel Stock Logs (Pencatatan riwayat audit stok yang aktif saat ini)
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
create index if not exists idx_inventory_logs_product_id on public.inventory_logs (product_id);
create index if not exists idx_inventory_logs_source on public.inventory_logs (source_table, source_id);
create index if not exists idx_inventory_logs_created_by on public.inventory_logs (created_by);
create index if not exists idx_stock_logs_product_id on public.stock_logs (product_id);
create index if not exists idx_stock_logs_created_by on public.stock_logs (created_by);
create index if not exists idx_stock_logs_created_at on public.stock_logs (created_at desc);

-- 5. VIEWS

-- View Profiles (Ringkasan profil staf/admin)
create or replace view public.profiles as
select
  id,
  coalesce(full_name, split_part(email, '@', 1)) as full_name,
  role
from public.users;

-- View Public Catalog Products (Daftar produk yang ditampilkan secara publik)
create or replace view public.public_catalog_products as
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
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1)
  );

  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, v_full_name, 'staff')
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

-- Fungsi untuk mendapatkan role user aktif saat ini
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
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
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role public.user_role;
  v_current_stock integer;
  v_new_stock integer;
  v_incoming public.incoming_items;
  v_outgoing public.outgoing_items;
  v_log public.stock_logs;
begin
  if v_actor_id is null then
    raise exception 'not authenticated';
  end if;

  select public.current_user_role() into v_role;

  if v_role not in ('admin', 'staff') then
    raise exception 'permission denied';
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
security definer
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
security definer
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

-- Pembungkus SQL untuk record_incoming
create or replace function public.record_incoming_item(
  p_date date,
  p_product_id uuid,
  p_quantity integer,
  p_supplier_name text
)
returns public.incoming_items
language sql
security definer
set search_path = public
as $$
  select public.record_incoming(p_date, p_product_id, p_quantity, p_supplier_name);
$$;

-- Pembungkus SQL untuk record_outgoing
create or replace function public.record_outgoing_item(
  p_date date,
  p_product_id uuid,
  p_quantity integer,
  p_description text default null
)
returns public.outgoing_items
language sql
security definer
set search_path = public
as $$
  select public.record_outgoing(p_date, p_product_id, p_quantity, p_description);
$$;

-- 7. GRANTS
grant select on public.profiles to authenticated;
grant select on public.public_catalog_products to anon, authenticated;

grant execute on function public.process_stock_transaction(date, text, uuid, integer, text) to authenticated;
grant execute on function public.record_incoming(date, uuid, integer, text) to authenticated;
grant execute on function public.record_outgoing(date, uuid, integer, text) to authenticated;
grant execute on function public.record_incoming_item(date, uuid, integer, text) to authenticated;
grant execute on function public.record_outgoing_item(date, uuid, integer, text) to authenticated;

-- 8. ROW LEVEL SECURITY & POLICIES

-- Tabel Users
alter table public.users enable row level security;

drop policy if exists "users_select_self_or_admin" on public.users;
create policy "users_select_self_or_admin"
on public.users
for select
to authenticated
using (auth.uid() = id or public.current_user_role() = 'admin');

drop policy if exists "users_update_admin_only" on public.users;
create policy "users_update_admin_only"
on public.users
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Tabel Products
alter table public.products enable row level security;

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
on public.products
for select
to authenticated
using (true);

drop policy if exists "products_insert_admin_only" on public.products;
create policy "products_insert_admin_only"
on public.products
for insert
to authenticated
with check (public.current_user_role() = 'admin');

drop policy if exists "products_update_admin_only" on public.products;
create policy "products_update_admin_only"
on public.products
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "products_delete_admin_only" on public.products;
create policy "products_delete_admin_only"
on public.products
for delete
to authenticated
using (public.current_user_role() = 'admin');

-- Tabel Incoming Items
alter table public.incoming_items enable row level security;

drop policy if exists "incoming_read_authenticated" on public.incoming_items;
create policy "incoming_read_authenticated"
on public.incoming_items
for select
to authenticated
using (true);

drop policy if exists "incoming_insert_admin_staff" on public.incoming_items;
create policy "incoming_insert_admin_staff"
on public.incoming_items
for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'staff')
  and created_by = auth.uid()
);

drop policy if exists "incoming_update_admin_only" on public.incoming_items;
create policy "incoming_update_admin_only"
on public.incoming_items
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "incoming_delete_admin_only" on public.incoming_items;
create policy "incoming_delete_admin_only"
on public.incoming_items
for delete
to authenticated
using (public.current_user_role() = 'admin');

-- Tabel Outgoing Items
alter table public.outgoing_items enable row level security;

drop policy if exists "outgoing_read_authenticated" on public.outgoing_items;
create policy "outgoing_read_authenticated"
on public.outgoing_items
for select
to authenticated
using (true);

drop policy if exists "outgoing_insert_admin_staff" on public.outgoing_items;
create policy "outgoing_insert_admin_staff"
on public.outgoing_items
for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'staff')
  and created_by = auth.uid()
);

drop policy if exists "outgoing_update_admin_only" on public.outgoing_items;
create policy "outgoing_update_admin_only"
on public.outgoing_items
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "outgoing_delete_admin_only" on public.outgoing_items;
create policy "outgoing_delete_admin_only"
on public.outgoing_items
for delete
to authenticated
using (public.current_user_role() = 'admin');

-- Tabel Inventory Logs
alter table public.inventory_logs enable row level security;

drop policy if exists "inventory_logs_select_authenticated" on public.inventory_logs;
create policy "inventory_logs_select_authenticated"
on public.inventory_logs
for select
to authenticated
using (true);

drop policy if exists "inventory_logs_insert_admin_only" on public.inventory_logs;
create policy "inventory_logs_insert_admin_only"
on public.inventory_logs
for insert
to authenticated
with check (public.current_user_role() = 'admin');

drop policy if exists "inventory_logs_update_admin_only" on public.inventory_logs;
create policy "inventory_logs_update_admin_only"
on public.inventory_logs
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "inventory_logs_delete_admin_only" on public.inventory_logs;
create policy "inventory_logs_delete_admin_only"
on public.inventory_logs
for delete
to authenticated
using (public.current_user_role() = 'admin');

-- Tabel Stock Logs
alter table public.stock_logs enable row level security;

drop policy if exists "stock_logs_select_role_window" on public.stock_logs;
create policy "stock_logs_select_role_window"
on public.stock_logs
for select
to authenticated
using (
  public.current_user_role() = 'admin'
  or (
    public.current_user_role() = 'staff'
    and created_at >= timezone('utc', now()) - interval '30 days'
  )
);

drop policy if exists "stock_logs_insert_admin_only" on public.stock_logs;
create policy "stock_logs_insert_admin_only"
on public.stock_logs
for insert
to authenticated
with check (public.current_user_role() = 'admin');

drop policy if exists "stock_logs_update_admin_only" on public.stock_logs;
create policy "stock_logs_update_admin_only"
on public.stock_logs
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "stock_logs_delete_admin_only" on public.stock_logs;
create policy "stock_logs_delete_admin_only"
on public.stock_logs
for delete
to authenticated
using (public.current_user_role() = 'admin');
