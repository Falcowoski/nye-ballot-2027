-- Short highlights taken from the Airbnb description, shown apart from Leo's own analysis.
alter table public.listings add column highlights text[] not null default '{}';

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
    ), '[]'::jsonb)
  );
end;
$fn$;
