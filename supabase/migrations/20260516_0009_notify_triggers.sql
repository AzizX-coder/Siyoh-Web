-- Notification side-effects: when likes/comments/follows happen,
-- fan out via pg_net to the notify-user Edge Function which:
--   1. inserts a row into public.notifications (in-app)
--   2. dispatches FCM push to all push_subscriptions for the user
--
-- This file requires:
--   • pg_net extension enabled
--   • two database settings (admin must set these once):
--       alter database postgres set app.notify_url = 'https://<project>.supabase.co/functions/v1/notify-user';
--       alter database postgres set app.notify_key = '<service-role-jwt-or-shared-secret>';

create extension if not exists pg_net;

-- Helper that fires pg_net to the edge function.
create or replace function public.dispatch_notify(
  p_user_id uuid, p_kind text, p_payload jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_url text := current_setting('app.notify_url', true);
  v_key text := current_setting('app.notify_key', true);
begin
  if v_url is null or v_url = '' then
    -- No URL configured (e.g. local dev) — write the notification row directly so
    -- in-app UX still works, then exit.
    insert into public.notifications (user_id, kind, payload)
    values (p_user_id, p_kind, p_payload);
    return;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || coalesce(v_key, '')
    ),
    body := jsonb_build_object(
      'user_id', p_user_id,
      'kind',    p_kind,
      'payload', p_payload
    )
  );
end $$;

-- Replace the inline notification inserts in app code with DB triggers
-- so notifications are guaranteed (transactional with the underlying event).

-- LIKES
create or replace function public.on_like_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_author uuid;
  v_slug   text;
begin
  select author_id, slug into v_author, v_slug from public.stories where id = new.story_id;
  if v_author is null or v_author = new.user_id then return new; end if;
  perform public.dispatch_notify(
    v_author, 'like',
    jsonb_build_object('from', new.user_id, 'story_id', new.story_id, 'story_slug', v_slug)
  );
  return new;
end $$;

drop trigger if exists likes_notify on public.likes;
create trigger likes_notify after insert on public.likes
  for each row execute function public.on_like_insert();

-- FOLLOWS — replaces the previous in-app insert in actions.ts.
-- (Keep the application insert too as a no-op-safe fallback; it'll fail-soft.)
create or replace function public.on_follow_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.follower_id = new.following_id then return new; end if;
  perform public.dispatch_notify(
    new.following_id, 'follow',
    jsonb_build_object('from', new.follower_id)
  );
  return new;
end $$;

drop trigger if exists follows_notify on public.follows;
create trigger follows_notify after insert on public.follows
  for each row execute function public.on_follow_insert();

-- COMMENTS
create or replace function public.on_comment_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_author uuid;
  v_slug   text;
begin
  select author_id, slug into v_author, v_slug from public.stories where id = new.story_id;
  if v_author is null or v_author = new.author_id then return new; end if;
  perform public.dispatch_notify(
    v_author, 'comment',
    jsonb_build_object('from', new.author_id, 'story_id', new.story_id, 'story_slug', v_slug, 'comment_id', new.id)
  );
  return new;
end $$;

drop trigger if exists comments_notify on public.comments;
create trigger comments_notify after insert on public.comments
  for each row execute function public.on_comment_insert();
