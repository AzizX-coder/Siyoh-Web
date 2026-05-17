-- Story view events — recommendation signal + denormalized plays counter.
-- user_id is nullable so we can record anonymous reads too (session-scoped).

create table if not exists public.story_views (
  id          uuid primary key default uuid_generate_v4(),
  story_id    uuid not null references public.stories(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  session_id  text,
  dwell_ms    int not null default 0,
  viewed_at   timestamptz not null default now()
);

create index if not exists story_views_story_idx on public.story_views (story_id, viewed_at desc);
create index if not exists story_views_user_idx  on public.story_views (user_id, viewed_at desc) where user_id is not null;

alter table public.story_views enable row level security;

-- Anyone (including anon) may record a view. Throttling happens client-side.
drop policy if exists "story_views insert anyone" on public.story_views;
create policy "story_views insert anyone" on public.story_views for insert
  with check (true);

-- Users see only their own views (for "already read" / history features).
drop policy if exists "story_views self read" on public.story_views;
create policy "story_views self read" on public.story_views for select
  using (user_id = auth.uid() or public.is_admin());

-- RPC to bump stories.plays counter (avoids a round-trip in recordView).
create or replace function public.increment_story_plays(p_story_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.stories set plays = plays + 1 where id = p_story_id;
$$;

grant execute on function public.increment_story_plays(uuid) to anon, authenticated;
