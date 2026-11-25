-- Additive: remembers processed Stripe webhook events so a redelivered event
-- (Stripe retries on timeouts) never grants a pass twice.
create table if not exists public.stripe_events (
  id          text primary key,
  type        text not null,
  created_at  timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
-- No policies: only the service role (webhook) reads or writes this table.
