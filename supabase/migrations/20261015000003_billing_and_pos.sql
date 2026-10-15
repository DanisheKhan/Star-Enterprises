-- Migration: 20261015000003_billing_and_pos.sql
-- Description: Invoices, order items, payments, invoice counters, audit log, and atomic place_sale RPC.

-- 1. INVOICE COUNTERS TABLE
create table if not exists public.invoice_counters (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  financial_year text not null default '2026-27',
  current_number integer not null default 0,
  unique (store_id, financial_year)
);

-- 2. INVOICES TABLE
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  invoice_number text not null,
  financial_year text not null default '2026-27',
  customer_name text not null default 'Walk-in Customer',
  customer_phone text,
  customer_gstin text,
  subtotal numeric(12, 2) not null,
  discount_amount numeric(12, 2) not null default 0,
  cgst_amount numeric(12, 2) not null default 0,
  sgst_amount numeric(12, 2) not null default 0,
  igst_amount numeric(12, 2) not null default 0,
  grand_total numeric(12, 2) not null,
  status text not null default 'paid' check (status in ('paid', 'void', 'refunded')),
  cashier_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (store_id, invoice_number)
);

-- 3. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  unit_id uuid references public.product_units(id) on delete set null,
  item_name text not null,
  serial_number text,
  hsn_code text not null default '8517',
  quantity integer not null default 1,
  unit_price numeric(12, 2) not null,
  discount numeric(12, 2) not null default 0,
  taxable_value numeric(12, 2) not null,
  gst_rate numeric(5, 2) not null default 18.00,
  cgst_amount numeric(12, 2) not null default 0,
  sgst_amount numeric(12, 2) not null default 0,
  igst_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null
);

-- 4. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  payment_method text not null check (payment_method in ('cash', 'upi', 'card', 'emi')),
  amount numeric(12, 2) not null,
  reference_number text,
  created_at timestamptz not null default now()
);

-- 5. AUDIT LOG TABLE
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_invoices_store on public.invoices(store_id);
create index if not exists idx_invoices_created on public.invoices(created_at);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_order_items_invoice on public.order_items(invoice_id);
create index if not exists idx_order_items_product on public.order_items(product_id);
create index if not exists idx_order_items_unit on public.order_items(unit_id);
create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_audit_log_store on public.audit_log(store_id);

-- ENABLE ROW LEVEL SECURITY
alter table public.invoice_counters enable row level security;
alter table public.invoices enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.audit_log enable row level security;

-- POLICIES
create policy "Invoices select policy"
  on public.invoices for select
  to authenticated
  using (public.user_has_store_access(store_id));

create policy "Order items select policy"
  on public.order_items for select
  to authenticated
  using (exists (
    select 1 from public.invoices inv
    where inv.id = order_items.invoice_id and public.user_has_store_access(inv.store_id)
  ));

create policy "Payments select policy"
  on public.payments for select
  to authenticated
  using (exists (
    select 1 from public.invoices inv
    where inv.id = payments.invoice_id and public.user_has_store_access(inv.store_id)
  ));

create policy "Audit log select policy"
  on public.audit_log for select
  to authenticated
  using (store_id is null or public.user_has_store_access(store_id));

-- 6. ATOMIC PLACE_SALE STORED PROCEDURE
create or replace function public.place_sale(
  p_store_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_gstin text,
  p_items jsonb,
  p_payments jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_store record;
  v_prefix text;
  v_fy text := '2026-27';
  v_next_num integer;
  v_invoice_num text;
  v_invoice_id uuid;
  v_item record;
  v_prod record;
  v_unit record;
  v_subtotal numeric(12, 2) := 0;
  v_discount_total numeric(12, 2) := 0;
  v_cgst_total numeric(12, 2) := 0;
  v_sgst_total numeric(12, 2) := 0;
  v_grand_total numeric(12, 2) := 0;
  v_taxable numeric(12, 2);
  v_item_cgst numeric(12, 2);
  v_item_sgst numeric(12, 2);
  v_item_total numeric(12, 2);
  v_unit_id uuid;
  v_qty integer;
  v_price numeric(12, 2);
  v_disc numeric(12, 2);
  v_payment record;
begin
  -- 1. Check Store Access
  if not public.user_has_store_access(p_store_id, array['owner', 'manager', 'cashier']) then
    raise exception 'Permission denied for this store' using errcode = '42501';
  end if;

  -- 2. Fetch Store Details
  select * into v_store from public.stores where id = p_store_id and is_active = true;
  if not found then
    raise exception 'Store not found or inactive';
  end if;
  v_prefix := v_store.invoice_prefix;

  -- 3. Lock & Increment Invoice Counter
  insert into public.invoice_counters (store_id, financial_year, current_number)
  values (p_store_id, v_fy, 1)
  on conflict (store_id, financial_year)
  do update set current_number = public.invoice_counters.current_number + 1
  returning current_number into v_next_num;

  v_invoice_num := v_prefix || '-' || '2026' || '-' || lpad(v_next_num::text, 4, '0');

  -- 4. Calculate Totals from Items
  for v_item in select * from jsonb_to_recordset(p_items) as (
    product_id uuid,
    unit_id uuid,
    quantity integer,
    unit_price numeric,
    discount numeric
  )
  loop
    select * into v_prod from public.products where id = v_item.product_id and store_id = p_store_id;
    if not found then
      raise exception 'Product % not found in store', v_item.product_id;
    end if;

    v_qty := coalesce(v_item.quantity, 1);
    v_price := coalesce(v_item.unit_price, v_prod.selling_price);
    v_disc := coalesce(v_item.discount, 0);

    -- Margin Guard check
    if (v_price - v_disc) < v_prod.min_selling_price then
      raise exception 'Price for % is below minimum permitted selling price of %', v_prod.name, v_prod.min_selling_price;
    end if;

    v_taxable := (v_price - v_disc) * v_qty;
    v_item_cgst := round((v_taxable * (v_prod.gst_rate / 2.0) / 100.0), 2);
    v_item_sgst := round((v_taxable * (v_prod.gst_rate / 2.0) / 100.0), 2);
    v_item_total := v_taxable + v_item_cgst + v_item_sgst;

    v_subtotal := v_subtotal + (v_price * v_qty);
    v_discount_total := v_discount_total + (v_disc * v_qty);
    v_cgst_total := v_cgst_total + v_item_cgst;
    v_sgst_total := v_sgst_total + v_item_sgst;
    v_grand_total := v_grand_total + v_item_total;
  end loop;

  -- 5. Insert Invoice
  insert into public.invoices (
    store_id,
    invoice_number,
    financial_year,
    customer_name,
    customer_phone,
    customer_gstin,
    subtotal,
    discount_amount,
    cgst_amount,
    sgst_amount,
    igst_amount,
    grand_total,
    status,
    cashier_id
  ) values (
    p_store_id,
    v_invoice_num,
    v_fy,
    coalesce(nullif(trim(p_customer_name), ''), 'Walk-in Customer'),
    p_customer_phone,
    p_customer_gstin,
    v_subtotal,
    v_discount_total,
    v_cgst_total,
    v_sgst_total,
    0,
    v_grand_total,
    'paid',
    (select auth.uid())
  ) returning id into v_invoice_id;

  -- 6. Insert Order Items & Process Stock Locking
  for v_item in select * from jsonb_to_recordset(p_items) as (
    product_id uuid,
    unit_id uuid,
    quantity integer,
    unit_price numeric,
    discount numeric
  )
  loop
    select * into v_prod from public.products where id = v_item.product_id;
    v_qty := coalesce(v_item.quantity, 1);
    v_price := coalesce(v_item.unit_price, v_prod.selling_price);
    v_disc := coalesce(v_item.discount, 0);

    v_taxable := (v_price - v_disc) * v_qty;
    v_item_cgst := round((v_taxable * (v_prod.gst_rate / 2.0) / 100.0), 2);
    v_item_sgst := round((v_taxable * (v_prod.gst_rate / 2.0) / 100.0), 2);
    v_item_total := v_taxable + v_item_cgst + v_item_sgst;

    -- If serialized unit is provided, lock & update it
    if v_item.unit_id is not null then
      select * into v_unit from public.product_units
      where id = v_item.unit_id and store_id = p_store_id and status = 'in_stock'
      for update;

      if not found then
        raise exception 'Serialized unit % is not available in stock', v_item.unit_id;
      end if;

      update public.product_units
      set status = 'sold', updated_at = now()
      where id = v_item.unit_id;
    end if;

    -- Insert Order Item
    insert into public.order_items (
      invoice_id,
      product_id,
      unit_id,
      item_name,
      serial_number,
      hsn_code,
      quantity,
      unit_price,
      discount,
      taxable_value,
      gst_rate,
      cgst_amount,
      sgst_amount,
      total_amount
    ) values (
      v_invoice_id,
      v_item.product_id,
      v_item.unit_id,
      v_prod.name,
      v_unit.serial_number,
      v_prod.hsn_code,
      v_qty,
      v_price,
      v_disc,
      v_taxable,
      v_prod.gst_rate,
      v_item_cgst,
      v_item_sgst,
      v_item_total
    );

    -- Insert Stock Movement Ledger
    insert into public.stock_movements (
      store_id,
      product_id,
      unit_id,
      movement_type,
      quantity,
      cost_price,
      reference_id,
      created_by
    ) values (
      p_store_id,
      v_item.product_id,
      v_item.unit_id,
      'sale',
      -v_qty,
      v_prod.cost_price,
      v_invoice_num,
      (select auth.uid())
    );

    -- Decrement Aggregate Inventory
    update public.inventory
    set quantity_on_hand = greatest(0, quantity_on_hand - v_qty),
        updated_at = now()
    where store_id = p_store_id and product_id = v_item.product_id;
  end loop;

  -- 7. Insert Payments
  for v_payment in select * from jsonb_to_recordset(p_payments) as (
    payment_method text,
    amount numeric,
    reference_number text
  )
  loop
    insert into public.payments (
      invoice_id,
      payment_method,
      amount,
      reference_number
    ) values (
      v_invoice_id,
      v_payment.payment_method,
      v_payment.amount,
      v_payment.reference_number
    );
  end loop;

  -- 8. Write Audit Log
  insert into public.audit_log (
    store_id,
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) values (
    p_store_id,
    (select auth.uid()),
    'CREATE_INVOICE',
    'invoice',
    v_invoice_num,
    jsonb_build_object(
      'invoice_id', v_invoice_id,
      'grand_total', v_grand_total,
      'customer', p_customer_name
    )
  );

  return jsonb_build_object(
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_num,
    'grand_total', v_grand_total,
    'created_at', now()
  );
end;
$$;

revoke execute on function public.place_sale(uuid, text, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.place_sale(uuid, text, text, text, jsonb, jsonb) to authenticated;
