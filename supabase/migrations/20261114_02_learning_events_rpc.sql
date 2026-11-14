CREATE OR REPLACE FUNCTION public.append_learning_event(p_slug text, p_secret text, p_event_id uuid, p_app_id text, p_card_id text, p_event_data jsonb, p_occurred_at timestamp with time zone)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_profile_id uuid; begin if p_slug is null or p_secret is null or p_secret !~ '^[0-9a-f]{64}$' then raise exception 'Invalid credentials' using errcode='22023'; end if; select id into v_profile_id from public.profiles where slug=p_slug and access_token_hash=encode(extensions.digest(p_secret,'sha256'),'hex'); if v_profile_id is null then raise exception 'Access denied' using errcode='42501'; end if; if p_event_id is null or p_app_id is null or p_app_id !~ '^[a-z0-9][a-z0-9-]{0,79}$' or p_card_id is null or length(p_card_id)>200 or length(p_card_id)=0 or p_event_data is null or jsonb_typeof(p_event_data)<>'object' or pg_catalog.octet_length(p_event_data::text)>16384 or p_occurred_at is null or p_occurred_at>pg_catalog.now()+interval '1 day' then raise exception 'Invalid event' using errcode='22023'; end if; insert into public.learning_events(id,profile_id,app_id,card_id,event_data,occurred_at) values(p_event_id,v_profile_id,p_app_id,p_card_id,p_event_data,p_occurred_at) on conflict(id) do nothing; return true; end $function$
;

CREATE OR REPLACE FUNCTION public.read_learning_events(p_slug text, p_secret text, p_app_id text)
 RETURNS TABLE(event_id uuid, card_id text, event_data jsonb, occurred_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_profile_id uuid; begin if p_slug is null or p_secret is null or p_secret !~ '^[0-9a-f]{64}$' then raise exception 'Invalid credentials' using errcode='22023'; end if; select id into v_profile_id from public.profiles where slug=p_slug and access_token_hash=encode(extensions.digest(p_secret,'sha256'),'hex'); if v_profile_id is null then raise exception 'Access denied' using errcode='42501'; end if; if p_app_id is null or p_app_id !~ '^[a-z0-9][a-z0-9-]{0,79}$' then raise exception 'Invalid app' using errcode='22023'; end if; return query select e.id,e.card_id,e.event_data,e.occurred_at from public.learning_events e where e.profile_id=v_profile_id and e.app_id=p_app_id order by e.occurred_at,e.id limit 10000; end $function$
;
revoke all on function public.append_learning_event(text,text,uuid,text,text,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.append_learning_event(text,text,uuid,text,text,jsonb,timestamptz) to anon;
revoke all on function public.read_learning_events(text,text,text) from public,anon,authenticated;
grant execute on function public.read_learning_events(text,text,text) to anon;
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
