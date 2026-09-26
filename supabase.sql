-- La Bistro shared sales database
-- Run this once in Supabase SQL Editor.
create table if not exists public.la_bistro_store (
  store_id text primary key,
  payload jsonb not null,
  updated_at timestamptz default now()
);

alter table public.la_bistro_store enable row level security;

grant select, insert, update on public.la_bistro_store to anon, authenticated;

drop policy if exists "la bistro read" on public.la_bistro_store;
drop policy if exists "la bistro insert" on public.la_bistro_store;
drop policy if exists "la bistro update" on public.la_bistro_store;

create policy "la bistro read"
on public.la_bistro_store for select
to anon, authenticated
using (true);

create policy "la bistro insert"
on public.la_bistro_store for insert
to anon, authenticated
with check (true);

create policy "la bistro update"
on public.la_bistro_store for update
to anon, authenticated
using (true)
with check (true);
