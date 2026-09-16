create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12, 2) not null check (price >= 0),
  cost numeric(12, 2) not null default 0 check (cost >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  tax numeric(12, 2) not null default 0 check (tax >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  payment_method text check (payment_method in ('cash', 'card', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_change integer not null check (quantity_change <> 0),
  reason text not null check (reason in ('restock', 'sale', 'return', 'adjustment')),
  order_id uuid references public.orders(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists inventory_movements_product_id_idx on public.inventory_movements(product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_movements enable row level security;

-- Development policies. Replace these with authenticated staff policies before production.
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "public manage products" on public.products;
create policy "public manage products" on public.products for all using (true) with check (true);
drop policy if exists "public manage customers" on public.customers;
create policy "public manage customers" on public.customers for all using (true) with check (true);
drop policy if exists "public manage orders" on public.orders;
create policy "public manage orders" on public.orders for all using (true) with check (true);
drop policy if exists "public manage order items" on public.order_items;
create policy "public manage order items" on public.order_items for all using (true) with check (true);
drop policy if exists "public manage inventory movements" on public.inventory_movements;
create policy "public manage inventory movements" on public.inventory_movements for all using (true) with check (true);

insert into public.categories (name) values
  ('Kitchen'), ('Home'), ('Accessories'), ('Stationery')
on conflict (name) do nothing;

insert into public.products (sku, name, category_id, price, cost, stock_quantity, low_stock_threshold)
select seed.sku, seed.name, categories.id, seed.price, seed.cost, seed.stock_quantity, seed.low_stock_threshold
from (values
  ('KIT-001', 'Ceramic Pour Over', 'Kitchen', 28.00, 12.00, 12, 5),
  ('ACC-001', 'Linen Market Tote', 'Accessories', 34.00, 15.00, 8, 5),
  ('KIT-002', 'Amber Glass Tumbler', 'Kitchen', 18.00, 7.00, 24, 5),
  ('STA-001', 'Daily Notes Journal', 'Stationery', 16.00, 6.00, 6, 5),
  ('HOM-001', 'Cedar + Smoke Candle', 'Home', 26.00, 10.00, 3, 5),
  ('HOM-002', 'Woven Planter', 'Home', 42.00, 19.00, 9, 5)
) as seed(sku, name, category_name, price, cost, stock_quantity, low_stock_threshold)
join public.categories on categories.name = seed.category_name
on conflict (sku) do nothing;
