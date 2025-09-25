-- Row Level Security Policies for OceoChat

-- Users policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- User sessions policies
create policy "Users can view their own sessions" on public.user_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own sessions" on public.user_sessions
  for insert with check (auth.uid() = user_id);

-- Research projects policies
create policy "Users can view their own projects" on public.research_projects
  for select using (
    auth.uid() = user_id 
    or auth.uid() = any(collaborators)
    or visibility = 'public'
    or exists (
      select 1 from public.team_memberships tm 
      where tm.project_id = id and tm.user_id = auth.uid()
    )
  );

create policy "Users can insert their own projects" on public.research_projects
  for insert with check (auth.uid() = user_id);

create policy "Project owners can update their projects" on public.research_projects
  for update using (
    auth.uid() = user_id 
    or exists (
      select 1 from public.team_memberships tm 
      where tm.project_id = id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin')
    )
  );

create policy "Project owners can delete their projects" on public.research_projects
  for delete using (auth.uid() = user_id);

-- Conversations policies
create policy "Users can view their own conversations" on public.conversations
  for select using (
    auth.uid() = user_id
    or (is_shared = true and share_token is not null)
    or exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id 
      and (
        rp.user_id = auth.uid() 
        or auth.uid() = any(rp.collaborators)
        or exists (
          select 1 from public.team_memberships tm 
          where tm.project_id = rp.id and tm.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can insert their own conversations" on public.conversations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own conversations" on public.conversations
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id 
      and exists (
        select 1 from public.team_memberships tm 
        where tm.project_id = rp.id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin', 'researcher')
      )
    )
  );

create policy "Users can delete their own conversations" on public.conversations
  for delete using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view messages from accessible conversations" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id 
      and (
        c.user_id = auth.uid()
        or (c.is_shared = true and c.share_token is not null)
        or exists (
          select 1 from public.research_projects rp 
          where rp.id = c.project_id 
          and (
            rp.user_id = auth.uid() 
            or auth.uid() = any(rp.collaborators)
            or exists (
              select 1 from public.team_memberships tm 
              where tm.project_id = rp.id and tm.user_id = auth.uid()
            )
          )
        )
      )
    )
  );

create policy "Users can insert messages to accessible conversations" on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id 
      and (
        c.user_id = auth.uid()
        or exists (
          select 1 from public.research_projects rp 
          where rp.id = c.project_id 
          and (
            rp.user_id = auth.uid() 
            or auth.uid() = any(rp.collaborators)
            or exists (
              select 1 from public.team_memberships tm 
              where tm.project_id = rp.id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin', 'researcher', 'member')
            )
          )
        )
      )
    )
  );

create policy "Users can update their own messages" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can delete messages from their conversations" on public.messages
  for delete using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- Ocean data cache policies (read-only for all authenticated users)
create policy "Authenticated users can view ocean data cache" on public.ocean_data_cache
  for select using (auth.role() = 'authenticated');

create policy "System can manage ocean data cache" on public.ocean_data_cache
  for all using (auth.role() = 'service_role');

-- Bookmarks policies
create policy "Users can view their own bookmarks" on public.bookmarks
  for select using (auth.uid() = user_id or is_public = true);

create policy "Users can insert their own bookmarks" on public.bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own bookmarks" on public.bookmarks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- Research exports policies
create policy "Users can view their own exports" on public.research_exports
  for select using (auth.uid() = user_id);

create policy "Users can insert their own exports" on public.research_exports
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own exports" on public.research_exports
  for update using (auth.uid() = user_id);

create policy "Users can delete their own exports" on public.research_exports
  for delete using (auth.uid() = user_id);

-- Team memberships policies
create policy "Users can view team memberships for their projects" on public.team_memberships
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id and rp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.team_memberships tm2 
      where tm2.project_id = project_id and tm2.user_id = auth.uid() and tm2.role in ('owner', 'admin')
    )
  );

create policy "Project owners can manage team memberships" on public.team_memberships
  for insert with check (
    exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id and rp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.team_memberships tm 
      where tm.project_id = project_id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin')
    )
  );

create policy "Project owners can update team memberships" on public.team_memberships
  for update using (
    exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id and rp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.team_memberships tm 
      where tm.project_id = project_id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin')
    )
  );

create policy "Project owners can delete team memberships" on public.team_memberships
  for delete using (
    exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id and rp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.team_memberships tm 
      where tm.project_id = project_id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin')
    )
    or auth.uid() = user_id -- Users can remove themselves
  );

-- Annotations policies
create policy "Users can view annotations for accessible projects" on public.annotations
  for select using (
    exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id 
      and (
        rp.user_id = auth.uid() 
        or auth.uid() = any(rp.collaborators)
        or exists (
          select 1 from public.team_memberships tm 
          where tm.project_id = rp.id and tm.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can insert annotations to accessible projects" on public.annotations
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id 
      and (
        rp.user_id = auth.uid() 
        or auth.uid() = any(rp.collaborators)
        or exists (
          select 1 from public.team_memberships tm 
          where tm.project_id = rp.id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin', 'researcher', 'member')
        )
      )
    )
  );

create policy "Users can update their own annotations" on public.annotations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own annotations" on public.annotations
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id and rp.user_id = auth.uid()
    )
  );

-- Shared resources policies
create policy "Users can view shared resources for accessible projects" on public.shared_resources
  for select using (
    exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id 
      and (
        rp.user_id = auth.uid() 
        or auth.uid() = any(rp.collaborators)
        or exists (
          select 1 from public.team_memberships tm 
          where tm.project_id = rp.id and tm.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can insert shared resources to accessible projects" on public.shared_resources
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id 
      and (
        rp.user_id = auth.uid() 
        or auth.uid() = any(rp.collaborators)
        or exists (
          select 1 from public.team_memberships tm 
          where tm.project_id = rp.id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin', 'researcher', 'member')
        )
      )
    )
  );

create policy "Users can update their own shared resources" on public.shared_resources
  for update using (auth.uid() = user_id);

create policy "Users can delete their own shared resources" on public.shared_resources
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.research_projects rp 
      where rp.id = project_id and rp.user_id = auth.uid()
    )
  );
