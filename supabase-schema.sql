-- ============================================================
-- KITCHEN ERP — Schema para Supabase
-- ============================================================
-- INSTRUCCIONES:
-- 1. Entrá a https://app.supabase.com → tu proyecto → SQL Editor
-- 2. Hacé clic en "New query"
-- 3. Pegá todo este archivo y ejecutá con "Run"
-- ============================================================

-- SUPPLIERS (Proveedores)
create table if not exists suppliers (
  id           uuid primary key default gen_random_uuid(),
  business_name text not null default '',
  trade_name   text not null default '',
  cuit         text not null default '',
  phone        text not null default '',
  email        text not null default '',
  address      text not null default '',
  notes        text not null default '',
  created_at   timestamptz not null default now()
);

-- PURCHASES (Compras)
create table if not exists purchases (
  id            uuid primary key default gen_random_uuid(),
  supplier_id   uuid references suppliers(id) on delete set null,
  supplier_name text not null default '',
  type          text not null default 'factura_b',
  number        text not null default '',
  date          date not null default current_date,
  items         jsonb not null default '[]',
  subtotal      numeric(14,2) not null default 0,
  tax_rate      numeric(5,2) not null default 21,
  taxes         numeric(14,2) not null default 0,
  total         numeric(14,2) not null default 0,
  notes         text not null default '',
  status        text not null default 'confirmed',
  created_at    timestamptz not null default now()
);

-- INGREDIENTS (Insumos)
create table if not exists ingredients (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  category            text not null default 'otros',
  purchase_unit       text not null default 'kg',
  use_unit            text not null default 'kg',
  conversion_factor   numeric(10,4) not null default 1,
  current_cost        numeric(14,2) not null default 0,
  min_stock           numeric(10,3) not null default 0,
  default_supplier_id uuid references suppliers(id) on delete set null,
  notes               text not null default '',
  price_history       jsonb not null default '[]',
  created_at          timestamptz not null default now()
);

-- INVENTORY_MOVEMENTS (Movimientos de inventario)
create table if not exists inventory_movements (
  id              uuid primary key default gen_random_uuid(),
  ingredient_id   uuid not null references ingredients(id) on delete cascade,
  ingredient_name text not null,
  type            text not null,
  quantity        numeric(10,3) not null,
  unit            text not null,
  date            date not null default current_date,
  notes           text not null default '',
  purchase_id     uuid references purchases(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- STOCK_LEVELS (Stock actual)
create table if not exists stock_levels (
  ingredient_id   uuid primary key references ingredients(id) on delete cascade,
  ingredient_name text not null,
  current_stock   numeric(10,3) not null default 0,
  unit            text not null default 'kg',
  min_stock       numeric(10,3) not null default 0,
  last_updated    timestamptz not null default now()
);

-- RECIPES (Recetas)
create table if not exists recipes (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  category             text not null default 'Principal',
  portions             integer not null default 1,
  ingredients          jsonb not null default '[]',
  total_cost           numeric(14,2) not null default 0,
  cost_per_portion     numeric(14,2) not null default 0,
  selling_price        numeric(14,2) not null default 0,
  margin               numeric(14,2) not null default 0,
  food_cost_percentage numeric(5,2) not null default 0,
  notes                text not null default '',
  created_at           timestamptz not null default now()
);

-- FINANCE_ENTRIES (Finanzas)
create table if not exists finance_entries (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  category    text not null,
  description text not null,
  amount      numeric(14,2) not null,
  date        date not null,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

-- EVENTS (Eventos)
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  client_name  text not null default '',
  date         date,
  people       integer not null default 50,
  menu_items   jsonb not null default '[]',
  status       text not null default 'cotizacion',
  venue        text not null default '',
  notes        text not null default '',
  total_cost   numeric(14,2) not null default 0,
  selling_price numeric(14,2) not null default 0,
  margin       numeric(14,2) not null default 0,
  created_at   timestamptz not null default now()
);

-- PRESUPUESTOS
create table if not exists presupuestos (
  id            uuid primary key default gen_random_uuid(),
  number        text unique not null,
  client_name   text not null default '',
  client_phone  text not null default '',
  client_email  text not null default '',
  event_type    text not null default 'otro',
  event_date    date,
  venue         text not null default '',
  people        integer not null default 100,
  lines         jsonb not null default '[]',
  markup_percent numeric(5,2) not null default 30,
  subtotal      numeric(14,2) not null default 0,
  markup_amount numeric(14,2) not null default 0,
  total         numeric(14,2) not null default 0,
  notes         text not null default '',
  status        text not null default 'borrador',
  valid_until   date,
  created_at    timestamptz not null default now()
);

-- PRODUCCION_WEEKS (Producción semanal)
create table if not exists produccion_weeks (
  id          uuid primary key default gen_random_uuid(),
  week_start  date unique not null,
  week_label  text not null,
  days        jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ACCESO PÚBLICO (app single-user sin autenticación)
-- ============================================================
alter table suppliers disable row level security;
alter table purchases disable row level security;
alter table ingredients disable row level security;
alter table inventory_movements disable row level security;
alter table stock_levels disable row level security;
alter table recipes disable row level security;
alter table finance_entries disable row level security;
alter table events disable row level security;
alter table presupuestos disable row level security;
alter table produccion_weeks disable row level security;
