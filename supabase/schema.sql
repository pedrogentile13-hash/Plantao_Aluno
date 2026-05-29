-- ============================================================
-- Plantão Aluno — Schema Completo v2
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Tabelas de Configuração ─────────────────────────────────

-- 1. Matérias/Disciplinas
create table if not exists public.subjects (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  color_primary text,
  color_accent text,
  created_at timestamptz default now()
);

-- 2. Bimestres
create table if not exists public.bimestres (
  id int primary key check (id between 1 and 4),
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- 3. Módulos de estudo
create table if not exists public.modules (
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
create table if not exists public.questoes (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  bimestre int references public.bimestres(id) on delete cascade,
  number int,
  enunciado text not null,
  opcoes jsonb not null, -- [{ id: "a", text: "..." }, ...]
  resposta_correta text not null, -- "a", "b", "c", "d"
  dificuldade int default 1 check (dificuldade between 1 and 3), -- 1=fácil, 2=médio, 3=difícil
  peso_fácil numeric(4,2) default 1.0,
  peso_médio numeric(4,2) default 2.0,
  peso_difícil numeric(4,2) default 3.0,
  created_at timestamptz default now()
);

-- 5. Definição de Conquistas (badges/achievements)
create table if not exists public.conquistas (
  id text primary key,
  title text not null,
  description text,
  tier text not null check (tier in ('bronze', 'prata', 'ouro', 'diamante')),
  icon_emoji text,
  progress_of int, -- quantos necessários para desbloquear
  created_at timestamptz default now()
);

-- ── Tabelas de Usuário ──────────────────────────────────────

-- 6. Perfis de usuários (extensão de auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  turma text default '9C',
  avatar_url text,
  role text default 'student' check (role in ('student', 'admin', 'teacher')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger: cria profile automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, turma, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'turma', '9C'),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Tabelas de Avaliação ────────────────────────────────────

-- 7. Notas / Boletim (com info do professor)
create table if not exists public.notas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  bimestre int references public.bimestres(id) on delete cascade not null,

  -- Componentes da nota
  prova_bim numeric(4,1),
  quizzes_media numeric(4,1),
  visto_atividades numeric(4,1),

  -- Info do professor
  professor_name text,
  professor_notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, subject_id, bimestre)
);

-- 8. Resultados de simulados
create table if not exists public.simulado_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  bimestre int references public.bimestres(id) on delete cascade,

  score int not null,
  total int not null,

  -- Breakdown por dificuldade
  corretas_facil int default 0,
  corretas_medio int default 0,
  corretas_dificil int default 0,

  answers jsonb default '[]', -- [{ question_id: uuid, resposta: "a", correta: bool }, ...]

  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now()
);

-- 9. Histórico de desempenho (para gráficos)
create table if not exists public.perf_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,

  data_point_date date default current_date,
  valor numeric(4,1),
  tipo text, -- 'nota_bim', 'simulado', 'quiz'

  created_at timestamptz default now(),
  unique(user_id, subject_id, data_point_date, tipo)
);

-- 10. Conquistas desbloqueadas por usuário
create table if not exists public.conquistas_desbloqueadas (
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

-- Profiles: usuário vê/edita apenas o próprio; admin vê todos
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher')
  ));

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- Conteúdo público: todos podem ler
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

-- Notas: aluno lê as próprias; teacher/admin lê/escreve todas
create policy "notas: own select"
  on public.notas for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher')
  ));

create policy "notas: teacher write"
  on public.notas for all
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher')
  ));

-- Simulado results: aluno vê os seus; teacher/admin vê tudo
create policy "simulado_results: own select"
  on public.simulado_results for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher')
  ));

create policy "simulado_results: own insert"
  on public.simulado_results for insert
  with check (auth.uid() = user_id);

-- Perf history: aluno vê o seu; teacher/admin vê tudo
create policy "perf_history: own select"
  on public.perf_history for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher')
  ));

create policy "perf_history: own insert"
  on public.perf_history for insert
  with check (auth.uid() = user_id);

-- Conquistas: aluno vê as suas; teacher/admin vê tudo
create policy "conquistas_desbloqueadas: own select"
  on public.conquistas_desbloqueadas for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher')
  ));

create policy "conquistas_desbloqueadas: own insert"
  on public.conquistas_desbloqueadas for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Índices para performance
-- ============================================================

create index if not exists idx_modules_subject_bimestre on public.modules(subject_id, bimestre);
create index if not exists idx_questoes_subject_bimestre on public.questoes(subject_id, bimestre);
create index if not exists idx_notas_user_subject_bimestre on public.notas(user_id, subject_id, bimestre);
create index if not exists idx_simulado_results_user_subject on public.simulado_results(user_id, subject_id);
create index if not exists idx_perf_history_user_subject_date on public.perf_history(user_id, subject_id, data_point_date);
create index if not exists idx_conquistas_desbloqueadas_user on public.conquistas_desbloqueadas(user_id);
