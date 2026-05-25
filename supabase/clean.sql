-- ============================================================
-- LIMPEZA TOTAL — Dropa todas as tabelas e recria do zero
-- ============================================================

-- Dropa todas as tabelas do schema public (cascade = remove tudo)
drop table if exists public.conquistas_desbloqueadas cascade;
drop table if exists public.perf_history cascade;
drop table if exists public.simulado_results cascade;
drop table if exists public.notas cascade;
drop table if exists public.questoes cascade;
drop table if exists public.modules cascade;
drop table if exists public.profiles cascade;
drop table if exists public.bimestres cascade;
drop table if exists public.subjects cascade;
drop table if exists public.conquistas cascade;

-- Dropa funções
drop function if exists public.handle_new_user() cascade;

-- ============================================================
-- Recria do ZERO
-- ============================================================

-- 1. Matérias/Disciplinas
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  color_primary text,
  color_accent text,
  created_at timestamptz default now()
);

-- 2. Bimestres
create table public.bimestres (
  id int primary key check (id between 1 and 4),
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- 3. Módulos de estudo
create table public.modules (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  bimestre int references public.bimestres(id) on delete cascade not null,
  title text not null,
  description text,
  order_idx int default 0,
  created_at timestamptz default now(),
  unique(subject_id, bimestre, title)
);

-- 4. Questões (para simulados)
create table public.questoes (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  bimestre int references public.bimestres(id) on delete cascade,
  number int,
  enunciado text not null,
  opcoes jsonb not null,
  resposta_correta text not null,
  dificuldade int default 1 check (dificuldade between 1 and 3),
  peso_fácil numeric(4,2) default 1.0,
  peso_médio numeric(4,2) default 2.0,
  peso_difícil numeric(4,2) default 3.0,
  created_at timestamptz default now()
);

-- 5. Definição de Conquistas
create table public.conquistas (
  id text primary key,
  title text not null,
  description text,
  tier text not null check (tier in ('bronze', 'prata', 'ouro', 'diamante')),
  icon_emoji text,
  progress_of int,
  created_at timestamptz default now()
);

-- 6. Perfis de usuários
create table public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  email           text,
  password        text, -- TEMPORARY: for data import only, remove after migration
  name            text,
  school_year     text default '9C',
  plan            text default 'free' check (plan in ('free', 'premium')),
  last_password_change timestamptz,
  created_at      timestamptz default now(),
  is_admin        boolean default false
);

-- Trigger: cria profile automaticamente ao criar usuário
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, school_year, plan, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'turma', '9C'),
    'free',
    false
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Notas / Boletim
create table public.notas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  bimestre int references public.bimestres(id) on delete cascade not null,
  prova_bim numeric(4,1),
  quizzes_media numeric(4,1),
  visto_atividades numeric(4,1),
  professor_name text,
  professor_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, subject_id, bimestre)
);

-- 8. Resultados de simulados
create table public.simulado_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  bimestre int references public.bimestres(id) on delete cascade,
  score int not null,
  total int not null,
  corretas_facil int default 0,
  corretas_medio int default 0,
  corretas_dificil int default 0,
  answers jsonb default '[]',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now()
);

-- 9. Histórico de desempenho
create table public.perf_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  data_point_date date default current_date,
  valor numeric(4,1),
  tipo text,
  created_at timestamptz default now(),
  unique(user_id, subject_id, data_point_date, tipo)
);

-- 10. Conquistas desbloqueadas
create table public.conquistas_desbloqueadas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  conquista_id text references public.conquistas(id) on delete cascade not null,
  unlocked_at date default current_date,
  unique(user_id, conquista_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.bimestres enable row level security;
alter table public.modules enable row level security;
alter table public.questoes enable row level security;
alter table public.notas enable row level security;
alter table public.simulado_results enable row level security;
alter table public.perf_history enable row level security;
alter table public.conquistas enable row level security;
alter table public.conquistas_desbloqueadas enable row level security;

-- Policies
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
  ));

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "subjects: public read"
  on public.subjects for select using (true);

create policy "bimestres: public read"
  on public.bimestres for select using (true);

create policy "modules: public read"
  on public.modules for select using (true);

create policy "questoes: public read"
  on public.questoes for select using (true);

create policy "conquistas: public read"
  on public.conquistas for select using (true);

create policy "notas: own select"
  on public.notas for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
  ));

create policy "notas: teacher write"
  on public.notas for all
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
  ));

create policy "simulado_results: own select"
  on public.simulado_results for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
  ));

create policy "simulado_results: own insert"
  on public.simulado_results for insert
  with check (auth.uid() = user_id);

create policy "perf_history: own select"
  on public.perf_history for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
  ));

create policy "perf_history: own insert"
  on public.perf_history for insert
  with check (auth.uid() = user_id);

create policy "conquistas_desbloqueadas: own select"
  on public.conquistas_desbloqueadas for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
  ));

create policy "conquistas_desbloqueadas: own insert"
  on public.conquistas_desbloqueadas for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Índices
-- ============================================================

create index idx_modules_subject_bimestre on public.modules(subject_id, bimestre);
create index idx_questoes_subject_bimestre on public.questoes(subject_id, bimestre);
create index idx_notas_user_subject_bimestre on public.notas(user_id, subject_id, bimestre);
create index idx_simulado_results_user_subject on public.simulado_results(user_id, subject_id);
create index idx_perf_history_user_subject_date on public.perf_history(user_id, subject_id, data_point_date);
create index idx_conquistas_desbloqueadas_user on public.conquistas_desbloqueadas(user_id);
