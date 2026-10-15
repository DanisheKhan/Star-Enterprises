-- Migration: 20261015000004_staff_management_hrms.sql
-- Description: Core HRMS tables for staff management, leaves tracking, payroll register, and stock adjustments

-- 1. STAFF PROFILES TABLE
create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  full_name text not null,
  email text not null unique,
  phone text not null,
  designation text not null,
  department text not null default 'Store Operations',
  primary_store_id uuid references public.stores(id) on delete set null,
  joining_date date not null default current_date,
  emergency_phone text,
  base_salary numeric(12,2) not null default 0,
  bank_name text,
  account_number text,
  ifsc_code text,
  annual_leave_quota int not null default 18,
  status text not null default 'active' check (status in ('active', 'on_leave', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. STAFF LEAVES TABLE
create table if not exists public.staff_leaves (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  leave_type text not null check (leave_type in ('casual', 'sick', 'emergency', 'earned', 'unpaid')),
  start_date date not null,
  end_date date not null,
  total_days int not null check (total_days > 0),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);

-- 3. STAFF SALARIES & PAYROLL REGISTER
create table if not exists public.staff_salaries (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  month_year text not null,
  base_salary numeric(12,2) not null,
  allowances numeric(12,2) not null default 0,
  deductions numeric(12,2) not null default 0,
  net_salary numeric(12,2) not null,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'processing', 'paid')),
  payment_date date,
  payment_method text check (payment_method in ('upi', 'bank_transfer', 'cash', 'cheque')),
  transaction_ref text,
  notes text,
  created_at timestamptz not null default now(),
  unique (staff_id, month_year)
);

-- 4. STOCK ADJUSTMENTS AUDIT TABLE
create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  previous_quantity int not null,
  new_quantity int not null,
  change_quantity int not null,
  reason text not null check (reason in ('restock', 'damage', 'audit_reconcile', 'theft', 'return')),
  notes text,
  created_at timestamptz not null default now()
);

-- Enable RLS on all 4 tables
alter table public.staff_profiles enable row level security;
alter table public.staff_leaves enable row level security;
alter table public.staff_salaries enable row level security;
alter table public.stock_adjustments enable row level security;

-- Policies
create policy "Allow all access to staff_profiles" on public.staff_profiles for all using (true) with check (true);
create policy "Allow all access to staff_leaves" on public.staff_leaves for all using (true) with check (true);
create policy "Allow all access to staff_salaries" on public.staff_salaries for all using (true) with check (true);
create policy "Allow all access to stock_adjustments" on public.stock_adjustments for all using (true) with check (true);
