-- Full-text search index on stories.title + stories.body.
-- Using 'simple' config (no stemming) because Uzbek dictionary isn't shipped
-- with stock Postgres. Acceptable lossy match for v1; revisit with a custom
-- dictionary at >100k stories.

alter table public.stories
  add column if not exists search tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(title,    '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(excerpt,  '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(body,     '')), 'D')
  ) stored;

create index if not exists stories_search_idx on public.stories using gin (search);

comment on column public.stories.search
  is 'Auto-maintained tsvector for full-text search (title=A, subtitle=B, excerpt=C, body=D).';
