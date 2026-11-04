-- Short analyses written by the group, one per person per listing.
create table public.opinions (
  participant_id uuid not null references public.participants (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (participant_id, listing_id)
);

create index opinions_listing_id_idx on public.opinions (listing_id);

alter table public.opinions enable row level security;
revoke all on public.opinions from anon, authenticated;

-- Saves (or, with an empty body, deletes) the participant's analysis of a listing.
create or replace function public.save_opinion(p_password text, p_participant_id uuid, p_listing_id uuid, p_body text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $fn$
declare
  v_body text := trim(coalesce(p_body, ''));
begin
  perform private.assert_password(p_password);

  if not exists (select 1 from public.participants where id = p_participant_id and is_confirmed) then
    raise exception 'invalid_participant';
  end if;

  if not exists (select 1 from public.listings where id = p_listing_id and is_active) then
    raise exception 'invalid_listing';
  end if;

  if v_body = '' then
    delete from public.opinions where participant_id = p_participant_id and listing_id = p_listing_id;
    return jsonb_build_object('ok', true, 'deleted', true);
  end if;

  if length(v_body) > 500 then
    raise exception 'opinion_too_long';
  end if;

  insert into public.opinions (participant_id, listing_id, body)
  values (p_participant_id, p_listing_id, v_body)
  on conflict (participant_id, listing_id)
  do update set body = excluded.body, updated_at = now();

  return jsonb_build_object('ok', true, 'deleted', false);
end;
$fn$;

revoke all on function public.save_opinion(text, uuid, uuid, text) from public;
grant execute on function public.save_opinion(text, uuid, uuid, text) to anon, authenticated;

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
        'highlights', to_jsonb(l.highlights),
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
    ), '[]'::jsonb),
    'opinions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'participantId', o.participant_id,
        'listingId', o.listing_id,
        'body', o.body,
        'updatedAt', o.updated_at
      ) order by o.updated_at desc)
      from public.opinions o
      join public.listings l on l.id = o.listing_id and l.is_active
    ), '[]'::jsonb)
  );
end;
$fn$;
