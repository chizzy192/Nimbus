-- =====================================================
-- Migration 001 · Accounts model
-- Adds the accounts table, an account_id FK on farmers,
-- a singleton admin account, and demo-credit balances.
-- Safe to run multiple times.
-- =====================================================

create extension if not exists "pgcrypto";

create table if not exists accounts (
  id                  uuid primary key default gen_random_uuid(),
  role                text not null default 'farmer'
                      check (role in ('farmer', 'admin')),
  name                text not null,
  phone               text unique,
  email               text,
  stellar_wallet      text,
  stellar_secret      text,
  demo_balance_usdc   numeric not null default 20,
  created_at          timestamptz default now()
);

alter table farmers
  add column if not exists account_id uuid references accounts(id) on delete cascade;

create index if not exists farmers_account_idx on farmers(account_id);

-- Backfill: any existing farmer row without an account gets one now.
-- Phone is the natural account key. Reuse existing wallet/secret.
do $$
declare
  r record;
  acc_id uuid;
begin
  for r in select * from farmers where account_id is null loop
    insert into accounts (name, phone, stellar_wallet, stellar_secret, demo_balance_usdc)
    values (r.name, r.phone, r.stellar_wallet, r.stellar_secret, 20)
    on conflict (phone) do update
      set name = excluded.name,
          stellar_wallet  = coalesce(accounts.stellar_wallet, excluded.stellar_wallet),
          stellar_secret  = coalesce(accounts.stellar_secret, excluded.stellar_secret)
    returning id into acc_id;

    update farmers set account_id = acc_id where id = r.id;
  end loop;
end$$;

-- Seed the platform admin account once.
insert into accounts (role, name, phone, demo_balance_usdc)
values ('admin', 'Nimbus Platform Admin', null, 1000)
on conflict do nothing;

alter table accounts enable row level security;
