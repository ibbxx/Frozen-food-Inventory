create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('owner', 'admin', 'warehouse', 'sales');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.unit_type as enum ('pcs', 'pack', 'kg', 'gram', 'box');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.movement_type as enum (
    'inbound',
    'outbound',
    'transfer',
    'adjustment_in',
    'adjustment_out',
    'expired',
    'damaged'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.adjustment_type as enum (
    'spoilage',
    'damage',
    'stock_count_correction',
    'expiry_disposal'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'warehouse',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.storage_locations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type text not null default 'freezer',
  capacity_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid not null references public.product_categories (id) on delete restrict,
  brand text,
  unit public.unit_type not null default 'pack',
  pack_size text,
  min_stock integer not null default 0 check (min_stock >= 0),
  storage_temp_min numeric(5,2),
  storage_temp_max numeric(5,2),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inventory_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  batch_code text not null,
  received_date date not null default current_date,
  production_date date,
  expiry_date date not null,
  buy_price numeric(12,2),
  sell_price numeric(12,2),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint inventory_batches_product_batch_key unique (product_id, batch_code),
  constraint inventory_batches_date_check check (
    production_date is null or expiry_date >= production_date
  )
);

create table if not exists public.inventory_stocks (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.inventory_batches (id) on delete cascade,
  location_id uuid not null references public.storage_locations (id) on delete restrict,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint inventory_stocks_unique_batch_location unique (batch_id, location_id),
  constraint inventory_stocks_reserved_check check (quantity_on_hand >= reserved_quantity)
);

create table if not exists public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text not null unique,
  supplier_id uuid references public.suppliers (id) on delete set null,
  received_by uuid not null references public.profiles (id) on delete restrict,
  received_at timestamptz not null default timezone('utc', now()),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.goods_receipts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  batch_id uuid not null references public.inventory_batches (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  buy_price numeric(12,2),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.dispatches (
  id uuid primary key default gen_random_uuid(),
  dispatch_no text not null unique,
  customer_name text not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  dispatched_at timestamptz not null default timezone('utc', now()),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.dispatch_items (
  id uuid primary key default gen_random_uuid(),
  dispatch_id uuid not null references public.dispatches (id) on delete cascade,
  batch_id uuid not null references public.inventory_batches (id) on delete restrict,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  sell_price numeric(12,2),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  adjustment_type public.adjustment_type not null,
  batch_id uuid not null references public.inventory_batches (id) on delete restrict,
  product_id uuid not null references public.products (id) on delete restrict,
  location_id uuid not null references public.storage_locations (id) on delete restrict,
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text not null,
  approved_by uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  movement_type public.movement_type not null,
  product_id uuid not null references public.products (id) on delete restrict,
  batch_id uuid not null references public.inventory_batches (id) on delete restrict,
  from_location_id uuid references public.storage_locations (id) on delete set null,
  to_location_id uuid references public.storage_locations (id) on delete set null,
  quantity integer not null check (quantity > 0),
  reference_type text not null,
  reference_id uuid,
  reason text,
  performed_by uuid not null references public.profiles (id) on delete restrict,
  performed_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_inventory_batches_product on public.inventory_batches (product_id);
create index if not exists idx_inventory_batches_expiry on public.inventory_batches (expiry_date);
create index if not exists idx_inventory_stocks_location on public.inventory_stocks (location_id);
create index if not exists idx_stock_movements_product on public.stock_movements (product_id, performed_at desc);
create index if not exists idx_stock_movements_batch on public.stock_movements (batch_id, performed_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_product_categories_updated_at on public.product_categories;
create trigger set_product_categories_updated_at
before update on public.product_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

drop trigger if exists set_storage_locations_updated_at on public.storage_locations;
create trigger set_storage_locations_updated_at
before update on public.storage_locations
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_inventory_batches_updated_at on public.inventory_batches;
create trigger set_inventory_batches_updated_at
before update on public.inventory_batches
for each row execute function public.set_updated_at();

drop trigger if exists set_inventory_stocks_updated_at on public.inventory_stocks;
create trigger set_inventory_stocks_updated_at
before update on public.inventory_stocks
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_admin_or_owner()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_app_role() in ('owner', 'admin'), false);
$$;

create or replace function public.has_inventory_write_access()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_app_role() in ('owner', 'admin', 'warehouse'), false);
$$;

create or replace function public.has_dispatch_write_access()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_app_role() in ('owner', 'admin', 'warehouse', 'sales'), false);
$$;

alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.storage_locations enable row level security;
alter table public.products enable row level security;
alter table public.inventory_batches enable row level security;
alter table public.inventory_stocks enable row level security;
alter table public.goods_receipts enable row level security;
alter table public.goods_receipt_items enable row level security;
alter table public.dispatches enable row level security;
alter table public.dispatch_items enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin_or_owner());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin_or_owner())
with check (auth.uid() = id or public.is_admin_or_owner());

drop policy if exists "categories_read_authenticated" on public.product_categories;
create policy "categories_read_authenticated"
on public.product_categories
for select
using (auth.uid() is not null);

drop policy if exists "categories_write_admin" on public.product_categories;
create policy "categories_write_admin"
on public.product_categories
for all
using (public.is_admin_or_owner())
with check (public.is_admin_or_owner());

drop policy if exists "suppliers_read_authenticated" on public.suppliers;
create policy "suppliers_read_authenticated"
on public.suppliers
for select
using (auth.uid() is not null);

drop policy if exists "suppliers_write_admin" on public.suppliers;
create policy "suppliers_write_admin"
on public.suppliers
for all
using (public.is_admin_or_owner())
with check (public.is_admin_or_owner());

drop policy if exists "locations_read_authenticated" on public.storage_locations;
create policy "locations_read_authenticated"
on public.storage_locations
for select
using (auth.uid() is not null);

drop policy if exists "locations_write_admin" on public.storage_locations;
create policy "locations_write_admin"
on public.storage_locations
for all
using (public.is_admin_or_owner())
with check (public.is_admin_or_owner());

drop policy if exists "products_read_authenticated" on public.products;
create policy "products_read_authenticated"
on public.products
for select
using (auth.uid() is not null);

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin"
on public.products
for all
using (public.is_admin_or_owner())
with check (public.is_admin_or_owner());

drop policy if exists "inventory_batches_read_authenticated" on public.inventory_batches;
create policy "inventory_batches_read_authenticated"
on public.inventory_batches
for select
using (auth.uid() is not null);

drop policy if exists "inventory_stocks_read_authenticated" on public.inventory_stocks;
create policy "inventory_stocks_read_authenticated"
on public.inventory_stocks
for select
using (auth.uid() is not null);

drop policy if exists "goods_receipts_read_authenticated" on public.goods_receipts;
create policy "goods_receipts_read_authenticated"
on public.goods_receipts
for select
using (auth.uid() is not null);

drop policy if exists "goods_receipt_items_read_authenticated" on public.goods_receipt_items;
create policy "goods_receipt_items_read_authenticated"
on public.goods_receipt_items
for select
using (auth.uid() is not null);

drop policy if exists "dispatches_read_authenticated" on public.dispatches;
create policy "dispatches_read_authenticated"
on public.dispatches
for select
using (auth.uid() is not null);

drop policy if exists "dispatch_items_read_authenticated" on public.dispatch_items;
create policy "dispatch_items_read_authenticated"
on public.dispatch_items
for select
using (auth.uid() is not null);

drop policy if exists "stock_adjustments_read_authenticated" on public.stock_adjustments;
create policy "stock_adjustments_read_authenticated"
on public.stock_adjustments
for select
using (auth.uid() is not null);

drop policy if exists "stock_movements_read_authenticated" on public.stock_movements;
create policy "stock_movements_read_authenticated"
on public.stock_movements
for select
using (auth.uid() is not null);

create or replace view public.inventory_stock_snapshot
with (security_invoker = true)
as
select
  s.id as stock_id,
  p.id as product_id,
  p.name as product_name,
  c.name as category_name,
  b.id as batch_id,
  b.batch_code,
  b.expiry_date,
  (b.expiry_date - current_date) as days_until_expiry,
  l.name as location_name,
  l.code as location_code,
  s.quantity_on_hand,
  greatest(s.quantity_on_hand - s.reserved_quantity, 0) as available_quantity
from public.inventory_stocks s
join public.inventory_batches b on b.id = s.batch_id
join public.products p on p.id = b.product_id
join public.product_categories c on c.id = p.category_id
join public.storage_locations l on l.id = s.location_id
where s.quantity_on_hand > 0;

create or replace view public.near_expiry_batches
with (security_invoker = true)
as
select *
from public.inventory_stock_snapshot
where days_until_expiry <= 30
order by days_until_expiry asc, expiry_date asc;

create or replace view public.recent_stock_movements
with (security_invoker = true)
as
select
  sm.id,
  sm.movement_type,
  p.name as product_name,
  sm.quantity,
  coalesce(to_location.name, from_location.name) as location_name,
  sm.performed_at
from public.stock_movements sm
join public.products p on p.id = sm.product_id
left join public.storage_locations from_location on from_location.id = sm.from_location_id
left join public.storage_locations to_location on to_location.id = sm.to_location_id
order by sm.performed_at desc;

create or replace view public.dashboard_kpis
with (security_invoker = true)
as
with product_totals as (
  select
    p.id,
    p.min_stock,
    coalesce(sum(s.quantity_on_hand), 0)::integer as quantity_on_hand
  from public.products p
  left join public.inventory_batches b on b.product_id = p.id
  left join public.inventory_stocks s on s.batch_id = b.id
  where p.is_active = true
  group by p.id, p.min_stock
),
expiring as (
  select coalesce(sum(s.quantity_on_hand), 0)::integer as expiring_soon_units
  from public.inventory_batches b
  join public.inventory_stocks s on s.batch_id = b.id
  where s.quantity_on_hand > 0
    and b.expiry_date between current_date and current_date + 30
)
select
  (select count(*)::integer from public.products where is_active = true) as total_products,
  (select coalesce(sum(quantity_on_hand), 0)::integer from product_totals) as total_stock_units,
  (select count(*)::integer from product_totals where quantity_on_hand <= min_stock) as low_stock_products,
  (select expiring_soon_units from expiring) as expiring_soon_units;

create or replace function public.receive_stock(
  p_receipt_no text,
  p_supplier_id uuid,
  p_location_id uuid,
  p_product_id uuid,
  p_batch_code text,
  p_received_date date,
  p_production_date date,
  p_expiry_date date,
  p_quantity integer,
  p_buy_price numeric(12,2),
  p_sell_price numeric(12,2) default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_receipt_id uuid;
  v_batch_id uuid;
begin
  if auth.uid() is null or not public.has_inventory_write_access() then
    raise exception 'not authorized to receive stock';
  end if;

  if p_quantity <= 0 then
    raise exception 'quantity must be greater than zero';
  end if;

  if p_production_date is not null and p_expiry_date < p_production_date then
    raise exception 'expiry date must be on or after production date';
  end if;

  insert into public.goods_receipts (
    receipt_no,
    supplier_id,
    received_by,
    received_at,
    notes
  )
  values (
    p_receipt_no,
    p_supplier_id,
    auth.uid(),
    timezone('utc', now()),
    p_notes
  )
  returning id into v_receipt_id;

  insert into public.inventory_batches (
    product_id,
    supplier_id,
    batch_code,
    received_date,
    production_date,
    expiry_date,
    buy_price,
    sell_price,
    notes
  )
  values (
    p_product_id,
    p_supplier_id,
    p_batch_code,
    p_received_date,
    p_production_date,
    p_expiry_date,
    p_buy_price,
    p_sell_price,
    p_notes
  )
  on conflict (product_id, batch_code)
  do update
    set supplier_id = excluded.supplier_id,
        notes = coalesce(excluded.notes, public.inventory_batches.notes),
        buy_price = coalesce(excluded.buy_price, public.inventory_batches.buy_price),
        sell_price = coalesce(excluded.sell_price, public.inventory_batches.sell_price)
  returning id into v_batch_id;

  insert into public.goods_receipt_items (
    receipt_id,
    product_id,
    batch_id,
    quantity,
    buy_price
  )
  values (
    v_receipt_id,
    p_product_id,
    v_batch_id,
    p_quantity,
    p_buy_price
  );

  insert into public.inventory_stocks (
    batch_id,
    location_id,
    quantity_on_hand,
    reserved_quantity
  )
  values (
    v_batch_id,
    p_location_id,
    p_quantity,
    0
  )
  on conflict (batch_id, location_id)
  do update
    set quantity_on_hand = public.inventory_stocks.quantity_on_hand + excluded.quantity_on_hand,
        updated_at = timezone('utc', now());

  insert into public.stock_movements (
    movement_type,
    product_id,
    batch_id,
    to_location_id,
    quantity,
    reference_type,
    reference_id,
    reason,
    performed_by
  )
  values (
    'inbound',
    p_product_id,
    v_batch_id,
    p_location_id,
    p_quantity,
    'goods_receipt',
    v_receipt_id,
    p_notes,
    auth.uid()
  );

  return v_receipt_id;
end;
$$;

create or replace function public.transfer_stock(
  p_stock_id uuid,
  p_to_location_id uuid,
  p_quantity integer,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source public.inventory_stocks%rowtype;
  v_product_id uuid;
  v_movement_id uuid;
begin
  if auth.uid() is null or not public.has_inventory_write_access() then
    raise exception 'not authorized to transfer stock';
  end if;

  if p_quantity <= 0 then
    raise exception 'quantity must be greater than zero';
  end if;

  select * into v_source
  from public.inventory_stocks
  where id = p_stock_id
  for update;

  if v_source.id is null then
    raise exception 'source stock not found';
  end if;

  if v_source.location_id = p_to_location_id then
    raise exception 'destination must be different from source';
  end if;

  if v_source.quantity_on_hand - v_source.reserved_quantity < p_quantity then
    raise exception 'insufficient available stock';
  end if;

  select product_id into v_product_id
  from public.inventory_batches
  where id = v_source.batch_id;

  update public.inventory_stocks
  set quantity_on_hand = quantity_on_hand - p_quantity
  where id = v_source.id;

  insert into public.inventory_stocks (
    batch_id,
    location_id,
    quantity_on_hand,
    reserved_quantity
  )
  values (
    v_source.batch_id,
    p_to_location_id,
    p_quantity,
    0
  )
  on conflict (batch_id, location_id)
  do update
    set quantity_on_hand = public.inventory_stocks.quantity_on_hand + excluded.quantity_on_hand,
        updated_at = timezone('utc', now());

  insert into public.stock_movements (
    movement_type,
    product_id,
    batch_id,
    from_location_id,
    to_location_id,
    quantity,
    reference_type,
    reason,
    performed_by
  )
  values (
    'transfer',
    v_product_id,
    v_source.batch_id,
    v_source.location_id,
    p_to_location_id,
    p_quantity,
    'transfer',
    p_reason,
    auth.uid()
  )
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;

create or replace function public.create_stock_adjustment(
  p_stock_id uuid,
  p_adjustment_type public.adjustment_type,
  p_quantity_delta integer,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock public.inventory_stocks%rowtype;
  v_product_id uuid;
  v_adjustment_id uuid;
  v_movement_type public.movement_type;
begin
  if auth.uid() is null or not public.has_inventory_write_access() then
    raise exception 'not authorized to adjust stock';
  end if;

  if p_quantity_delta = 0 then
    raise exception 'quantity delta must not be zero';
  end if;

  select * into v_stock
  from public.inventory_stocks
  where id = p_stock_id
  for update;

  if v_stock.id is null then
    raise exception 'stock row not found';
  end if;

  if v_stock.quantity_on_hand + p_quantity_delta < 0 then
    raise exception 'adjustment would result in negative stock';
  end if;

  select product_id into v_product_id
  from public.inventory_batches
  where id = v_stock.batch_id;

  update public.inventory_stocks
  set quantity_on_hand = quantity_on_hand + p_quantity_delta
  where id = v_stock.id;

  insert into public.stock_adjustments (
    adjustment_type,
    batch_id,
    product_id,
    location_id,
    quantity_delta,
    reason,
    approved_by,
    created_by
  )
  values (
    p_adjustment_type,
    v_stock.batch_id,
    v_product_id,
    v_stock.location_id,
    p_quantity_delta,
    p_reason,
    auth.uid(),
    auth.uid()
  )
  returning id into v_adjustment_id;

  v_movement_type := case
    when p_adjustment_type = 'spoilage' then 'damaged'
    when p_adjustment_type = 'damage' then 'damaged'
    when p_adjustment_type = 'expiry_disposal' then 'expired'
    when p_quantity_delta > 0 then 'adjustment_in'
    else 'adjustment_out'
  end;

  insert into public.stock_movements (
    movement_type,
    product_id,
    batch_id,
    from_location_id,
    to_location_id,
    quantity,
    reference_type,
    reference_id,
    reason,
    performed_by
  )
  values (
    v_movement_type,
    v_product_id,
    v_stock.batch_id,
    case when p_quantity_delta < 0 then v_stock.location_id else null end,
    case when p_quantity_delta > 0 then v_stock.location_id else null end,
    abs(p_quantity_delta),
    'stock_adjustment',
    v_adjustment_id,
    p_reason,
    auth.uid()
  );

  return v_adjustment_id;
end;
$$;

create or replace function public.dispatch_stock(
  p_stock_id uuid,
  p_dispatch_no text,
  p_customer_name text,
  p_quantity integer,
  p_sell_price numeric(12,2) default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock public.inventory_stocks%rowtype;
  v_product_id uuid;
  v_dispatch_id uuid;
begin
  if auth.uid() is null or not public.has_dispatch_write_access() then
    raise exception 'not authorized to dispatch stock';
  end if;

  if p_quantity <= 0 then
    raise exception 'quantity must be greater than zero';
  end if;

  select * into v_stock
  from public.inventory_stocks
  where id = p_stock_id
  for update;

  if v_stock.id is null then
    raise exception 'stock row not found';
  end if;

  if v_stock.quantity_on_hand - v_stock.reserved_quantity < p_quantity then
    raise exception 'insufficient available stock';
  end if;

  select product_id into v_product_id
  from public.inventory_batches
  where id = v_stock.batch_id;

  insert into public.dispatches (
    dispatch_no,
    customer_name,
    created_by,
    dispatched_at,
    notes
  )
  values (
    p_dispatch_no,
    p_customer_name,
    auth.uid(),
    timezone('utc', now()),
    p_notes
  )
  returning id into v_dispatch_id;

  insert into public.dispatch_items (
    dispatch_id,
    batch_id,
    product_id,
    quantity,
    sell_price
  )
  values (
    v_dispatch_id,
    v_stock.batch_id,
    v_product_id,
    p_quantity,
    p_sell_price
  );

  update public.inventory_stocks
  set quantity_on_hand = quantity_on_hand - p_quantity
  where id = v_stock.id;

  insert into public.stock_movements (
    movement_type,
    product_id,
    batch_id,
    from_location_id,
    quantity,
    reference_type,
    reference_id,
    reason,
    performed_by
  )
  values (
    'outbound',
    v_product_id,
    v_stock.batch_id,
    v_stock.location_id,
    p_quantity,
    'dispatch',
    v_dispatch_id,
    p_notes,
    auth.uid()
  );

  return v_dispatch_id;
end;
$$;

grant execute on function public.receive_stock(
  text,
  uuid,
  uuid,
  uuid,
  text,
  date,
  date,
  date,
  integer,
  numeric,
  numeric,
  text
) to authenticated;

grant execute on function public.transfer_stock(uuid, uuid, integer, text) to authenticated;
grant execute on function public.create_stock_adjustment(uuid, public.adjustment_type, integer, text) to authenticated;
grant execute on function public.dispatch_stock(uuid, text, text, integer, numeric, text) to authenticated;
