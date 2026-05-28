-- ============================================================
-- Adicionar tabela boletim_atividades_rows ao banco existente
-- Execute no SQL Editor do Supabase
-- ============================================================

create table if not exists public.boletim_atividades_rows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  year_id int,
  subject text not null,
  bimestre int references public.bimestres(id) on delete cascade not null,
  type text not null check (type in ('prova_bimestral', 'qualitativa', 'va')),
  name text not null,
  description text,
  nota numeric(5,2) not null,
  nota_maxima numeric(5,2) not null default 10,
  peso numeric(5,2) not null default 1,
  date date,
  created_at timestamptz default now()
);

-- Índice de performance
create index if not exists idx_boletim_atividades_user
  on public.boletim_atividades_rows(user_id, bimestre);

-- RLS
alter table public.boletim_atividades_rows enable row level security;

create policy "boletim_atividades_rows: own select"
  on public.boletim_atividades_rows for select
  using (auth.uid() = user_id or public.is_admin());

create policy "boletim_atividades_rows: admin write"
  on public.boletim_atividades_rows for all
  using (public.is_admin());

-- ✅ Pronto! Tabela criada. A app já busca dessa tabela automaticamente.

-- ============================================================
-- Após importar CSV na tabela boletim_stage, execute:
-- ============================================================
insert into public.boletim_atividades_rows
  (user_id, year_id, subject, bimestre, type, name, description, nota, nota_maxima, peso, date, created_at)
select
  p.id,
  s.year_id::int,
  s.subject,
  s.bimestre::int,
  s.type,
  s.name,
  s.description,
  s.nota::numeric,
  s.nota_maxima::numeric,
  s.peso::numeric,
  nullif(s.date, '')::date,
  nullif(s.created_at, '')::timestamptz
from public.boletim_stage s
join public.profiles p on p.email = (
  select email from public.profiles where id::text = s.user_id
);

drop table public.boletim_stage;
