-- documents: tailored CVs, cover letters, and future generated documents.
-- type: 'cv_tailored' | 'cover_letter' (extendable without schema changes)
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  job_id      text not null,
  type        text not null,
  content     text not null,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- One document per user per job per type — retailoring the same role replaces the previous version
create unique index if not exists documents_user_job_type_idx
  on documents(user_id, job_id, type);

-- RLS — users can only access their own documents
alter table documents enable row level security;

create policy "Users can read their own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on documents for delete
  using (auth.uid() = user_id);
