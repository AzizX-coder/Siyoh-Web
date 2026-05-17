-- Schedule MV refreshes via pg_cron.
-- pg_cron jobs run in the postgres database; schedule in UTC.

create extension if not exists pg_cron;

-- Hourly: refresh story_score (cheap, global table).
select cron.schedule(
  'siyoh-refresh-story-score',
  '0 * * * *',
  $$ refresh materialized view concurrently public.story_score; $$
);

-- Every 3 hours: refresh user_tag_affinity (heavier, multi-join).
select cron.schedule(
  'siyoh-refresh-user-tag-affinity',
  '15 */3 * * *',
  $$ refresh materialized view concurrently public.user_tag_affinity; $$
);
