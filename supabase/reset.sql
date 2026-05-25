-- ============================================================
-- RESET COMPLETO — Execute isso se houver conflitos de políticas
-- ============================================================

-- Dropa todas as políticas
drop policy if exists "profiles: own read" on public.profiles;
drop policy if exists "profiles: own update" on public.profiles;
drop policy if exists "subjects: public read" on public.subjects;
drop policy if exists "bimestres: public read" on public.bimestres;
drop policy if exists "modules: public read" on public.modules;
drop policy if exists "questoes: public read" on public.questoes;
drop policy if exists "conquistas: public read" on public.conquistas;
drop policy if exists "notas: own select" on public.notas;
drop policy if exists "notas: teacher write" on public.notas;
drop policy if exists "simulado_results: own select" on public.simulado_results;
drop policy if exists "simulado_results: own insert" on public.simulado_results;
drop policy if exists "perf_history: own select" on public.perf_history;
drop policy if exists "perf_history: own insert" on public.perf_history;
drop policy if exists "conquistas_desbloqueadas: own select" on public.conquistas_desbloqueadas;
drop policy if exists "conquistas_desbloqueadas: own insert" on public.conquistas_desbloqueadas;

-- Recria as políticas (CORRIGIDO: sem admin automático)

-- Profiles: usuário vê/edita apenas o próprio; teacher/admin vê todos
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
