-- =============================================================================
-- Khalifa Foods · Initial schema
-- Multi-tenant-ready, RLS-enabled, append-only orders.
-- Every domain table carries tenant_id + branch_id.
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helper: current tenant/branch settings, set per request
-- -----------------------------------------------------------------------------
create or replace function current_tenant_id() returns uuid
  language sql stable
  as $$ select nullif(current_setting('app.tenant_id', true), '')::uuid $$;

create or replace function current_branch_id() returns uuid
  language sql stable
  as $$ select nullif(current_setting('app.branch_id', true), '')::uuid $$;

-- Updated-at trigger
create or replace function set_updated_at() returns trigger
  language plpgsql
  as $$ begin new.updated_at = now(); return new; end $$;

-- -----------------------------------------------------------------------------
-- Identity & org
-- -----------------------------------------------------------------------------
create table tenants (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  plan          text not null default 'single',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table branches (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  name          text not null,
  address       text,
  phone         text,
  email         text,
  timezone      text not null default 'Asia/Karachi',
  currency      text not null default 'PKR',
  tax_rate_bps  int  not null default 0,  -- basis points; 0 = 0%, 1600 = 16%
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on branches (tenant_id);

create table terminals (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  branch_id     uuid not null references branches(id) on delete cascade,
  name          text not null,
  device_hint   text,
  created_at    timestamptz not null default now()
);

create table users (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  auth_user_id  uuid unique,  -- FK to auth.users when tied
  email         text unique,
  full_name     text not null,
  role          text not null check (role in ('superadmin','owner','manager','cashier','waiter','viewer')),
  locale        text not null default 'en' check (locale in ('en','ur')),
  pin_hash      text,          -- bcrypt for cashier PIN login
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on users (tenant_id);

create table user_branches (
  user_id       uuid not null references users(id) on delete cascade,
  branch_id     uuid not null references branches(id) on delete cascade,
  primary key (user_id, branch_id)
);

create table audit_log (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid,
  actor_user_id uuid,
  action        text not null,
  entity_table  text not null,
  entity_id     uuid,
  before_data   jsonb,
  after_data    jsonb,
  ip_address    inet,
  created_at    timestamptz not null default now()
);
create index on audit_log (tenant_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Menu
-- -----------------------------------------------------------------------------
create table categories (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  slug          text not null,
  name_en       text not null,
  name_ur       text,
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table items (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  category_id   uuid references categories(id) on delete set null,
  sku           text,
  name_en       text not null,
  name_ur       text,
  description_en text,
  description_ur text,
  base_price    numeric(10,2) not null,
  photo_url     text,
  is_available  boolean not null default true,
  is_deal       boolean not null default false,  -- deals live in combos below but referenced here
  allergens     text[] default '{}',
  tags          text[] default '{}',       -- ['halal','spicy','new']
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, sku)
);
create index on items (tenant_id, category_id);

create table variants (
  id            uuid primary key default uuid_generate_v4(),
  item_id       uuid not null references items(id) on delete cascade,
  name_en       text not null,
  name_ur       text,
  price_delta   numeric(10,2) not null default 0,
  sort_order    int not null default 0
);

create table modifier_groups (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  name_en       text not null,
  name_ur       text,
  min_select    int not null default 0,
  max_select    int not null default 1
);

create table modifiers (
  id            uuid primary key default uuid_generate_v4(),
  group_id      uuid not null references modifier_groups(id) on delete cascade,
  name_en       text not null,
  name_ur       text,
  price_delta   numeric(10,2) not null default 0
);

create table item_modifier_groups (
  item_id       uuid not null references items(id) on delete cascade,
  group_id      uuid not null references modifier_groups(id) on delete cascade,
  primary key (item_id, group_id)
);

create table combos (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  slug          text not null,
  category      text not null,  -- 'technologia' | 'twins' | 'family' | 'pizza'
  name_en       text not null,
  name_ur       text,
  description_en text,
  description_ur text,
  price         numeric(10,2) not null,
  photo_url     text,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table combo_lines (
  id            uuid primary key default uuid_generate_v4(),
  combo_id      uuid not null references combos(id) on delete cascade,
  item_id       uuid references items(id) on delete set null,
  free_text     text,  -- when item not yet in catalog
  qty           int not null default 1,
  sort_order    int not null default 0
);

-- -----------------------------------------------------------------------------
-- Stock & recipe
-- -----------------------------------------------------------------------------
create table ingredients (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  name          text not null,
  unit          text not null,  -- 'kg','g','L','ml','ea'
  cost_per_unit numeric(10,4),
  low_stock_at  numeric(10,3),
  is_active     boolean not null default true
);

create table recipes (
  id            uuid primary key default uuid_generate_v4(),
  item_id       uuid not null references items(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  qty           numeric(10,3) not null,
  unique (item_id, ingredient_id)
);

create table stock_ledger (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid not null,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  delta         numeric(10,3) not null,  -- +/-
  reason        text not null,           -- 'sale','purchase','wastage','adjustment','count'
  ref_id        uuid,
  actor_user_id uuid,
  created_at    timestamptz not null default now()
);
create index on stock_ledger (ingredient_id, created_at desc);

create table wastage_log (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid not null,
  ingredient_id uuid not null,
  qty           numeric(10,3) not null,
  reason        text not null,
  notes         text,
  actor_user_id uuid,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Purchasing
-- -----------------------------------------------------------------------------
create table suppliers (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  name          text not null,
  contact_name  text,
  phone         text,
  email         text,
  address       text,
  is_active     boolean not null default true
);

create table purchase_orders (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid not null,
  supplier_id   uuid not null references suppliers(id) on delete restrict,
  po_number     text not null,
  status        text not null default 'draft' check (status in ('draft','sent','partial','received','cancelled')),
  ordered_at    timestamptz,
  expected_at   date,
  total_amount  numeric(12,2),
  notes         text,
  created_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table purchase_order_lines (
  id            uuid primary key default uuid_generate_v4(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  qty           numeric(10,3) not null,
  unit_cost     numeric(10,4) not null
);

create table grn (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid not null,
  purchase_order_id uuid references purchase_orders(id) on delete set null,
  received_at   timestamptz not null default now(),
  received_by   uuid,
  notes         text
);

create table grn_lines (
  id            uuid primary key default uuid_generate_v4(),
  grn_id        uuid not null references grn(id) on delete cascade,
  ingredient_id uuid not null,
  qty           numeric(10,3) not null,
  unit_cost     numeric(10,4)
);

create table supplier_invoices (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  supplier_id   uuid not null references suppliers(id) on delete restrict,
  invoice_no    text not null,
  total_amount  numeric(12,2) not null,
  paid_amount   numeric(12,2) not null default 0,
  due_date      date,
  status        text not null default 'unpaid' check (status in ('unpaid','partial','paid','overdue')),
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Tables & orders
-- -----------------------------------------------------------------------------
create table dining_tables (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid not null,
  label         text not null,
  seats         int not null default 4,
  status        text not null default 'free' check (status in ('free','occupied','dirty','reserved')),
  x_pos         numeric,   -- floor plan coords
  y_pos         numeric,
  created_at    timestamptz not null default now()
);

create table customers (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  name          text not null,
  phone         text,
  email         text,
  addresses     jsonb not null default '[]'::jsonb,
  cnic_ntn      text,
  created_at    timestamptz not null default now(),
  unique (tenant_id, phone)
);

create table orders (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid not null,
  terminal_id   uuid,
  bill_no       bigint,                    -- human-friendly sequential per branch
  channel       text not null check (channel in ('dine_in','takeaway','pickup','delivery')),
  status        text not null default 'received' check (status in ('received','preparing','ready','out_for_delivery','delivered','completed','cancelled')),
  table_id      uuid references dining_tables(id) on delete set null,
  customer_id   uuid references customers(id) on delete set null,
  customer_name text,
  customer_phone text,
  customer_email text,
  delivery_address jsonb,
  pickup_time   timestamptz,
  subtotal      numeric(12,2) not null default 0,
  discount      numeric(12,2) not null default 0,
  tax           numeric(12,2) not null default 0,
  total         numeric(12,2) not null default 0,
  notes         text,
  cashier_user_id uuid,
  waiter_user_id uuid,
  client_ulid   text unique,               -- idempotency key from client
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on orders (tenant_id, branch_id, created_at desc);
create index on orders (bill_no);
create index on orders (status);

-- Sequential bill numbers per branch
create table bill_counters (
  tenant_id  uuid not null,
  branch_id  uuid not null,
  next_no    bigint not null default 1,
  primary key (tenant_id, branch_id)
);

create or replace function next_bill_no(p_tenant uuid, p_branch uuid) returns bigint
  language plpgsql
  as $$
  declare v bigint;
  begin
    insert into bill_counters(tenant_id, branch_id) values (p_tenant, p_branch)
      on conflict do nothing;
    update bill_counters set next_no = next_no + 1
      where tenant_id = p_tenant and branch_id = p_branch
      returning next_no - 1 into v;
    return v;
  end $$;

create table order_lines (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references orders(id) on delete cascade,
  item_id       uuid references items(id) on delete set null,
  combo_id      uuid references combos(id) on delete set null,
  variant_id    uuid references variants(id) on delete set null,
  name_snapshot text not null,
  qty           int not null default 1,
  unit_price    numeric(10,2) not null,
  line_total    numeric(12,2) not null,
  notes         text,
  is_void       boolean not null default false,
  created_at    timestamptz not null default now()
);
create index on order_lines (order_id);

create table order_line_modifiers (
  id            uuid primary key default uuid_generate_v4(),
  order_line_id uuid not null references order_lines(id) on delete cascade,
  modifier_id   uuid references modifiers(id) on delete set null,
  name_snapshot text not null,
  price_delta   numeric(10,2) not null default 0
);

create table payments (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  order_id      uuid not null references orders(id) on delete cascade,
  method        text not null check (method in ('cash','card','jazzcash','easypaisa','raast')),
  amount        numeric(12,2) not null,
  tendered      numeric(12,2),
  change_given  numeric(12,2),
  reference     text,
  actor_user_id uuid,
  created_at    timestamptz not null default now()
);

create table voids (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  order_id      uuid references orders(id) on delete cascade,
  order_line_id uuid references order_lines(id) on delete cascade,
  reason        text not null,
  actor_user_id uuid,
  approver_user_id uuid,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Discounts & shifts
-- -----------------------------------------------------------------------------
create table discounts (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  code          text,
  name          text not null,
  kind          text not null check (kind in ('percent','flat','bogo')),
  value         numeric(10,2) not null,
  min_order     numeric(10,2),
  starts_at     timestamptz,
  ends_at       timestamptz,
  is_active     boolean not null default true,
  unique (tenant_id, code)
);

create table shifts (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid not null,
  terminal_id   uuid,
  opened_by     uuid,
  opened_at     timestamptz not null default now(),
  opening_cash  numeric(12,2) not null default 0,
  closed_by     uuid,
  closed_at     timestamptz,
  closing_cash  numeric(12,2),
  expected_cash numeric(12,2),
  variance      numeric(12,2),
  notes         text
);

create table expenses (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null,
  branch_id     uuid not null,
  category      text not null,   -- 'rent','utilities','salary','repair','misc'
  amount        numeric(12,2) not null,
  vendor        text,
  paid_at       date not null default current_date,
  notes         text,
  actor_user_id uuid,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Sync
-- -----------------------------------------------------------------------------
create table idempotency_keys (
  ulid          text primary key,
  tenant_id     uuid not null,
  entity_table  text not null,
  entity_id     uuid,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Rate limiting (simple bucket)
-- -----------------------------------------------------------------------------
create table rate_limit_counters (
  bucket_key    text primary key,
  count         int not null default 0,
  window_start  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Updated-at triggers
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'tenants','branches','users','categories','items','combos',
      'purchase_orders','orders'
    ])
  loop
    execute format(
      'create trigger set_updated_at_%1$s before update on %1$s
       for each row execute function set_updated_at()',
      t
    );
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Row-level security — deny by default, allow when tenant_id matches
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'tenants','branches','terminals','users','user_branches','audit_log',
      'categories','items','variants','modifier_groups','modifiers','item_modifier_groups',
      'combos','combo_lines',
      'ingredients','recipes','stock_ledger','wastage_log',
      'suppliers','purchase_orders','purchase_order_lines','grn','grn_lines','supplier_invoices',
      'dining_tables','customers','orders','order_lines','order_line_modifiers','payments','voids',
      'discounts','shifts','expenses','idempotency_keys'
    ])
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Policies: tenant-scoped reads and writes. Service role bypasses RLS.
-- For a single-tenant v1 the app sets `app.tenant_id` per request; multi-tenant
-- future turns this into per-user resolution.
create policy tenant_read_tenants on tenants for select using (id = current_tenant_id() or current_tenant_id() is null);

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'branches','terminals','users','audit_log',
      'categories','items','combos',
      'ingredients','stock_ledger','wastage_log',
      'suppliers','purchase_orders','grn','supplier_invoices',
      'dining_tables','customers','orders',
      'discounts','shifts','expenses'
    ])
  loop
    execute format(
      'create policy tenant_all_%1$s on %1$s for all
       using (tenant_id = current_tenant_id())
       with check (tenant_id = current_tenant_id())',
      t
    );
  end loop;
end $$;

-- Nested tables (no tenant_id column) inherit via parent
create policy variants_via_item on variants for all
  using (exists (select 1 from items where items.id = variants.item_id and items.tenant_id = current_tenant_id()));
create policy modifiers_via_group on modifiers for all
  using (exists (select 1 from modifier_groups where modifier_groups.id = modifiers.group_id and modifier_groups.tenant_id = current_tenant_id()));
create policy modgroups_tenant on modifier_groups for all
  using (tenant_id = current_tenant_id());
create policy item_modgroups_via_item on item_modifier_groups for all
  using (exists (select 1 from items where items.id = item_modifier_groups.item_id and items.tenant_id = current_tenant_id()));
create policy recipes_via_item on recipes for all
  using (exists (select 1 from items where items.id = recipes.item_id and items.tenant_id = current_tenant_id()));
create policy combo_lines_via_combo on combo_lines for all
  using (exists (select 1 from combos where combos.id = combo_lines.combo_id and combos.tenant_id = current_tenant_id()));
create policy user_branches_via_user on user_branches for all
  using (exists (select 1 from users where users.id = user_branches.user_id and users.tenant_id = current_tenant_id()));
create policy po_lines_via_po on purchase_order_lines for all
  using (exists (select 1 from purchase_orders where purchase_orders.id = purchase_order_lines.purchase_order_id and purchase_orders.tenant_id = current_tenant_id()));
create policy grn_lines_via_grn on grn_lines for all
  using (exists (select 1 from grn where grn.id = grn_lines.grn_id and grn.tenant_id = current_tenant_id()));
create policy order_lines_via_order on order_lines for all
  using (exists (select 1 from orders where orders.id = order_lines.order_id and orders.tenant_id = current_tenant_id()));
create policy order_line_mods_via_line on order_line_modifiers for all
  using (exists (select 1 from order_lines ol join orders o on o.id = ol.order_id
                 where ol.id = order_line_modifiers.order_line_id and o.tenant_id = current_tenant_id()));
create policy payments_via_order on payments for all
  using (exists (select 1 from orders where orders.id = payments.order_id and orders.tenant_id = current_tenant_id()));
create policy voids_via_order on voids for all
  using (exists (select 1 from orders where orders.id = voids.order_id and orders.tenant_id = current_tenant_id()));
create policy idempotency_tenant on idempotency_keys for all
  using (tenant_id = current_tenant_id());

-- Public read access for menu on the customer website (anon key)
-- Only active items/combos/categories are visible.
create policy anon_read_categories on categories for select to anon
  using (is_active and tenant_id = current_tenant_id());
create policy anon_read_items on items for select to anon
  using (is_available and tenant_id = current_tenant_id());
create policy anon_read_combos on combos for select to anon
  using (is_active and tenant_id = current_tenant_id());
create policy anon_read_combo_lines on combo_lines for select to anon
  using (exists (select 1 from combos where combos.id = combo_lines.combo_id
                 and combos.tenant_id = current_tenant_id()
                 and combos.is_active));
create policy anon_read_branches on branches for select to anon
  using (is_active and tenant_id = current_tenant_id());
create policy anon_read_variants on variants for select to anon
  using (exists (select 1 from items where items.id = variants.item_id and items.is_available));

-- Anon can insert customers and orders for online ordering
create policy anon_insert_customers on customers for insert to anon
  with check (tenant_id = current_tenant_id());
create policy anon_read_own_customer on customers for select to anon
  using (tenant_id = current_tenant_id());
create policy anon_insert_orders on orders for insert to anon
  with check (tenant_id = current_tenant_id() and channel in ('pickup','delivery'));
create policy anon_read_order_by_id on orders for select to anon
  using (tenant_id = current_tenant_id());
create policy anon_insert_order_lines on order_lines for insert to anon
  with check (exists (select 1 from orders where orders.id = order_lines.order_id
                      and orders.tenant_id = current_tenant_id()
                      and orders.channel in ('pickup','delivery')));
create policy anon_read_order_lines on order_lines for select to anon
  using (exists (select 1 from orders where orders.id = order_lines.order_id
                 and orders.tenant_id = current_tenant_id()));
