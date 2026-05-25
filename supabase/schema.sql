-- ============================================================
-- Plantão Aluno — Schema v1
-- Cole este SQL no Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Perfis de usuários (extensão de auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text,
  turma       text default '9C',
  avatar_url  text,
  role        text default 'student' check (role in ('student', 'admin')),
  created_at  timestamptz default now()
);

-- Trigger: cria profile automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, turma)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'turma', '9C')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Resultados de simulados
create table if not exists public.simulado_results (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  subject     text not null,
  bimestre    int not null check (bimestre between 1 and 4),
  score       int not null,
  total       int not null,
  answers     jsonb default '[]',
  created_at  timestamptz default now()
);

-- 3. Notas / Boletim
create table if not exists public.notas (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  subject             text not null,
  bimestre            int not null check (bimestre between 1 and 4),
  prova_bim           numeric(4,1),
  quizzes_media       numeric(4,1),
  visto_atividades    numeric(4,1),
  created_at          timestamptz default now(),
  unique(user_id, subject, bimestre)
);

-- 4. Conquistas desbloqueadas por usuário
create table if not exists public.conquistas_desbloqueadas (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  conquista_id    text not null,
  unlocked_at     date default current_date,
  unique(user_id, conquista_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.simulado_results enable row level security;
alter table public.notas enable row level security;
alter table public.conquistas_desbloqueadas enable row level security;

-- Profiles: usuário vê/edita apenas o próprio; admin vê todos
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- Simulado results: CRUD no próprio; admin lê tudo
create policy "simulado_results: own select"
  on public.simulado_results for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "simulado_results: own insert"
  on public.simulado_results for insert
  with check (auth.uid() = user_id);

-- Notas: aluno lê as próprias; admin lê/escreve todas
create policy "notas: own select"
  on public.notas for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "notas: admin upsert"
  on public.notas for all
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Conquistas: aluno lê as próprias; sistema insere via service role
create policy "conquistas: own select"
  on public.conquistas_desbloqueadas for select
  using (auth.uid() = user_id);

create policy "conquistas: own insert"
  on public.conquistas_desbloqueadas for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Dados de exemplo para o usuário admin (pedro)
-- Execute DEPOIS de criar sua conta no app
-- Substitua 'SEU-UUID-AQUI' pelo UUID do seu usuário
-- (Dashboard → Authentication → Users → copie o UUID)
-- ============================================================

-- Tornar usuário admin:
-- update public.profiles set role = 'admin' where id = 'SEU-UUID-AQUI';

-- Inserir notas de exemplo:
-- insert into public.notas (user_id, subject, bimestre, prova_bim, quizzes_media, visto_atividades) values
--   ('SEU-UUID-AQUI', 'Matemática',  1, 7.5, 8.2, 9.0),
--   ('SEU-UUID-AQUI', 'Matemática',  2, 8.0, 7.8, 8.5),
--   ('SEU-UUID-AQUI', 'Português',   1, 8.5, 9.0, 9.5),
--   ('SEU-UUID-AQUI', 'Português',   2, 7.0, 8.5, 8.0),
--   ('SEU-UUID-AQUI', 'Ciências',    1, 9.0, 8.5, 9.0),
--   ('SEU-UUID-AQUI', 'História',    1, 6.5, 7.5, 8.0),
--   ('SEU-UUID-AQUI', 'Geografia',   1, 7.8, 8.0, 8.5),
--   ('SEU-UUID-AQUI', 'Inglês',      1, 9.2, 8.8, 9.0),
--   ('SEU-UUID-AQUI', 'Ed. Física',  1, 10.0, 9.5, 10.0),
--   ('SEU-UUID-AQUI', 'Artes',       1, 8.0, 8.5, 9.0),
--   ('SEU-UUID-AQUI', 'Filosofia',   1, 7.5, 7.0, 8.0)
-- on conflict (user_id, subject, bimestre) do update
--   set prova_bim = excluded.prova_bim,
--       quizzes_media = excluded.quizzes_media,
--       visto_atividades = excluded.visto_atividades;
