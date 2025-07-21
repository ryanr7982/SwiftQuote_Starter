
-- USERS TABLE
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamp with time zone default timezone('utc', now())
);

-- CLIENTS TABLE
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- QUOTES TABLE
create table quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  content jsonb not null,
  total numeric not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- ENABLE RLS
alter table clients enable row level security;
alter table quotes enable row level security;

-- CLIENTS POLICY
create policy "Allow client access to owner"
on clients for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- QUOTES POLICY
create policy "Allow quote access to owner"
on quotes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
