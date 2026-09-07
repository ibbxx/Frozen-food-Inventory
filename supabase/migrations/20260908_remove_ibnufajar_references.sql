-- ==============================================================================
-- Migration: 20260908_remove_ibnufajar_references.sql
-- Deskripsi: Menghapus / memperbarui semua nama pengguna "ibnufajar99" / "ibnufajars99"
--            dan email prefix dari database (tabel users, auth.users metadata, dan view profiles).
-- ==============================================================================

-- 1. Bersihkan tabel public.users dari nama email prefix atau nama pribadi
update public.users
set full_name = case
  when role = 'admin' then 'Admin'
  else 'Staf Gudang'
end
where full_name is null
   or trim(full_name) = ''
   or full_name ilike '%ibnu%ajar%'
   or full_name ilike '%ibnugajar%'
   or full_name = split_part(email, '@', 1);

-- 2. Bersihkan raw_user_meta_data pada auth.users jika ada
update auth.users
set raw_user_meta_data = jsonb_set(
  coalesce(raw_user_meta_data, '{}'::jsonb),
  '{full_name}',
  '"Admin"'
)
where raw_user_meta_data ->> 'full_name' ilike '%ibnu%ajar%'
   or raw_user_meta_data ->> 'full_name' ilike '%ibnugajar%';

-- 3. Perbarui view public.profiles agar selalu menampilkan nama bersih
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

-- 4. Perbarui fungsi trigger user baru agar tidak mengulang email prefix
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

  if v_full_name ilike '%ibnu%ajar%' or v_full_name ilike '%ibnugajar%' then
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
