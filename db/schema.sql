-- =====================================================
-- Nimbus · Supabase schema
-- Run in the SQL editor of a fresh Supabase project.
-- =====================================================

create extension if not exists "pgcrypto";

-- =====================
-- FARMERS
-- =====================
create table if not exists farmers (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  phone                 text not null,
  latitude              numeric(10,6) not null,
  longitude             numeric(10,6) not null,
  region                text,
  crop_type             text,
  farm_size_ha          numeric,
  season_start          date not null,
  season_end            date not null,
  drought_threshold_mm  numeric default 50,
  coverage_usdc         numeric not null,
  premium_usdc          numeric not null,
  premium_paid          boolean default false,
  stellar_wallet        text,
  stellar_secret        text,
  contract_id           text,
  payout_triggered      boolean default false,
  payout_triggered_at   timestamptz,
  trigger_rainfall_mm   numeric,
  status                text default 'pending'
                        check (status in ('pending','active','triggered','expired','returned')),
  created_at            timestamptz default now()
);

create index if not exists farmers_status_idx          on farmers(status);
create index if not exists farmers_payout_idx          on farmers(payout_triggered);
create index if not exists farmers_created_idx         on farmers(created_at desc);

-- =====================
-- ORACLE CHECKS
-- =====================
create table if not exists oracle_checks (
  id                       uuid primary key default gen_random_uuid(),
  farmer_id                uuid references farmers(id) on delete cascade,
  checked_at               timestamptz default now(),
  season_start             date not null,
  check_date               date not null,
  rainfall_cumulative_mm   numeric,
  threshold_mm             numeric,
  triggered                boolean default false,
  open_meteo_raw           jsonb,
  tx_hash                  text
);

create index if not exists oracle_checks_farmer_idx
  on oracle_checks(farmer_id, checked_at desc);
create index if not exists oracle_checks_triggered_idx
  on oracle_checks(triggered) where triggered = true;

-- =====================
-- COVERAGE POOLS
-- =====================
create table if not exists coverage_pools (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  sponsor_name    text,
  region          text,
  season_start    date,
  season_end      date,
  total_usdc      numeric,
  policies_count  integer default 0,
  contract_id     text,
  status          text default 'active'
                  check (status in ('active','closed','exhausted')),
  created_at      timestamptz default now()
);

create index if not exists coverage_pools_status_idx on coverage_pools(status);

-- =====================
-- ROW LEVEL SECURITY
-- (server-side service-key access only; lock down anon by default)
-- =====================
alter table farmers         enable row level security;
alter table oracle_checks   enable row level security;
alter table coverage_pools  enable row level security;

-- Service role bypasses RLS automatically. Public has no policies, so anon
-- queries return zero rows. Add explicit policies later if you ever expose
-- this DB directly to a browser client.
