-- A vote may rank 1 to 3 houses; liking only one or two is fine.
create or replace function public.cast_vote(p_password text, p_participant_id uuid, p_ranking uuid[])
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $fn$
declare
  v_count int := coalesce(array_length(p_ranking, 1), 0);
  v_valid int;
begin
  perform private.assert_password(p_password);

  if not exists (
    select 1 from public.participants
    where id = p_participant_id and is_confirmed
  ) then
    raise exception 'invalid_participant';
  end if;

  select count(distinct r.id) into v_valid
  from unnest(p_ranking) as r(id)
  join public.listings l on l.id = r.id and l.is_active;

  if v_count not between 1 and 3 or v_valid <> v_count then
    raise exception 'invalid_ranking';
  end if;

  insert into public.votes (participant_id, ranking)
  values (p_participant_id, p_ranking)
  on conflict (participant_id)
  do update set ranking = excluded.ranking, updated_at = now();

  return jsonb_build_object('ok', true, 'updatedAt', now());
end;
$fn$;
