# Momqill Supabase Setup

## 1. Create the Supabase project

1. Create a new Supabase project.
2. Keep the project URL and anon key.
3. Enable email/password auth.
4. Wait until the project status is available before running SQL. If the logs
   still show `521`, `57P01`, or `57P03`, the database/auth services are still
   restarting and SQL execution can fail for reasons outside the app schema.

## 2. Run the schema

Apply the consolidated SQL schema from the Supabase SQL Editor:

- `supabase/combined_schema.sql`

If Supabase logs show this internal metadata error first:

- `relation "supabase_migrations.schema_migrations" does not exist`

Run this small repair query once, then run the consolidated schema again:

- `supabase/repair_supabase_migration_metadata.sql`

Then seed sample data, if needed:

- `supabase/seeds/frozen_food_seed.sql`

Legacy schema draft from the earlier batch-based inventory model has been archived to:

- `docs/legacy/20260416221500_frozen_food_inventory.sql`

## 3. Create the frontend env file

Inside the project root:

1. Copy `.env.example` to `.env`
2. Fill:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 4. Create the first users

Recommended:

1. Create users in Supabase Auth.
2. Let the trigger create rows in `public.users`.
3. Update `public.users.full_name` or `public.users.role` from the Team page or SQL Editor if needed.

Suggested first users:

- one `admin`
- one or more `staff`

## 5. Transaction model

Do not mutate stock with ad hoc table writes from the client.

Use the provided RPC functions:

- `process_stock_transaction(...)`
- `record_incoming(...)`
- `record_outgoing(...)`

These functions are designed to:

- keep inventory quantities from going negative
- produce movement ledger rows
- update product stock and transaction history atomically

## 6. Current frontend scope

Current frontend is ready for:

- Supabase Auth sign-in
- protected routes
- dashboard ringkasan dan grafik inventori
- product catalog query and CRUD
- inventory snapshot query
- receiving form and incoming history
- outgoing form and outgoing history
- inventory report filtering and PDF/Excel export
- role-aware team settings shell

Current route map:

- `/dashboard`
- `/products`
- `/inventory`
- `/incoming`
- `/outgoing`
- `/reports`
- `/settings/team`

Legacy `Frontend/` and `Backend/` paths are no longer used in this refactor. The app now runs from the repository root with Vite, while Supabase provides auth, database, and RPC access.
