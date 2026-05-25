-- ============================================================
-- Plantão Aluno — Dados Base (Seed)
-- Execute DEPOIS do schema.sql
-- ============================================================

-- 1. Bimestres
insert into public.bimestres (id, name, start_date, end_date) values
  (1, '1º Bimestre', '2026-02-01', '2026-04-30'),
  (2, '2º Bimestre', '2026-05-01', '2026-07-31'),
  (3, '3º Bimestre', '2026-08-01', '2026-10-31'),
  (4, '4º Bimestre', '2026-11-01', '2026-12-15')
on conflict (id) do nothing;

-- 2. Matérias (11 disciplinas)
insert into public.subjects (name, slug) values
  ('Matemática',    'matematica'),
  ('Português',     'portugues'),
  ('Ciências',      'ciencias'),
  ('História',      'historia'),
  ('Geografia',     'geografia'),
  ('Inglês',        'ingles'),
  ('Educação Física', 'ed-fisica'),
  ('Artes',         'artes'),
  ('Filosofia',     'filosofia'),
  ('Sociologia',    'sociologia'),
  ('Projetos',      'projetos')
on conflict (slug) do nothing;

-- 3. Módulos (exemplos por matéria/bimestre)
-- Matemática
insert into public.modules (subject_id, bimestre, title, description, order_idx)
select id, 1, 'Álgebra Linear', 'Estude sistemas, matrizes e determinantes', 1
from public.subjects where slug = 'matematica'
on conflict (subject_id, bimestre, title) do nothing;

insert into public.modules (subject_id, bimestre, title, description, order_idx)
select id, 1, 'Geometria Analítica', 'Pontos, retas e circunferências no plano', 2
from public.subjects where slug = 'matematica'
on conflict (subject_id, bimestre, title) do nothing;

-- Português
insert into public.modules (subject_id, bimestre, title, description, order_idx)
select id, 1, 'Interpretação de Textos', 'Análise crítica de diferentes gêneros textuais', 1
from public.subjects where slug = 'portugues'
on conflict (subject_id, bimestre, title) do nothing;

-- Ciências
insert into public.modules (subject_id, bimestre, title, description, order_idx)
select id, 1, 'Biologia Celular', 'Estrutura e função da célula eucarionte', 1
from public.subjects where slug = 'ciencias'
on conflict (subject_id, bimestre, title) do nothing;

-- 4. Conquistas (badges)
insert into public.conquistas (id, title, description, tier, icon_emoji, progress_of) values
  ('iniciante', 'Iniciante', 'Primeiro acesso ao app', 'bronze', '🌱', 1),
  ('estudioso', 'Estudioso', 'Completou 5 simulados', 'bronze', '📚', 5),
  ('historiador', 'Historiador', 'Conquistou A em História', 'prata', '📖', 1),
  ('polímata', 'Polímata', 'Nota A em todas as matérias', 'ouro', '🧠', 1),
  ('semana-dourada', 'Semana Dourada', '7 dias de estudo consecutivos', 'prata', '⭐', 7),
  ('especialista', 'Especialista', 'Resolveu todas as questões de um módulo', 'prata', '🎯', 1),
  ('campeonato', 'Campeonato', 'Maior nota em um simulado da turma', 'ouro', '🏆', 1),
  ('lenda', 'Lenda', '100 simulados completos', 'diamante', '👑', 100)
on conflict (id) do nothing;

-- ============================================================
-- Dados Opcionais: Questões de Exemplo
-- ============================================================

-- Você pode adicionar questões manualmente via Supabase Dashboard
-- ou via API usando o app depois de criado.
