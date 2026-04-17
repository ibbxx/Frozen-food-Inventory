create extension if not exists "pgcrypto";

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

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role public.user_role not null default 'staff',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  current_stock integer not null default 0 check (current_stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.incoming_items (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  supplier_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.outgoing_items (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_products_name on public.products (product_name);
create index if not exists idx_incoming_items_date on public.incoming_items (date desc);
create index if not exists idx_incoming_items_product_id on public.incoming_items (product_id);
create index if not exists idx_outgoing_items_date on public.outgoing_items (date desc);
create index if not exists idx_outgoing_items_product_id on public.outgoing_items (product_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'staff')
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

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

create or replace function public.record_incoming_item(
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
  v_item public.incoming_items;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_quantity <= 0 then
    raise exception 'quantity must be greater than zero';
  end if;

  update public.products
  set current_stock = current_stock + p_quantity
  where id = p_product_id;

  if not found then
    raise exception 'product not found';
  end if;

  insert into public.incoming_items (date, product_id, quantity, supplier_name)
  values (p_date, p_product_id, p_quantity, p_supplier_name)
  returning * into v_item;

  return v_item;
end;
$$;

create or replace function public.record_outgoing_item(
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
  v_current_stock integer;
  v_item public.outgoing_items;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
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

  if p_quantity > v_current_stock then
    raise exception 'insufficient stock';
  end if;

  update public.products
  set current_stock = current_stock - p_quantity
  where id = p_product_id;

  insert into public.outgoing_items (date, product_id, quantity, description)
  values (p_date, p_product_id, p_quantity, p_description)
  returning * into v_item;

  return v_item;
end;
$$;

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.incoming_items enable row level security;
alter table public.outgoing_items enable row level security;

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

drop policy if exists "products_read_authenticated" on public.products;
create policy "products_read_authenticated"
on public.products
for select
to authenticated
using (true);

drop policy if exists "products_write_admin_only" on public.products;
create policy "products_write_admin_only"
on public.products
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

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
with check (public.current_user_role() in ('admin', 'staff'));

drop policy if exists "incoming_update_admin_only" on public.incoming_items;
create policy "incoming_update_admin_only"
on public.incoming_items
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

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
with check (public.current_user_role() in ('admin', 'staff'));

drop policy if exists "outgoing_update_admin_only" on public.outgoing_items;
create policy "outgoing_update_admin_only"
on public.outgoing_items
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
