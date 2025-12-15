-- Schéma Supabase (PostgreSQL) pour l'application Simple Todo List
-- À exécuter dans l'éditeur SQL Supabase.

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  task_description text not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_todos_completed_created_at
  on public.todos (is_completed, created_at desc);

