# Frozen Flow Supabase Setup

## 1. Create the Supabase project

1. Create a new Supabase project.
2. Keep the project URL and anon key.
3. Enable email/password auth.

## 2. Run the schema

Apply the SQL migration:

- `supabase/migrations/20260417094500_momqill_inventory.sql`

Then seed reference data:

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
2. Let the trigger create rows in `public.profiles`.
3. Update roles in `public.profiles` manually for the initial setup.

Suggested first users:

- one `admin`
- one or more `staff`

## 5. Transaction model

Do not mutate stock with ad hoc table writes from the client.

Use the provided RPC functions:

- `receive_stock(...)`
- `transfer_stock(...)`
- `create_stock_adjustment(...)`
- `dispatch_stock(...)`

These functions are designed to:

- keep inventory quantities from going negative
- produce movement ledger rows
- maintain batch-based stock integrity

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
