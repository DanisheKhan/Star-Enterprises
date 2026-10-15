-- Migration: 20261015000002_catalog_and_inventory.sql
-- Description: Catalog, serialized units, inventory ledger, second-hand intake, and cash sessions.

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  hsn_code text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);

-- 2. BRANDS TABLE
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);

-- 3. PRODUCTS TABLE
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  slug text not null,
  sku text not null,
  description text,
  is_serialized boolean not null default true,
  cost_price numeric(12, 2) not null default 0,
  selling_price numeric(12, 2) not null check (selling_price >= 0),
  min_selling_price numeric(12, 2) not null default 0,
  gst_rate numeric(5, 2) not null default 18.00,
  hsn_code text not null default '8517',
  reorder_level integer not null default 2,
  specs jsonb not null default '{}'::jsonb,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, sku),
  unique (store_id, slug)
);

-- 4. PRODUCT UNITS (SERIALIZED INVENTORY & IMEI)
create table if not exists public.product_units (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  serial_number text not null unique,
  condition_grade text not null default 'new' check (condition_grade in ('new', 'A+', 'A', 'B', 'C', 'refurbished', 'defective')),
  battery_health integer check (battery_health is null or (battery_health >= 0 and battery_health <= 100)),
  purchase_cost numeric(12, 2) not null default 0,
  status text not null default 'in_stock' check (status in ('in_stock', 'reserved', 'sold', 'refurbishing', 'defective', 'returned')),
  warranty_months integer not null default 12,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. AGGREGATE INVENTORY CACHE
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_on_hand integer not null default 0,
  reserved_qty integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (store_id, product_id)
);

-- 6. STOCK MOVEMENTS (IMMUTABLE INSERT-ONLY LEDGER)
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  unit_id uuid references public.product_units(id) on delete set null,
  movement_type text not null check (movement_type in ('purchase', 'sale', 'return', 'adjustment', 'transfer_in', 'transfer_out')),
  quantity integer not null,
  cost_price numeric(12, 2),
  reference_id text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 7. SECOND-HAND INTAKES
create table if not exists public.second_hand_intakes (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  seller_name text not null,
  seller_phone text not null,
  seller_id_type text not null check (seller_id_type in ('aadhaar', 'pan', 'voter_id', 'driving_license')),
  seller_id_number text not null,
  seller_id_doc_url text,
  brand_name text not null,
  model_name text not null,
  imei text not null,
  condition_checklist jsonb not null default '{}'::jsonb,
  calculated_grade text not null,
  agreed_price numeric(12, 2) not null,
  status text not null default 'draft' check (status in ('draft', 'intake_completed', 'added_to_stock', 'rejected')),
  unit_id uuid references public.product_units(id),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 8. CASH SESSIONS
create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  cashier_id uuid not null references public.profiles(id) on delete cascade,
  opened_at timestamptz not null default now(),
  opening_cash numeric(12, 2) not null default 0,
  closed_at timestamptz,
  closing_cash_actual numeric(12, 2),
  closing_cash_expected numeric(12, 2),
  difference numeric(12, 2),
  notes text,
  status text not null default 'open' check (status in ('open', 'closed'))
);

-- Indexes for performance
create index if not exists idx_categories_store on public.categories(store_id);
create index if not exists idx_brands_store on public.brands(store_id);
create index if not exists idx_products_store on public.products(store_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_brand on public.products(brand_id);
create index if not exists idx_product_units_store on public.product_units(store_id);
create index if not exists idx_product_units_product on public.product_units(product_id);
create index if not exists idx_product_units_status on public.product_units(status);
create index if not exists idx_product_units_serial on public.product_units(serial_number);
create index if not exists idx_inventory_store_prod on public.inventory(store_id, product_id);
create index if not exists idx_stock_movements_store on public.stock_movements(store_id);
create index if not exists idx_stock_movements_product on public.stock_movements(product_id);
create index if not exists idx_second_hand_intakes_imei on public.second_hand_intakes(imei);
create index if not exists idx_cash_sessions_store on public.cash_sessions(store_id);

-- ENABLE ROW LEVEL SECURITY
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_units enable row level security;
alter table public.inventory enable row level security;
alter table public.stock_movements enable row level security;
alter table public.second_hand_intakes enable row level security;
alter table public.cash_sessions enable row level security;

-- POLICIES: Categories & Brands (viewable by all active users for public catalog, editable by permitted staff)
create policy "Categories select policy"
  on public.categories for select
  to anon, authenticated
  using (is_active = true or public.user_has_store_access(store_id));

create policy "Categories write policy"
  on public.categories for all
  to authenticated
  using (public.user_has_store_access(store_id, array['owner', 'manager']));

create policy "Brands select policy"
  on public.brands for select
  to anon, authenticated
  using (true);

create policy "Brands write policy"
  on public.brands for all
  to authenticated
  using (public.user_has_store_access(store_id, array['owner', 'manager']));

-- POLICIES: Products
create policy "Products select policy"
  on public.products for select
  to anon, authenticated
  using (is_active = true or public.user_has_store_access(store_id));

create policy "Products write policy"
  on public.products for all
  to authenticated
  using (public.user_has_store_access(store_id, array['owner', 'manager', 'stock_keeper']));

-- POLICIES: Product Units (Private: staff with store access only)
create policy "Product units select policy"
  on public.product_units for select
  to authenticated
  using (public.user_has_store_access(store_id));

create policy "Product units write policy"
  on public.product_units for all
  to authenticated
  using (public.user_has_store_access(store_id, array['owner', 'manager', 'cashier', 'stock_keeper']));

-- POLICIES: Inventory
create policy "Inventory select policy"
  on public.inventory for select
  to anon, authenticated
  using (true);

create policy "Inventory write policy"
  on public.inventory for all
  to authenticated
  using (public.user_has_store_access(store_id, array['owner', 'manager', 'cashier', 'stock_keeper']));

-- POLICIES: Stock Movements (Insert & Select only)
create policy "Stock movements select policy"
  on public.stock_movements for select
  to authenticated
  using (public.user_has_store_access(store_id));

create policy "Stock movements insert policy"
  on public.stock_movements for insert
  to authenticated
  with check (public.user_has_store_access(store_id));

-- POLICIES: Second Hand Intakes
create policy "Second hand intakes select policy"
  on public.second_hand_intakes for select
  to authenticated
  using (public.user_has_store_access(store_id));

create policy "Second hand intakes write policy"
  on public.second_hand_intakes for all
  to authenticated
  using (public.user_has_store_access(store_id, array['owner', 'manager', 'cashier']));

-- POLICIES: Cash Sessions
create policy "Cash sessions select policy"
  on public.cash_sessions for select
  to authenticated
  using (public.user_has_store_access(store_id));

create policy "Cash sessions write policy"
  on public.cash_sessions for all
  to authenticated
  using (public.user_has_store_access(store_id, array['owner', 'manager', 'cashier']));
