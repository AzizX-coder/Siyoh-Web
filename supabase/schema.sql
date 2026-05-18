-- ============================================================================
-- SIYOH — Supabase schema
-- Run this in the Supabase SQL editor (or psql) on a fresh project.
-- Order: extensions → tables → indexes → RLS policies → triggers → seed.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

do $$ begin
  create type story_type as enum ('text', 'audio', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type story_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('reader', 'writer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contest_status as enum ('upcoming', 'open', 'judging', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'dismissed', 'actioned');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_seed int not null default 0,
  cover_url text,
  locale text not null default 'uz' check (locale in ('uz', 'en', 'ru')),
  role user_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- ============================================================================
-- STORIES
-- ============================================================================

create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  subtitle text,
  excerpt text not null,
  body text,
  type story_type not null default 'text',
  audio_url text,
  cover_seed int not null default 0,
  cover_url text,
  mins int not null default 5,
  plays int not null default 0,
  likes int not null default 0,
  status story_status not null default 'draft',
  author_id uuid not null references public.profiles(id) on delete cascade,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title,    '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(excerpt,  '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(body,     '')), 'D')
  ) stored
);

create index if not exists stories_author_idx on public.stories (author_id);
create index if not exists stories_status_idx on public.stories (status);
create index if not exists stories_published_idx on public.stories (published_at desc);
create index if not exists stories_tags_idx on public.stories using gin (tags);
create index if not exists stories_search_idx on public.stories using gin (search);

-- ============================================================================
-- COMMENTS
-- ============================================================================

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_story_idx on public.comments (story_id);

-- ============================================================================
-- LIKES, BOOKMARKS, FOLLOWS
-- ============================================================================

create table if not exists public.likes (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create table if not exists public.bookmarks (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ============================================================================
-- CONTESTS
-- ============================================================================

create table if not exists public.contests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  starts_at date not null,
  ends_at date not null,
  prize text,
  status contest_status not null default 'upcoming',
  created_at timestamptz not null default now()
);

create table if not exists public.contest_entries (
  id uuid primary key default uuid_generate_v4(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique (contest_id, story_id)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,            -- 'follow' | 'like' | 'comment' | 'contest' | ...
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ============================================================================
-- REPORTS (moderation queue)
-- ============================================================================

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_kind text not null,     -- 'story' | 'comment' | 'profile'
  target_id uuid not null,
  reason text not null,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Maintain stories.likes counter
create or replace function public.bump_story_likes()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.stories set likes = likes + 1 where id = new.story_id;
  elsif (tg_op = 'DELETE') then
    update public.stories set likes = greatest(0, likes - 1) where id = old.story_id;
  end if;
  return null;
end $$;

drop trigger if exists likes_bump on public.likes;
create trigger likes_bump
  after insert or delete on public.likes
  for each row execute function public.bump_story_likes();

-- Updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists stories_touch on public.stories;
create trigger stories_touch before update on public.stories
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.contests enable row level security;
alter table public.contest_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- Helper: is admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all" on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- stories
drop policy if exists "stories public read published" on public.stories;
create policy "stories public read published" on public.stories for select
  using (status = 'published' or author_id = auth.uid() or public.is_admin());

drop policy if exists "stories author insert" on public.stories;
create policy "stories author insert" on public.stories for insert
  with check (author_id = auth.uid());

drop policy if exists "stories author update" on public.stories;
create policy "stories author update" on public.stories for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "stories author delete" on public.stories;
create policy "stories author delete" on public.stories for delete
  using (author_id = auth.uid() or public.is_admin());

-- comments
drop policy if exists "comments read" on public.comments;
create policy "comments read" on public.comments for select using (true);

drop policy if exists "comments insert auth" on public.comments;
create policy "comments insert auth" on public.comments for insert
  with check (auth.uid() = author_id);

drop policy if exists "comments author or admin delete" on public.comments;
create policy "comments author or admin delete" on public.comments for delete
  using (author_id = auth.uid() or public.is_admin());

-- likes / bookmarks / follows
drop policy if exists "likes self" on public.likes;
create policy "likes self" on public.likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "likes read" on public.likes;
create policy "likes read" on public.likes for select using (true);

drop policy if exists "bookmarks self" on public.bookmarks;
create policy "bookmarks self" on public.bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "follows self" on public.follows;
create policy "follows self" on public.follows for all
  using (follower_id = auth.uid()) with check (follower_id = auth.uid());

drop policy if exists "follows read" on public.follows;
create policy "follows read" on public.follows for select using (true);

-- contests
drop policy if exists "contests read" on public.contests;
create policy "contests read" on public.contests for select using (true);

drop policy if exists "contests admin write" on public.contests;
create policy "contests admin write" on public.contests for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contest entries read" on public.contest_entries;
create policy "contest entries read" on public.contest_entries for select using (true);

drop policy if exists "contest entries author insert" on public.contest_entries;
create policy "contest entries author insert" on public.contest_entries for insert
  with check (exists (select 1 from public.stories s where s.id = story_id and s.author_id = auth.uid()));

-- notifications
drop policy if exists "notifications self" on public.notifications;
create policy "notifications self" on public.notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reports
drop policy if exists "reports insert auth" on public.reports;
create policy "reports insert auth" on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports admin manage" on public.reports;
create policy "reports admin manage" on public.reports for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS (covers + audio)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true), ('audio', 'audio', true)
on conflict (id) do nothing;

-- Public read for covers + audio
drop policy if exists "covers public read" on storage.objects;
create policy "covers public read" on storage.objects for select
  using (bucket_id in ('covers', 'audio'));

-- Authed upload to own folder (path prefix = user id)
drop policy if exists "covers user upload" on storage.objects;
create policy "covers user upload" on storage.objects for insert
  with check (
    bucket_id in ('covers', 'audio')
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- v2 additions — fresh installs include these.
-- Existing projects: apply the migrations under supabase/migrations/ instead.
-- ============================================================================

-- Push subscriptions (FCM tokens, one per user-device).
create table if not exists public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fcm_token text not null,
  device text,
  platform text not null check (platform in ('web', 'android', 'ios')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (user_id, fcm_token)
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push_subs self" on public.push_subscriptions;
create policy "push_subs self" on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Story views (anon + auth). Powers recommendations and "already read" exclusion.
create table if not exists public.story_views (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  session_id text,
  dwell_ms int not null default 0,
  viewed_at timestamptz not null default now()
);
create index if not exists story_views_story_idx on public.story_views (story_id, viewed_at desc);
create index if not exists story_views_user_idx  on public.story_views (user_id, viewed_at desc) where user_id is not null;
alter table public.story_views enable row level security;
drop policy if exists "story_views insert anyone" on public.story_views;
create policy "story_views insert anyone" on public.story_views for insert with check (true);
drop policy if exists "story_views self read" on public.story_views;
create policy "story_views self read" on public.story_views for select
  using (user_id = auth.uid() or public.is_admin());

create or replace function public.increment_story_plays(p_story_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.stories set plays = plays + 1 where id = p_story_id;
$$;
grant execute on function public.increment_story_plays(uuid) to anon, authenticated;

-- Audit log (admin-readable mutation trail).
create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('insert', 'update', 'delete')),
  entity_kind text not null,
  entity_id uuid not null,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_entity_idx on public.audit_log (entity_kind, entity_id, created_at desc);
alter table public.audit_log enable row level security;
drop policy if exists "audit admin read" on public.audit_log;
create policy "audit admin read" on public.audit_log for select using (public.is_admin());

-- ============================================================================
-- Materialized views: story_score + user_tag_affinity
-- (Refresh schedule: see pg_cron section below.)
-- ============================================================================

create materialized view if not exists public.story_score as
select
  s.id as story_id,
  s.author_id,
  s.published_at,
  s.tags,
  (
    0.45 * exp(- extract(epoch from (now() - coalesce(s.published_at, s.created_at))) / (86400.0 * 14))
    + 0.30 * ln(1 + s.plays)
    + 0.25 * ln(1 + s.likes)
  ) as score,
  now() as refreshed_at
from public.stories s
where s.status = 'published';

create unique index if not exists story_score_pk on public.story_score (story_id);
create index        if not exists story_score_idx on public.story_score (score desc);

create materialized view if not exists public.user_tag_affinity as
with raw as (
  select sv.user_id, unnest(s.tags) as tag, count(*)::float * 1 as w
  from public.story_views sv
  join public.stories s on s.id = sv.story_id
  where sv.user_id is not null
  group by sv.user_id, unnest(s.tags)
  union all
  select l.user_id, unnest(s.tags), count(*)::float * 3
  from public.likes l join public.stories s on s.id = l.story_id
  group by l.user_id, unnest(s.tags)
  union all
  select b.user_id, unnest(s.tags), count(*)::float * 5
  from public.bookmarks b join public.stories s on s.id = b.story_id
  group by b.user_id, unnest(s.tags)
),
summed as (select user_id, tag, sum(w) as raw_score from raw group by user_id, tag),
totals as (select user_id, sum(raw_score) as total from summed group by user_id)
select s.user_id, s.tag,
       case when t.total > 0 then s.raw_score / t.total else 0 end as score,
       now() as refreshed_at
from summed s join totals t on t.user_id = s.user_id;

create unique index if not exists user_tag_affinity_pk on public.user_tag_affinity (user_id, tag);

-- ============================================================================
-- Recommendation function (anonymous-safe; falls back to pure popularity)
-- ============================================================================

create or replace function public.recommend_for_user(
  p_user_id uuid default null,
  p_limit   int  default 20
)
returns setof public.stories
language sql stable
as $$
  with base as (
    select s.*, coalesce(sc.score, 0) as base_score
    from public.stories s
    left join public.story_score sc on sc.story_id = s.id
    where s.status = 'published' and (p_user_id is null or s.author_id <> p_user_id)
  ),
  affinity as (
    select b.id, coalesce(sum(uta.score), 0) as affinity_sum
    from base b
    left join lateral (
      select uta.score from public.user_tag_affinity uta
      where uta.user_id = p_user_id and uta.tag = any(b.tags)
    ) uta on true
    group by b.id
  ),
  followed as (select following_id from public.follows where follower_id = p_user_id),
  already_read as (
    select distinct story_id from public.story_views
    where user_id = p_user_id and viewed_at > now() - interval '60 days'
  )
  select b.id, b.slug, b.title, b.subtitle, b.excerpt, b.body, b.type, b.audio_url,
         b.cover_seed, b.cover_url, b.mins, b.plays, b.likes, b.status, b.author_id,
         b.tags, b.created_at, b.updated_at, b.published_at, b.search
  from base b join affinity a on a.id = b.id
  order by (
    b.base_score + 1.5 * a.affinity_sum
    + case when b.author_id in (select following_id from followed) then 0.5 else 0 end
    - case when b.id in (select story_id from already_read) then 0.8 else 0 end
  ) desc, b.published_at desc nulls last
  limit greatest(1, p_limit);
$$;

grant execute on function public.recommend_for_user(uuid, int) to anon, authenticated;

-- ============================================================================
-- pg_cron schedules (optional but recommended for fresh popularity scores)
-- Comment these out if pg_cron isn't enabled in your Supabase plan.
-- ============================================================================

create extension if not exists pg_cron;

do $$ begin
  -- Hourly story score refresh
  perform cron.schedule('siyoh-refresh-story-score', '0 * * * *',
    $cron$ refresh materialized view concurrently public.story_score; $cron$);
exception when others then null; end $$;

do $$ begin
  perform cron.schedule('siyoh-refresh-user-tag-affinity', '15 */3 * * *',
    $cron$ refresh materialized view concurrently public.user_tag_affinity; $cron$);
exception when others then null; end $$;

-- ============================================================================
-- Notification dispatcher (in-app insert; web push via Edge Function — see
-- supabase/functions/notify-user/. Falls back to in-app only when not set.)
-- ============================================================================

create extension if not exists pg_net;

create or replace function public.dispatch_notify(
  p_user_id uuid, p_kind text, p_payload jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_url text := current_setting('app.notify_url', true);
  v_key text := current_setting('app.notify_key', true);
begin
  if v_url is null or v_url = '' then
    insert into public.notifications (user_id, kind, payload) values (p_user_id, p_kind, p_payload);
    return;
  end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||coalesce(v_key,'')),
    body := jsonb_build_object('user_id', p_user_id, 'kind', p_kind, 'payload', p_payload)
  );
end $$;

create or replace function public.on_like_insert() returns trigger language plpgsql security definer set search_path = public as $$
declare v_author uuid; v_slug text;
begin
  select author_id, slug into v_author, v_slug from public.stories where id = new.story_id;
  if v_author is null or v_author = new.user_id then return new; end if;
  perform public.dispatch_notify(v_author, 'like',
    jsonb_build_object('from', new.user_id, 'story_id', new.story_id, 'story_slug', v_slug));
  return new;
end $$;
drop trigger if exists likes_notify on public.likes;
create trigger likes_notify after insert on public.likes for each row execute function public.on_like_insert();

create or replace function public.on_follow_insert() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.follower_id = new.following_id then return new; end if;
  perform public.dispatch_notify(new.following_id, 'follow', jsonb_build_object('from', new.follower_id));
  return new;
end $$;
drop trigger if exists follows_notify on public.follows;
create trigger follows_notify after insert on public.follows for each row execute function public.on_follow_insert();

create or replace function public.on_comment_insert() returns trigger language plpgsql security definer set search_path = public as $$
declare v_author uuid; v_slug text;
begin
  select author_id, slug into v_author, v_slug from public.stories where id = new.story_id;
  if v_author is null or v_author = new.author_id then return new; end if;
  perform public.dispatch_notify(v_author, 'comment',
    jsonb_build_object('from', new.author_id, 'story_id', new.story_id, 'story_slug', v_slug, 'comment_id', new.id));
  return new;
end $$;
drop trigger if exists comments_notify on public.comments;
create trigger comments_notify after insert on public.comments for each row execute function public.on_comment_insert();
