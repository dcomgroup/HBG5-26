-- HBG5-26: atomare Profilreservierung (Pilot)
-- Client erzeugt 32 kryptographisch zufaellige Bytes als 64 Hex-Zeichen.
-- Geheimnis nur im URL-Fragment (#key=...), niemals im Query-String.
create or replace function public.reserve_profile(
  p_slug text,
  p_secret text
)
returns table(profile_id uuid, reserved_slug text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_slug is null
     or p_slug !~ '^[a-z0-9][a-z0-9-]{2,63}$'
     or p_secret is null
     or p_secret !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid profile parameters' using errcode = '22023';
  end if;

  return query
  insert into public.profiles (slug, access_token_hash)
  values (
    p_slug,
    encode(extensions.digest(p_secret, 'sha256'), 'hex')
  )
  returning id, slug;

exception
  when unique_violation then
    raise exception 'Profile name already reserved' using errcode = '23505';
end;
$$;

revoke all on function public.reserve_profile(text,text) from public;
revoke all on function public.reserve_profile(text,text) from anon, authenticated;
grant execute on function public.reserve_profile(text,text) to anon;
