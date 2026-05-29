-- ============================================================
-- IMPORTAÇÃO COMPLETA: CSV → profiles com UUID
-- ============================================================

-- 1. Criar tabela temporária
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

-- 2. Inserir dados do CSV com IDs mapeados
INSERT INTO public.profiles_import_temp (old_id, email, password, name, school_year, plan, last_password_change, created_at, is_admin) VALUES
(1, 'contateste@teste.com', 'teste123', 'Teste', '9', 'lite', NULL, '2026-02-03 19:37:46.915324', true),
(2, 'admin@teste.com', 'admin123', 'Admin', '8', 'lite', NULL, '2026-02-03 20:05:57.467461', true),
(3, 'pedrogentile13@gmail.com', 'plantaoaluno1308', 'Pedro Gentile', '9', 'lite', NULL, '2026-02-03 20:37:03.886338', true),
(4, 'guicaribe1220@gmail.com', 'gui05122011', 'Guilherme Carvalho', '9', 'gratis', NULL, '2026-02-22 22:48:58.601515', false),
(5, 'joaovicente.cruz18@gmail.com', 'Joao@0618', 'João Vicente', '9', 'gratis', NULL, '2026-03-06 17:10:24.965784', false),
(6, 'mariaclara.rsouza@icloud.com', 'zyzme1-xextyv-vospEv', 'maria clara fontealba', '9', 'gratis', NULL, '2026-03-06 19:44:23.426437', false),
(7, 'nicolas.levindo@colegioanglomorumbi.g12.br', 'Sa914481', 'Nicolas Ferreira Levindo', '9', 'gratis', NULL, '2026-03-09 18:57:36.275097', false),
(8, 'lucas.meirelles@colegioanglomorumbi.g12.br', 'AMN28866', 'Lucas Oliveira Meirelles', '9', 'gratis', NULL, '2026-03-09 19:00:34.774378', false),
(9, 'lucbit12@gmail.com', 'anglo@2024', 'Lucas Oliveira Meirelles', '9', 'gratis', NULL, '2026-03-23 19:52:46.017735', false),
(10, 'gugoodof@gmail.com', 'Cristo12gu.', 'Gustavo Freire', '9', 'gratis', NULL, '2026-03-23 23:54:56.985932', false),
(12, 'luiza.martins@colegioanglomorumbi.g12.br', 'Homer.3599', 'Luiza Martins', '9', 'gratis', NULL, '2026-03-23 23:59:08.77921', false),
(13, 'yzklahz@gmail.com', 'Lari@2011', 'larissa marcatto', '9', 'gratis', NULL, '2026-03-24 00:00:01.217587', false),
(14, 'pedroalvesfranca74@gmail.com', 'pedr01904', 'Pedro Alves', '9', 'gratis', NULL, '2026-03-24 00:08:11.474021', false),
(15, 'byduda.live@gmail.com', '26062012', 'Maria Eduarda Borchers de Souza', '9', 'gratis', NULL, '2026-03-24 23:38:21.763389', false),
(16, 'igormendes.cassiano@gmail.com', 'brunigor', 'Igor Cassiano Mendes', '9', 'gratis', NULL, '2026-03-25 20:35:48.193884', false),
(17, 'joao.vicente@colegioanglomorumbi.g12.br', '123456', 'João Vicente Lage De Oliveira e Cruz', '9', 'gratis', NULL, '2026-04-09 16:15:06.191535', false);

-- 3. Mapear e inserir na tabela profiles com UUIDs novos
insert into public.profiles (
  id, email, password, name, school_year, plan,
  last_password_change, created_at, is_admin
)
select
  gen_random_uuid(),
  trim(email),
  password,
  trim(name),
  school_year,
  plan,
  last_password_change,
  created_at,
  is_admin
from public.profiles_import_temp
order by old_id;

-- 4. Limpar tabela temporária
drop table public.profiles_import_temp;

-- ✅ Pronto! Dados importados com sucesso.
