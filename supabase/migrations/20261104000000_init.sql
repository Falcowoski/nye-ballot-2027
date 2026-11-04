-- nye-ballot-2027: schema, access rules and RPC functions.
-- Tables are closed to the public API; every read and write goes through
-- SECURITY DEFINER functions that check the shared group password first.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Tables ----------------------------------------------------------------------

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(trim(display_name)) between 1 and 40),
  stay_days int not null default 7 check (stay_days between 1 and 30),
  is_confirmed boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  airbnb_url text,
  total_price numeric(10, 2) check (total_price is null or total_price > 0),
  bedrooms int,
  beds int,
  bathrooms numeric(3, 1),
  beach_access text,
  rating numeric(3, 2),
  review_count int,
  note text,
  suggested_by uuid references public.participants (id) on delete set null,
  photos text[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.votes (
  participant_id uuid primary key references public.participants (id) on delete cascade,
  ranking uuid[] not null check (array_length(ranking, 1) between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_suggested_by_idx on public.listings (suggested_by);

alter table public.participants enable row level security;
alter table public.listings enable row level security;
alter table public.votes enable row level security;

revoke all on public.participants, public.listings, public.votes from anon, authenticated;

-- Private helpers -------------------------------------------------------------

create or replace function private.is_valid_password(p_password text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  -- bcrypt hash of the shared group password (the password itself is never stored)
  select p_password is not null
     and extensions.crypt(p_password, '$2a$10$5xqyPvKfolv1MunCg7kPZu1eNkBuz4hVqT629eNha/n6wNTteGAxO')
       = '$2a$10$5xqyPvKfolv1MunCg7kPZu1eNkBuz4hVqT629eNha/n6wNTteGAxO';
$fn$;

create or replace function private.assert_password(p_password text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $fn$
begin
  if not private.is_valid_password(p_password) then
    raise exception 'invalid_password';
  end if;
end;
$fn$;

revoke all on function private.is_valid_password(text) from public, anon, authenticated;
revoke all on function private.assert_password(text) from public, anon, authenticated;

-- Public RPC ------------------------------------------------------------------

create or replace function public.check_password(p_password text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select private.is_valid_password(p_password);
$fn$;

create or replace function public.get_ballot(p_password text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $fn$
begin
  perform private.assert_password(p_password);

  return jsonb_build_object(
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'name', p.display_name,
        'stayDays', p.stay_days,
        'isConfirmed', p.is_confirmed
      ) order by p.sort_order, p.display_name)
      from public.participants p
    ), '[]'::jsonb),
    'listings', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id,
        'name', l.name,
        'location', l.location,
        'airbnbUrl', l.airbnb_url,
        'totalPrice', l.total_price,
        'bedrooms', l.bedrooms,
        'beds', l.beds,
        'bathrooms', l.bathrooms,
        'beachAccess', l.beach_access,
        'rating', l.rating,
        'reviewCount', l.review_count,
        'note', l.note,
        'suggestedBy', l.suggested_by,
        'photos', to_jsonb(l.photos)
      ) order by l.sort_order, l.created_at)
      from public.listings l
      where l.is_active
    ), '[]'::jsonb),
    'votes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'participantId', v.participant_id,
        'ranking', to_jsonb(v.ranking),
        'updatedAt', v.updated_at
      ) order by v.updated_at)
      from public.votes v
    ), '[]'::jsonb)
  );
end;
$fn$;

create or replace function public.cast_vote(p_password text, p_participant_id uuid, p_ranking uuid[])
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $fn$
declare
  v_required int;
  v_valid int;
begin
  perform private.assert_password(p_password);

  if not exists (
    select 1 from public.participants
    where id = p_participant_id and is_confirmed
  ) then
    raise exception 'invalid_participant';
  end if;

  select least(3, count(*)) into v_required from public.listings where is_active;

  select count(distinct r.id) into v_valid
  from unnest(p_ranking) as r(id)
  join public.listings l on l.id = r.id and l.is_active;

  if p_ranking is null
     or coalesce(array_length(p_ranking, 1), 0) <> v_required
     or v_valid <> v_required then
    raise exception 'invalid_ranking';
  end if;

  insert into public.votes (participant_id, ranking)
  values (p_participant_id, p_ranking)
  on conflict (participant_id)
  do update set ranking = excluded.ranking, updated_at = now();

  return jsonb_build_object('ok', true, 'updatedAt', now());
end;
$fn$;

revoke all on function public.check_password(text) from public;
revoke all on function public.get_ballot(text) from public;
revoke all on function public.cast_vote(text, uuid, uuid[]) from public;
grant execute on function public.check_password(text) to anon, authenticated;
grant execute on function public.get_ballot(text) to anon, authenticated;
grant execute on function public.cast_vote(text, uuid, uuid[]) to anon, authenticated;
