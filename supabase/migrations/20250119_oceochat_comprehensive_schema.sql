-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Drop existing tables if they exist (for clean setup)
drop table if exists public.research_exports cascade;
drop table if exists public.bookmarks cascade;
drop table if exists public.ocean_data_cache cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.research_projects cascade;
drop table if exists public.team_memberships cascade;
drop table if exists public.annotations cascade;
drop table if exists public.shared_resources cascade;
drop table if exists public.user_sessions cascade;
drop table if exists public.users cascade;

-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'researcher', 'educator', 'admin')),
  preferences jsonb default '{}',
  institution text,
  research_area text,
  expertise_level text default 'beginner' check (expertise_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User sessions for tracking activity
create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_data jsonb default '{}',
  ip_address inet,
  user_agent text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Research projects for organization
create table public.research_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  description text,
  research_area text,
  status text default 'active' check (status in ('active', 'completed', 'archived', 'paused')),
  collaborators uuid[],
  data_sources text[],
  tags text[],
  visibility text default 'private' check (visibility in ('private', 'team', 'public')),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations table
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  project_id uuid references public.research_projects(id) on delete set null,
  title text not null default 'New conversation',
  summary text,
  tags text[],
  is_archived boolean default false,
  is_shared boolean default false,
  share_token text unique,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  ocean_data jsonb,
  processing_time_ms integer,
  model_used text,
  token_count integer,
  is_edited boolean default false,
  parent_message_id uuid references public.messages(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ocean data cache for performance
create table public.ocean_data_cache (
  id uuid primary key default gen_random_uuid(),
  query_hash text unique not null,
  query_params jsonb not null,
  data_source text not null check (data_source in ('argo', 'noaa', 'nasa', 'copernicus', 'incois')),
  data jsonb not null,
  quality_score real default 1.0,
  expires_at timestamptz not null,
  access_count integer default 0,
  last_accessed timestamptz default now(),
  created_at timestamptz default now()
);

-- Research bookmarks with citations
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  title text not null,
  description text,
  query text not null,
  response_data jsonb,
  ocean_data jsonb,
  visualization_config jsonb,
  citation_info jsonb,
  tags text[],
  research_notes text,
  is_public boolean default false,
  bookmark_type text default 'conversation' check (bookmark_type in ('conversation', 'message', 'data', 'visualization')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Research exports tracking
create table public.research_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  export_type text not null check (export_type in ('csv', 'json', 'netcdf', 'matlab', 'pdf', 'docx', 'latex')),
  data_sources text[] not null,
  file_path text,
  file_size_bytes bigint,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  metadata jsonb default '{}',
  download_count integer default 0,
  expires_at timestamptz,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Team memberships for collaboration
create table public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.research_projects(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'admin', 'researcher', 'member', 'viewer')),
  permissions jsonb default '{}',
  invited_by uuid references public.users(id),
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- Annotations for collaborative research
create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.research_projects(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  content text not null,
  annotation_type text default 'comment' check (annotation_type in ('comment', 'highlight', 'question', 'insight')),
  location jsonb, -- For highlighting specific parts
  is_resolved boolean default false,
  parent_annotation_id uuid references public.annotations(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Shared resources for team collaboration
create table public.shared_resources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.research_projects(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  resource_type text not null check (resource_type in ('link', 'file', 'dataset', 'paper', 'tool')),
  url text,
  file_path text,
  metadata jsonb default '{}',
  permissions jsonb default '{}',
  access_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Performance indexes
create index idx_users_email on public.users(email);
create index idx_users_role on public.users(role);
create index idx_users_research_area on public.users(research_area);

create index idx_conversations_user_id on public.conversations(user_id);
create index idx_conversations_project_id on public.conversations(project_id);
create index idx_conversations_created_at on public.conversations(created_at desc);
create index idx_conversations_tags on public.conversations using gin(tags);
create index idx_conversations_title_search on public.conversations using gin(to_tsvector('english', title));

create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_messages_created_at on public.messages(conversation_id, created_at);
create index idx_messages_role on public.messages(role);
create index idx_messages_content_search on public.messages using gin(to_tsvector('english', content));
create index idx_messages_ocean_data on public.messages using gin(ocean_data);

create index idx_ocean_data_cache_query_hash on public.ocean_data_cache(query_hash);
create index idx_ocean_data_cache_expires_at on public.ocean_data_cache(expires_at);
create index idx_ocean_data_cache_data_source on public.ocean_data_cache(data_source);
create index idx_ocean_data_cache_last_accessed on public.ocean_data_cache(last_accessed desc);

create index idx_bookmarks_user_id on public.bookmarks(user_id);
create index idx_bookmarks_conversation_id on public.bookmarks(conversation_id);
create index idx_bookmarks_tags on public.bookmarks using gin(tags);
create index idx_bookmarks_created_at on public.bookmarks(created_at desc);

create index idx_research_exports_user_id on public.research_exports(user_id);
create index idx_research_exports_status on public.research_exports(status);
create index idx_research_exports_created_at on public.research_exports(created_at desc);

create index idx_research_projects_user_id on public.research_projects(user_id);
create index idx_research_projects_status on public.research_projects(status);
create index idx_research_projects_tags on public.research_projects using gin(tags);
create index idx_research_projects_name_search on public.research_projects using gin(to_tsvector('english', name));

create index idx_team_memberships_project_id on public.team_memberships(project_id);
create index idx_team_memberships_user_id on public.team_memberships(user_id);

create index idx_annotations_project_id on public.annotations(project_id);
create index idx_annotations_conversation_id on public.annotations(conversation_id);
create index idx_annotations_user_id on public.annotations(user_id);

create index idx_shared_resources_project_id on public.shared_resources(project_id);
create index idx_shared_resources_resource_type on public.shared_resources(resource_type);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.user_sessions enable row level security;
alter table public.research_projects enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.ocean_data_cache enable row level security;
alter table public.bookmarks enable row level security;
alter table public.research_exports enable row level security;
alter table public.team_memberships enable row level security;
alter table public.annotations enable row level security;
alter table public.shared_resources enable row level security;
