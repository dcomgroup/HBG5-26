-- Run in Supabase SQL editor or a privileged test connection. No persistent test data.
begin;
select * from public.reserve_profile('integration-a-20261114',repeat('a',64));
select * from public.reserve_profile('integration-b-20261114',repeat('b',64));
select public.append_learning_event('integration-a-20261114',repeat('a',64),'33333333-3333-4333-8333-333333333333'::uuid,'latein','amo|translation','{"correct":true}'::jsonb,now());
select public.append_learning_event('integration-a-20261114',repeat('a',64),'33333333-3333-4333-8333-333333333333'::uuid,'latein','amo|translation','{"correct":true}'::jsonb,now());
do $$ begin
  begin
    perform * from public.read_learning_events('integration-a-20261114',repeat('b',64),'latein');
    raise exception 'SECURITY FAILURE: wrong token read succeeded';
  exception when insufficient_privilege then null; end;
  begin
    perform public.append_learning_event('integration-b-20261114',repeat('a',64),gen_random_uuid(),'latein','amo|translation','{}'::jsonb,now());
    raise exception 'SECURITY FAILURE: wrong token write succeeded';
  exception when insufficient_privilege then null; end;
end $$;
do $$ declare a_count integer; b_count integer; begin
  select count(*) into a_count from public.read_learning_events('integration-a-20261114',repeat('a',64),'latein');
  select count(*) into b_count from public.read_learning_events('integration-b-20261114',repeat('b',64),'latein');
  if a_count <> 1 or b_count <> 0 then raise exception 'Isolation/idempotency failed: a=%, b=%',a_count,b_count; end if;
end $$;
rollback;
