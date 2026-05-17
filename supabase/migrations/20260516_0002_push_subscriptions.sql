-- FCM push subscriptions — one row per device per user.
-- Stored token is the device-specific FCM registration token.

create table if not exists public.push_subscriptions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  fcm_token    text not null,
  device       text,
  platform     text not null check (platform in ('web', 'android', 'ios')),
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (user_id, fcm_token)
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subs self read" on public.push_subscriptions;
create policy "push_subs self read" on public.push_subscriptions for select
  using (user_id = auth.uid());

drop policy if exists "push_subs self write" on public.push_subscriptions;
create policy "push_subs self write" on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "push_subs admin" on public.push_subscriptions;
create policy "push_subs admin" on public.push_subscriptions for all
  using (public.is_admin()) with check (public.is_admin());
