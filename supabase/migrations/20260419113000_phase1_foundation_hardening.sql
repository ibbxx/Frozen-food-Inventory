-- Fase 1 hardening untuk schema Momqill yang aktif saat ini.
-- Layer transaksi yang dipakai aplikasi masih berupa incoming_items dan outgoing_items.

alter table public.incoming_items
  add column if not exists created_by uuid references public.users (id) on delete set null;

alter table public.outgoing_items
  add column if not exists created_by uuid references public.users (id) on delete set null;

alter table public.incoming_items
  alter column created_by set default auth.uid();

alter table public.outgoing_items
  alter column created_by set default auth.uid();

update public.incoming_items
set created_by = (
  select id
  from public.users
  order by created_at asc
  limit 1
)
where created_by is null
  and exists (select 1 from public.users);

update public.outgoing_items
set created_by = (
  select id
  from public.users
  order by created_at asc
  limit 1
)
where created_by is null
  and exists (select 1 from public.users);

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

create index if not exists idx_incoming_items_created_by on public.incoming_items (created_by);
create index if not exists idx_outgoing_items_created_by on public.outgoing_items (created_by);
create index if not exists idx_inventory_logs_product_id on public.inventory_logs (product_id);
create index if not exists idx_inventory_logs_source on public.inventory_logs (source_table, source_id);
create index if not exists idx_inventory_logs_created_by on public.inventory_logs (created_by);

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
  v_actor_id uuid := auth.uid();
  v_current_stock integer;
  v_next_stock integer;
  v_item public.incoming_items;
begin
  if v_actor_id is null then
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

  v_next_stock := v_current_stock + p_quantity;

  update public.products
  set current_stock = v_next_stock
  where id = p_product_id;

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
    p_supplier_name,
    v_actor_id
  )
  returning * into v_item;

  insert into public.inventory_logs (
    product_id,
    source_table,
    source_id,
    movement_type,
    quantity_delta,
    stock_before,
    stock_after,
    notes,
    created_by
  )
  values (
    p_product_id,
    'incoming_items',
    v_item.id,
    'incoming',
    p_quantity,
    v_current_stock,
    v_next_stock,
    'Supplier: ' || p_supplier_name,
    v_actor_id
  );

  return v_item;
end;
$$;

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
  v_actor_id uuid := auth.uid();
  v_current_stock integer;
  v_next_stock integer;
  v_item public.outgoing_items;
begin
  if v_actor_id is null then
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

  v_next_stock := v_current_stock - p_quantity;

  update public.products
  set current_stock = v_next_stock
  where id = p_product_id;

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
    p_description,
    v_actor_id
  )
  returning * into v_item;

  insert into public.inventory_logs (
    product_id,
    source_table,
    source_id,
    movement_type,
    quantity_delta,
    stock_before,
    stock_after,
    notes,
    created_by
  )
  values (
    p_product_id,
    'outgoing_items',
    v_item.id,
    'outgoing',
    p_quantity * -1,
    v_current_stock,
    v_next_stock,
    coalesce(p_description, 'Transaksi barang keluar'),
    v_actor_id
  );

  return v_item;
end;
$$;

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

grant execute on function public.record_incoming(date, uuid, integer, text) to authenticated;
grant execute on function public.record_outgoing(date, uuid, integer, text) to authenticated;
grant execute on function public.record_incoming_item(date, uuid, integer, text) to authenticated;
grant execute on function public.record_outgoing_item(date, uuid, integer, text) to authenticated;

alter table public.inventory_logs enable row level security;

drop policy if exists "products_read_authenticated" on public.products;
drop policy if exists "products_write_admin_only" on public.products;
drop policy if exists "products_select_authenticated" on public.products;
drop policy if exists "products_insert_admin_only" on public.products;
drop policy if exists "products_update_admin_only" on public.products;
drop policy if exists "products_delete_admin_only" on public.products;

create policy "products_select_authenticated"
on public.products
for select
to authenticated
using (true);

create policy "products_insert_admin_only"
on public.products
for insert
to authenticated
with check (public.current_user_role() = 'admin');

create policy "products_update_admin_only"
on public.products
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "products_delete_admin_only"
on public.products
for delete
to authenticated
using (public.current_user_role() = 'admin');

drop policy if exists "incoming_read_authenticated" on public.incoming_items;
drop policy if exists "incoming_insert_admin_staff" on public.incoming_items;
drop policy if exists "incoming_update_admin_only" on public.incoming_items;
drop policy if exists "incoming_delete_admin_only" on public.incoming_items;

create policy "incoming_read_authenticated"
on public.incoming_items
for select
to authenticated
using (true);

create policy "incoming_insert_admin_staff"
on public.incoming_items
for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'staff')
  and created_by = auth.uid()
);

create policy "incoming_update_admin_only"
on public.incoming_items
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "incoming_delete_admin_only"
on public.incoming_items
for delete
to authenticated
using (public.current_user_role() = 'admin');

drop policy if exists "outgoing_read_authenticated" on public.outgoing_items;
drop policy if exists "outgoing_insert_admin_staff" on public.outgoing_items;
drop policy if exists "outgoing_update_admin_only" on public.outgoing_items;
drop policy if exists "outgoing_delete_admin_only" on public.outgoing_items;

create policy "outgoing_read_authenticated"
on public.outgoing_items
for select
to authenticated
using (true);

create policy "outgoing_insert_admin_staff"
on public.outgoing_items
for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'staff')
  and created_by = auth.uid()
);

create policy "outgoing_update_admin_only"
on public.outgoing_items
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "outgoing_delete_admin_only"
on public.outgoing_items
for delete
to authenticated
using (public.current_user_role() = 'admin');

drop policy if exists "inventory_logs_select_authenticated" on public.inventory_logs;
drop policy if exists "inventory_logs_insert_admin_only" on public.inventory_logs;
drop policy if exists "inventory_logs_update_admin_only" on public.inventory_logs;
drop policy if exists "inventory_logs_delete_admin_only" on public.inventory_logs;

create policy "inventory_logs_select_authenticated"
on public.inventory_logs
for select
to authenticated
using (true);

create policy "inventory_logs_insert_admin_only"
on public.inventory_logs
for insert
to authenticated
with check (public.current_user_role() = 'admin');

create policy "inventory_logs_update_admin_only"
on public.inventory_logs
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "inventory_logs_delete_admin_only"
on public.inventory_logs
for delete
to authenticated
using (public.current_user_role() = 'admin');
