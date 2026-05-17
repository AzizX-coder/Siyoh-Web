-- Smart-scoring recommendation function.
-- Anonymous fallback: pure story_score.
-- Personalized: story_score × tag affinity × follow-author boost × already-read penalty.

create or replace function public.recommend_for_user(
  p_user_id uuid default null,
  p_limit   int  default 20
)
returns setof public.stories
language sql stable
as $$
  with base as (
    select
      s.*,
      coalesce(sc.score, 0) as base_score
    from public.stories s
    left join public.story_score sc on sc.story_id = s.id
    where s.status = 'published'
      and (p_user_id is null or s.author_id <> p_user_id)
  ),
  affinity as (
    -- Sum tag affinities for each candidate story.
    -- If no affinity rows (cold start), affinity_sum = 0 and recs are pure popularity.
    select
      b.id,
      coalesce(sum(uta.score), 0) as affinity_sum
    from base b
    left join lateral (
      select uta.score
      from public.user_tag_affinity uta
      where uta.user_id = p_user_id
        and uta.tag = any(b.tags)
    ) uta on true
    group by b.id
  ),
  followed as (
    select following_id from public.follows where follower_id = p_user_id
  ),
  already_read as (
    select distinct story_id from public.story_views
    where user_id = p_user_id and viewed_at > now() - interval '60 days'
  ),
  scored as (
    select
      b.*,
      (
        b.base_score
        + 1.5 * a.affinity_sum                                            -- tag affinity boost
        + case when b.author_id in (select following_id from followed) then 0.5 else 0 end
        - case when b.id in (select story_id from already_read) then 0.8 else 0 end
      ) as final_score
    from base b
    join affinity a on a.id = b.id
  )
  select id, slug, title, subtitle, excerpt, body, type, audio_url, cover_seed,
         cover_url, mins, plays, likes, status, author_id, tags,
         created_at, updated_at, published_at, search
  from scored
  order by final_score desc, published_at desc nulls last
  limit greatest(1, p_limit);
$$;

grant execute on function public.recommend_for_user(uuid, int) to anon, authenticated;

comment on function public.recommend_for_user(uuid, int)
  is 'Returns personalized story recommendations. Pass NULL for anonymous = pure trending. Penalizes already-viewed in last 60 days.';
