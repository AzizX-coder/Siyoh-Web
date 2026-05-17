-- Materialized views for the recommendation engine.
-- Refreshed by pg_cron (see 0007). REFRESH CONCURRENTLY requires unique index.

-- ------------------------------------------------------------------
-- story_score: global popularity + recency
-- ------------------------------------------------------------------
-- 14-day half-life on freshness; ln-scaled plays + likes.
-- Range: 0 (cold + unread) to ~10 (fresh hit).

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

comment on materialized view public.story_score
  is 'Global per-story popularity score. Refreshed hourly by pg_cron.';

-- ------------------------------------------------------------------
-- user_tag_affinity: per-user tag interest
-- ------------------------------------------------------------------
-- Aggregates user signals (view=1, like=3, bookmark=5) by story tags,
-- then normalizes per user so scores are comparable across users.

create materialized view if not exists public.user_tag_affinity as
with raw as (
  -- views
  select sv.user_id, unnest(s.tags) as tag, count(*)::float * 1 as w
  from public.story_views sv
  join public.stories s on s.id = sv.story_id
  where sv.user_id is not null
  group by sv.user_id, unnest(s.tags)
  union all
  -- likes
  select l.user_id, unnest(s.tags), count(*)::float * 3
  from public.likes l
  join public.stories s on s.id = l.story_id
  group by l.user_id, unnest(s.tags)
  union all
  -- bookmarks
  select b.user_id, unnest(s.tags), count(*)::float * 5
  from public.bookmarks b
  join public.stories s on s.id = b.story_id
  group by b.user_id, unnest(s.tags)
),
summed as (
  select user_id, tag, sum(w) as raw_score
  from raw
  group by user_id, tag
),
totals as (
  select user_id, sum(raw_score) as total from summed group by user_id
)
select
  s.user_id,
  s.tag,
  case when t.total > 0 then s.raw_score / t.total else 0 end as score,
  now() as refreshed_at
from summed s
join totals t on t.user_id = s.user_id;

create unique index if not exists user_tag_affinity_pk on public.user_tag_affinity (user_id, tag);
create index        if not exists user_tag_affinity_user_idx on public.user_tag_affinity (user_id);

comment on materialized view public.user_tag_affinity
  is 'Per-user tag preference 0..1 (sum-normalized). Refreshed every 3h by pg_cron.';
