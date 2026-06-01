-- ============================================================
--  Panini WM 2026 Tracker – Supabase-Datenbankschema
--  Einmalig im Supabase SQL-Editor ausführen
--  (Dashboard -> SQL Editor -> New query -> einfügen -> Run)
-- ============================================================

-- Eine Zeile pro Nutzer; die komplette Sammlung steckt als JSON in "data".
create table if not exists public.collections (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: jede:r sieht und ändert NUR die eigene Sammlung.
alter table public.collections enable row level security;

drop policy if exists "collections_select_own" on public.collections;
drop policy if exists "collections_insert_own" on public.collections;
drop policy if exists "collections_update_own" on public.collections;
drop policy if exists "collections_delete_own" on public.collections;

create policy "collections_select_own"
  on public.collections for select
  using (auth.uid() = user_id);

create policy "collections_insert_own"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "collections_update_own"
  on public.collections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "collections_delete_own"
  on public.collections for delete
  using (auth.uid() = user_id);
