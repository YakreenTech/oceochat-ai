-- Database functions for OceoChat

-- Function to handle user creation from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to relevant tables
create trigger handle_updated_at_users
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_research_projects
  before update on public.research_projects
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_conversations
  before update on public.conversations
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_messages
  before update on public.messages
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_bookmarks
  before update on public.bookmarks
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_annotations
  before update on public.annotations
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_shared_resources
  before update on public.shared_resources
  for each row execute procedure public.handle_updated_at();

-- Function to generate share tokens for conversations
create or replace function public.generate_share_token()
returns text as $$
begin
  return encode(gen_random_bytes(32), 'base64url');
end;
$$ language plpgsql;

-- Function to clean up expired ocean data cache
create or replace function public.cleanup_expired_cache()
returns void as $$
begin
  delete from public.ocean_data_cache where expires_at < now();
end;
$$ language plpgsql security definer;

-- Function to get conversation summary with message count
create or replace function public.get_conversation_summary(conversation_uuid uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'id', c.id,
    'title', c.title,
    'message_count', (select count(*) from public.messages m where m.conversation_id = c.id),
    'last_message_at', (select max(created_at) from public.messages m where m.conversation_id = c.id),
    'has_ocean_data', (select count(*) > 0 from public.messages m where m.conversation_id = c.id and m.ocean_data is not null),
    'created_at', c.created_at,
    'updated_at', c.updated_at
  ) into result
  from public.conversations c
  where c.id = conversation_uuid;
  
  return result;
end;
$$ language plpgsql security definer;

-- Function to search conversations by content
create or replace function public.search_conversations(
  search_query text,
  user_uuid uuid default auth.uid()
)
returns table(
  conversation_id uuid,
  title text,
  relevance real,
  snippet text,
  message_count bigint,
  last_message_at timestamptz
) as $$
begin
  return query
  select 
    c.id as conversation_id,
    c.title,
    ts_rank(to_tsvector('english', c.title || ' ' || coalesce(string_agg(m.content, ' '), '')), plainto_tsquery('english', search_query)) as relevance,
    left(coalesce(string_agg(m.content, ' '), ''), 200) as snippet,
    count(m.id) as message_count,
    max(m.created_at) as last_message_at
  from public.conversations c
  left join public.messages m on m.conversation_id = c.id
  where c.user_id = user_uuid
    and (
      to_tsvector('english', c.title) @@ plainto_tsquery('english', search_query)
      or to_tsvector('english', coalesce(string_agg(m.content, ' '), '')) @@ plainto_tsquery('english', search_query)
    )
  group by c.id, c.title
  order by relevance desc, last_message_at desc;
end;
$$ language plpgsql security definer;

-- Function to get ocean data statistics
create or replace function public.get_ocean_data_stats()
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_cached_queries', (select count(*) from public.ocean_data_cache),
    'cache_hit_rate', (
      select round(
        (sum(access_count)::float / greatest(count(*), 1)) * 100, 2
      ) from public.ocean_data_cache
    ),
    'data_sources', (
      select json_object_agg(data_source, count(*))
      from public.ocean_data_cache
      group by data_source
    ),
    'total_conversations_with_data', (
      select count(distinct conversation_id) 
      from public.messages 
      where ocean_data is not null
    ),
    'avg_processing_time_ms', (
      select round(avg(processing_time_ms), 2)
      from public.messages
      where processing_time_ms is not null
    )
  ) into result;
  
  return result;
end;
$$ language plpgsql security definer;

-- Function to increment ocean data cache access count
create or replace function public.increment_cache_access(cache_id uuid)
returns void as $$
begin
  update public.ocean_data_cache 
  set 
    access_count = access_count + 1,
    last_accessed = now()
  where id = cache_id;
end;
$$ language plpgsql security definer;

-- Function to get user research activity summary
create or replace function public.get_user_activity_summary(user_uuid uuid default auth.uid())
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_conversations', (
      select count(*) from public.conversations where user_id = user_uuid
    ),
    'total_messages', (
      select count(*) from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where c.user_id = user_uuid
    ),
    'total_bookmarks', (
      select count(*) from public.bookmarks where user_id = user_uuid
    ),
    'total_projects', (
      select count(*) from public.research_projects where user_id = user_uuid
    ),
    'conversations_with_ocean_data', (
      select count(distinct c.id) from public.conversations c
      join public.messages m on m.conversation_id = c.id
      where c.user_id = user_uuid and m.ocean_data is not null
    ),
    'most_used_data_sources', (
      select json_agg(data_source) from (
        select jsonb_object_keys(m.ocean_data) as data_source, count(*) as usage_count
        from public.messages m
        join public.conversations c on c.id = m.conversation_id
        where c.user_id = user_uuid and m.ocean_data is not null
        group by data_source
        order by usage_count desc
        limit 5
      ) as top_sources
    ),
    'recent_activity_days', (
      select count(distinct date(created_at))
      from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where c.user_id = user_uuid and created_at > now() - interval '30 days'
    )
  ) into result;
  
  return result;
end;
$$ language plpgsql security definer;
