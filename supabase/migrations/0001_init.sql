-- Costeo Pro: initial schema
-- profiles, ingredients, products, recipe_items + RLS + auto profile trigger + profitability view

create extension if not exists "pgcrypto";

-- =========================================================
-- profiles
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  business_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, business_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'business_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- updated_at helper
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================
-- ingredients (also covers packaging/materials via `type`)
-- =========================================================
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'ingrediente' check (type in ('ingrediente', 'material')),
  purchased_quantity numeric(12,4) not null check (purchased_quantity > 0),
  unit text not null,
  purchased_price numeric(12,2) not null check (purchased_price >= 0),
  cost_per_unit numeric(14,6) generated always as (purchased_price / purchased_quantity) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ingredients_user_id_idx on public.ingredients(user_id);

alter table public.ingredients enable row level security;

create policy "ingredients_select_own" on public.ingredients
  for select using (auth.uid() = user_id);
create policy "ingredients_insert_own" on public.ingredients
  for insert with check (auth.uid() = user_id);
create policy "ingredients_update_own" on public.ingredients
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ingredients_delete_own" on public.ingredients
  for delete using (auth.uid() = user_id);

create trigger set_ingredients_updated_at
  before update on public.ingredients
  for each row execute function public.set_updated_at();

-- =========================================================
-- products
-- =========================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  sale_price numeric(12,2) not null default 0 check (sale_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_user_id_idx on public.products(user_id);

alter table public.products enable row level security;

create policy "products_select_own" on public.products
  for select using (auth.uid() = user_id);
create policy "products_insert_own" on public.products
  for insert with check (auth.uid() = user_id);
create policy "products_update_own" on public.products
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products_delete_own" on public.products
  for delete using (auth.uid() = user_id);

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =========================================================
-- recipe_items: how much of each ingredient/material a product uses
-- =========================================================
create table public.recipe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  quantity numeric(12,4) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, ingredient_id)
);

create index recipe_items_user_id_idx on public.recipe_items(user_id);
create index recipe_items_product_id_idx on public.recipe_items(product_id);

alter table public.recipe_items enable row level security;

create policy "recipe_items_select_own" on public.recipe_items
  for select using (auth.uid() = user_id);
create policy "recipe_items_insert_own" on public.recipe_items
  for insert with check (auth.uid() = user_id);
create policy "recipe_items_update_own" on public.recipe_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recipe_items_delete_own" on public.recipe_items
  for delete using (auth.uid() = user_id);

create trigger set_recipe_items_updated_at
  before update on public.recipe_items
  for each row execute function public.set_updated_at();

-- =========================================================
-- product_profitability view (always fresh: recalculates on every read)
-- =========================================================
create view public.product_profitability
with (security_invoker = on) as
select
  p.id as product_id,
  p.user_id,
  p.name,
  p.sale_price,
  coalesce(sum(i.cost_per_unit * ri.quantity), 0)::numeric(14,2) as total_cost,
  (p.sale_price - coalesce(sum(i.cost_per_unit * ri.quantity), 0))::numeric(14,2) as profit,
  case
    when p.sale_price > 0
      then round(((p.sale_price - coalesce(sum(i.cost_per_unit * ri.quantity), 0)) / p.sale_price) * 100, 2)
    else 0
  end as margin_percent
from public.products p
left join public.recipe_items ri on ri.product_id = p.id
left join public.ingredients i on i.id = ri.ingredient_id
group by p.id, p.user_id, p.name, p.sale_price;
