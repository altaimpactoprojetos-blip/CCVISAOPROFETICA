create or replace function public.register_admin_auth_attempt(
  p_key text,
  p_now bigint,
  p_reset_at bigint
)
returns integer
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  current_attempts integer;
begin
  insert into public.admin_login_attempts (key, attempts, reset_at)
  values (p_key, 1, p_reset_at)
  on conflict (key) do update set
    attempts = case when public.admin_login_attempts.reset_at <= p_now then 1 else public.admin_login_attempts.attempts + 1 end,
    reset_at = case when public.admin_login_attempts.reset_at <= p_now then p_reset_at else public.admin_login_attempts.reset_at end
  returning attempts into current_attempts;
  return current_attempts;
end;
$$;

create or replace function public.register_event_submission(
  p_payload text,
  p_owner_email text,
  p_registrant_email text,
  p_event_id integer
)
returns integer
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  event_row public.events%rowtype;
  active_count integer;
  new_id integer;
begin
  select * into event_row
  from public.events
  where id = p_event_id
  for update;

  if not found or not event_row.published or event_row.registration_status <> 'open' then
    return null;
  end if;

  select count(*)::integer into active_count
  from public.submissions
  where event_id = p_event_id and status <> 'cancelado';

  if event_row.capacity is not null and active_count >= event_row.capacity then
    return null;
  end if;

  insert into public.submissions (kind, payload, owner_email, event_id, registrant_email)
  values ('evento', p_payload, p_owner_email, p_event_id, p_registrant_email)
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.update_event_if_capacity(
  p_event_id integer,
  p_name text,
  p_description text,
  p_event_date text,
  p_time text,
  p_location text,
  p_capacity integer,
  p_registration_status text,
  p_published boolean,
  p_image_url text
)
returns integer
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  current_count integer;
begin
  perform 1 from public.events where id = p_event_id for update;
  if not found then return 0; end if;

  select count(*)::integer into current_count
  from public.submissions
  where event_id = p_event_id and status <> 'cancelado';

  if p_capacity is not null and p_capacity < current_count then
    return 0;
  end if;

  update public.events
  set name = p_name,
      description = p_description,
      event_date = p_event_date,
      time = p_time,
      location = p_location,
      capacity = p_capacity,
      registration_status = p_registration_status,
      published = p_published,
      image_url = p_image_url
  where id = p_event_id;
  return 1;
end;
$$;

create or replace function public.update_submission_status(
  p_submission_id integer,
  p_status text
)
returns integer
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  submission_row public.submissions%rowtype;
  event_capacity integer;
  active_count integer;
begin
  select * into submission_row
  from public.submissions
  where id = p_submission_id
  for update;
  if not found then return 0; end if;

  if p_status <> 'cancelado' and submission_row.event_id is not null then
    select capacity into event_capacity
    from public.events
    where id = submission_row.event_id
    for update;
    if not found then return 0; end if;

    select count(*)::integer into active_count
    from public.submissions
    where event_id = submission_row.event_id
      and id <> p_submission_id
      and status <> 'cancelado';
    if event_capacity is not null and active_count >= event_capacity then return 0; end if;
  end if;

  update public.submissions set status = p_status where id = p_submission_id;
  return 1;
end;
$$;

revoke all on function public.register_admin_auth_attempt(text, bigint, bigint) from public, anon, authenticated;
revoke all on function public.register_event_submission(text, text, text, integer) from public, anon, authenticated;
revoke all on function public.update_event_if_capacity(integer, text, text, text, text, text, integer, text, boolean, text) from public, anon, authenticated;
revoke all on function public.update_submission_status(integer, text) from public, anon, authenticated;
grant execute on function public.register_admin_auth_attempt(text, bigint, bigint) to service_role;
grant execute on function public.register_event_submission(text, text, text, integer) to service_role;
grant execute on function public.update_event_if_capacity(integer, text, text, text, text, text, integer, text, boolean, text) to service_role;
grant execute on function public.update_submission_status(integer, text) to service_role;

insert into storage.buckets (id, name, public)
values ('cc-visao-profetica-media', 'cc-visao-profetica-media', false)
on conflict (id) do update set name = excluded.name, public = false;
