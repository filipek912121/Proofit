-- ════════════════════════════════════════════════════════════════
-- PROXI — the PROOFIT mascot: per-user look, evolution and unlocks
-- ════════════════════════════════════════════════════════════════

create table public.proxi_profiles (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  look        jsonb not null default '{}'::jsonb,
  seen_stage  integer not null default 1 check (seen_stage between 1 and 4),
  reminders   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create table public.proxi_unlocks (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  item_id      text not null check (item_id ~ '^[a-z]+-[a-z]+$'),
  unlocked_at  timestamptz not null default now(),
  seen         boolean not null default false,
  primary key (user_id, item_id)
);

alter table public.proxi_profiles enable row level security;
alter table public.proxi_unlocks  enable row level security;

-- Read-only for the owner; unlocks are granted and looks saved by the server after validation.
revoke insert, update, delete on public.proxi_profiles, public.proxi_unlocks from authenticated;
grant select on public.proxi_profiles, public.proxi_unlocks to authenticated;
create policy "own proxi profile" on public.proxi_profiles for select to authenticated using (user_id = auth.uid());
create policy "own proxi unlocks" on public.proxi_unlocks for select to authenticated using (user_id = auth.uid());
