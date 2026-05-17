-- ============================================================
-- SaveMyBolivianos — Supabase initial schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  default_currency text not null default 'BOB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_currency text not null,
  to_currency text not null,
  rate numeric(10, 4) not null default 6.97,
  updated_at timestamptz not null default now(),
  constraint unique_user_rate unique (user_id, from_currency, to_currency)
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('cash','bank','card','cooperative','binance','wise','airtm','safe','crypto')),
  currency text not null check (currency in ('USD','BOB')),
  balance numeric(15, 2) not null default 0,
  color text not null default '#6C63FF',
  icon text not null default '💰',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  icon text,
  color text,
  type text check (type in ('income','expense')),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(15, 2) not null,
  currency text not null check (currency in ('USD','BOB')),
  type text not null check (type in ('income','expense','transfer')),
  description text,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete set null,
  contact_name text not null,
  contact_avatar text,
  amount numeric(15, 2) not null,
  currency text not null check (currency in ('USD','BOB')),
  paid_amount numeric(15, 2) not null default 0,
  interest_rate numeric(5, 2) not null default 0,
  type text not null check (type in ('lent','borrowed')),
  status text not null default 'active' check (status in ('active','completed','overdue')),
  due_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loan_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid references public.loans(id) on delete cascade not null,
  amount numeric(15, 2) not null,
  currency text not null check (currency in ('USD','BOB')),
  payment_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount numeric(15, 2) not null,
  current_amount numeric(15, 2) not null default 0,
  currency text not null check (currency in ('USD','BOB')),
  target_date timestamptz,
  icon text,
  color text,
  status text not null default 'active' check (status in ('active','completed','paused')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.loans enable row level security;
alter table public.loan_payments enable row level security;
alter table public.savings_goals enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Exchange rates
create policy "Users can manage own exchange rates" on public.exchange_rates
  for all using (auth.uid() = user_id);

-- Wallets
create policy "Users can manage own wallets" on public.wallets
  for all using (auth.uid() = user_id);

-- Categories
create policy "Users can manage own categories" on public.categories
  for all using (auth.uid() = user_id);

-- Transactions
create policy "Users can manage own transactions" on public.transactions
  for all using (auth.uid() = user_id);

-- Loans
create policy "Users can manage own loans" on public.loans
  for all using (auth.uid() = user_id);

-- Loan payments (scoped via loan ownership)
create policy "Users can manage own loan payments" on public.loan_payments
  for all using (
    exists (
      select 1 from public.loans
      where loans.id = loan_payments.loan_id
        and loans.user_id = auth.uid()
    )
  );

-- Savings goals
create policy "Users can manage own savings goals" on public.savings_goals
  for all using (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at triggers
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_loan_updated
  before update on public.loans
  for each row execute procedure public.handle_updated_at();

create trigger on_wallet_updated
  before update on public.wallets
  for each row execute procedure public.handle_updated_at();

-- Auto-update loan paid_amount + status when payment is added
create or replace function public.handle_loan_payment()
returns trigger language plpgsql as $$
begin
  update public.loans
  set
    paid_amount = paid_amount + new.amount,
    status = case
      when paid_amount + new.amount >= amount then 'completed'
      else status
    end,
    updated_at = now()
  where id = new.loan_id;
  return new;
end;
$$;

create trigger on_loan_payment_added
  after insert on public.loan_payments
  for each row execute procedure public.handle_loan_payment();

-- Auto-update wallet balance on transaction insert
create or replace function public.handle_transaction_balance()
returns trigger language plpgsql as $$
begin
  if new.wallet_id is not null then
    update public.wallets
    set
      balance = balance + case
        when new.type = 'income' then new.amount
        when new.type = 'expense' then -new.amount
        else 0
      end,
      updated_at = now()
    where id = new.wallet_id;
  end if;
  return new;
end;
$$;

create trigger on_transaction_added
  after insert on public.transactions
  for each row execute procedure public.handle_transaction_balance();
