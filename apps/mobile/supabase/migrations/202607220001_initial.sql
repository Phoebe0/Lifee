create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  base_currency text not null default 'CNY',
  timezone text not null default 'Asia/Shanghai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  name text not null check (char_length(name) between 1 and 30),
  icon text,
  color text,
  sort_order integer not null default 0,
  version bigint not null default 1,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  type text not null check (type in ('income', 'expense')),
  amount_cent bigint not null check (amount_cent > 0),
  currency text not null default 'CNY' check (char_length(currency) = 3),
  occurred_at timestamptz not null,
  note text not null default '' check (char_length(note) <= 500),
  version bigint not null default 1,
  client_mutation_id uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_occurred_idx
  on public.transactions(user_id, occurred_at desc)
  where deleted_at is null;

create index transactions_user_updated_idx
  on public.transactions(user_id, updated_at, id);

create unique index transactions_user_mutation_idx
  on public.transactions(user_id, client_mutation_id)
  where client_mutation_id is not null;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at before update on public.transactions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "profiles_select_own" on public.profiles
for select using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "categories_select_own" on public.categories
for select using ((select auth.uid()) = user_id);
create policy "categories_insert_own" on public.categories
for insert with check ((select auth.uid()) = user_id);
create policy "categories_update_own" on public.categories
for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "categories_delete_own" on public.categories
for delete using ((select auth.uid()) = user_id);

create policy "transactions_select_own" on public.transactions
for select using ((select auth.uid()) = user_id);
create policy "transactions_insert_own" on public.transactions
for insert with check ((select auth.uid()) = user_id);
create policy "transactions_update_own" on public.transactions
for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "transactions_delete_own" on public.transactions
for delete using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
