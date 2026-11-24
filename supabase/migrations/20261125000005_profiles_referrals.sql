-- ════════════════════════════════════════════════════════════════
-- PROOFIT — profile decorations, profile photos and referral rewards
-- ════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists avatar_frame text not null default 'none' check (avatar_frame ~ '^[a-z]{2,20}$'),
  add column if not exists banner text not null default 'default' check (banner ~ '^[a-z]{2,20}$'),
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;

alter table public.profiles
  add constraint profiles_not_self_referred check (referred_by is null or referred_by <> id);

create index if not exists profiles_referred_by_idx on public.profiles (referred_by);

-- New XP source: referral rewards (still one claim per key via xp_events_once).
alter table public.xp_events drop constraint if exists xp_events_reason_check;
alter table public.xp_events
  add constraint xp_events_reason_check
  check (reason in ('completion', 'streak_bonus', 'achievement', 'duel_win', 'challenge_complete', 'referral'));

insert into public.achievements (id, name, description, icon, tier, xp_bonus, premium_only) values
  ('recruiter', 'Recruiter', 'Invite 3 friends who complete a check-in.', 'Users', 'silver', 10, false)
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- Public bucket for profile photos (uploads happen server-side after validation).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
