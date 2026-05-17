-- Audit log: who changed what, when. Investor-grade trail.

create table if not exists public.audit_log (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null check (action in ('insert', 'update', 'delete')),
  entity_kind text not null,
  entity_id   uuid not null,
  diff        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_entity_idx on public.audit_log (entity_kind, entity_id, created_at desc);
create index if not exists audit_log_actor_idx  on public.audit_log (actor_id, created_at desc) where actor_id is not null;

alter table public.audit_log enable row level security;

-- Admin-only read. Inserts happen through SECURITY DEFINER triggers.
drop policy if exists "audit admin read" on public.audit_log;
create policy "audit admin read" on public.audit_log for select
  using (public.is_admin());

-- Helper: insert an audit row from a trigger.
create or replace function public.log_audit(
  p_action text, p_entity_kind text, p_entity_id uuid, p_diff jsonb
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor_id, action, entity_kind, entity_id, diff)
  values (auth.uid(), p_action, p_entity_kind, p_entity_id, p_diff);
end $$;

-- Triggers on stories (update + delete) and comments (delete) — high-signal events.
create or replace function public.audit_stories()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'UPDATE') then
    perform public.log_audit('update', 'story', new.id, jsonb_build_object(
      'before', to_jsonb(old) - 'body' - 'search',
      'after',  to_jsonb(new) - 'body' - 'search'
    ));
    return new;
  elsif (tg_op = 'DELETE') then
    perform public.log_audit('delete', 'story', old.id, to_jsonb(old) - 'body' - 'search');
    return old;
  end if;
  return null;
end $$;

drop trigger if exists stories_audit on public.stories;
create trigger stories_audit
  after update or delete on public.stories
  for each row execute function public.audit_stories();

create or replace function public.audit_comments_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_audit('delete', 'comment', old.id, to_jsonb(old));
  return old;
end $$;

drop trigger if exists comments_delete_audit on public.comments;
create trigger comments_delete_audit
  after delete on public.comments
  for each row execute function public.audit_comments_delete();

comment on table public.audit_log
  is 'Append-only trail of mutations on sensitive entities (stories, comments). Admin-readable.';
