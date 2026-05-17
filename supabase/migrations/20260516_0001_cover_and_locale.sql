-- Add cover image URL + profile locale + profile cover.
-- Cover URL is nullable — stories without an upload fall back to seeded gradient.

alter table public.stories  add column if not exists cover_url text;
alter table public.profiles add column if not exists cover_url text;
alter table public.profiles add column if not exists locale text not null default 'uz'
  check (locale in ('uz', 'en', 'ru'));

comment on column public.stories.cover_url
  is 'Public URL of an uploaded cover image (Supabase Storage). NULL = use cover_seed gradient.';
comment on column public.profiles.cover_url
  is 'Public URL of the profile cover background image. NULL = orange gradient.';
comment on column public.profiles.locale
  is 'User interface language. uz default. Resolved server-side; cookie fallback for anonymous users.';
