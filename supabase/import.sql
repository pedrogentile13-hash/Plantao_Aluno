-- ============================================================
-- IMPORTAÇÃO DE DADOS ANTIGOS → Nova tabela profiles com UUID
-- ============================================================

-- 1. Criar tabela temporária para receber o CSV com IDs numéricos
create table if not exists public.profiles_import_temp (
  old_id int primary key,
  email text,
  password text,
  name text,
  school_year text,
  plan text,
  last_password_change timestamptz,
  created_at timestamptz,
  is_admin boolean
);

-- 2. IMPORTAR O CSV AQUI:
-- Dashboard → Table Editor → profiles_import_temp → Insert (botão)
-- Cole os dados do CSV (sem o header)
-- Ou use: Dashboard → SQL Editor → Import data → escolha o arquivo CSV

-- 3. Depois de importado, execute este script para mapear para a tabela profiles:

-- Criar mapeamento old_id → new_uuid
create temp table id_mapping as
select
  old_id,
  gen_random_uuid() as new_uuid
from public.profiles_import_temp
order by old_id;

-- 4. Inserir dados mapeados na tabela profiles
insert into public.profiles (
  id, email, password, name, school_year, plan,
  last_password_change, created_at, is_admin
)
select
  m.new_uuid,
  trim(t.email),
  t.password,
  trim(t.name),
  t.school_year,
  t.plan,
  t.last_password_change,
  t.created_at,
  t.is_admin
from public.profiles_import_temp t
join id_mapping m on t.old_id = m.old_id
on conflict do nothing;

-- 5. Criar tabela de referência dos IDs antigos → novos (opcional, para debug)
create table if not exists public.id_migration_log (
  old_id int,
  new_uuid uuid,
  email text,
  migrated_at timestamptz default now()
);

insert into public.id_migration_log (old_id, new_uuid, email)
select
  t.old_id,
  m.new_uuid,
  t.email
from public.profiles_import_temp t
join id_mapping m on t.old_id = m.old_id;

-- 6. Limpar tabela temporária
drop table if exists public.profiles_import_temp;

-- ✅ Pronto! Dados importados. Você pode consultar id_migration_log para ver o mapeamento
-- Se tudo correr bem, delete a tabela de log: DROP TABLE public.id_migration_log;
