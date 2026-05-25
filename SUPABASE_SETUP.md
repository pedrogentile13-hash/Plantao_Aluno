# Setup Supabase — Plantão Aluno

## 1️⃣ Limpeza Total e Criação do Schema

**Acesse o Supabase Dashboard → seu projeto novo → SQL Editor**

1. Clique em **"New Query"**
2. Copie o conteúdo de `supabase/clean.sql`
3. Cole no editor
4. Clique em **"Run"** (ou `Ctrl+Enter`)

⚠️ **`clean.sql` faz tudo**: dropa tabelas antigas, cria schema completo + RLS + índices. Execute APENAS ISSO.

## 2️⃣ Popular Dados Base

**Ainda no SQL Editor:**

1. Clique em **"New Query"**
2. Copie o conteúdo de `supabase/seed.sql`
3. Cole no editor
4. Clique em **"Run"**

Isso cria:
- 4 bimestres
- 11 matérias (Matemática, Português, etc.)
- Exemplos de módulos
- 8 conquistas (badges)

## 3️⃣ Criar Sua Conta

1. Abra a app: `open index.html` (ou clique no arquivo)
2. Clique em **"Criar conta"**
3. Preencha:
   - Nome completo
   - E-mail
   - Senha (mín. 6 caracteres)
   - Turma (9A, 9B, 9C, 9D)
4. Clique em **"Criar conta"**

⚠️ **Você será criado como `student` por padrão.**

## 4️⃣ Virar Admin

**Obtenha seu UUID:**
1. Dashboard → **Authentication** → **Users**
2. Encontre sua linha (seu email)
3. Copie o **UUID** (primeira coluna, à esquerda)

**No SQL Editor, execute:**

```sql
update profiles set is_admin = true where id = 'seu-uuid-aqui';
```

**Exemplo real:**
```sql
update profiles set is_admin = true where id = '550e8400-e29b-41d4-a716-446655440000';
```

✅ Pronto! Agora você é admin e verá "Painel Admin" na sidebar.

## 5️⃣ Adicionar Notas (Boletim)

**No SQL Editor** (como admin):

```sql
insert into notas (user_id, subject_id, bimestre, prova_bim, quizzes_media, visto_atividades, professor_name)
select 
  'seu-uuid',
  (select id from subjects where slug = 'matematica'),
  1,
  8.5,  -- Prova Bimestral
  7.8,  -- Média de Quizzes
  9.0,  -- Visto de Atividades
  'Prof. João da Silva'
where not exists (
  select 1 from notas where user_id = 'seu-uuid' and subject_id = (select id from subjects where slug = 'matematica') and bimestre = 1
);
```

Substitua:
- `seu-uuid` → seu UUID (obtido acima)
- `matematica` → slug da matéria
- Valores das notas (0-10)
- Nome do professor

## 6️⃣ Adicionar Questões

**Via Dashboard (UI Supabase):**
1. Tables → questoes
2. Clique em "Insert row"
3. Preencha:
   - `module_id` → escolha um módulo
   - `subject_id` → deixe vazio (auto-preenche)
   - `bimestre` → 1, 2, 3 ou 4
   - `number` → ordem (1, 2, 3...)
   - `enunciado` → texto da pergunta
   - `opcoes` → JSON: `[{"id":"a","text":"Opção A"},{"id":"b","text":"Opção B"},...]`
   - `resposta_correta` → "a", "b", "c" ou "d"
   - `dificuldade` → 1 (fácil), 2 (médio), 3 (difícil)

**Exemplo de `opcoes`:**
```json
[
  {"id":"a","text":"Opção A"},
  {"id":"b","text":"Opção B"},
  {"id":"c","text":"Opção C"},
  {"id":"d","text":"Opção D"}
]
```

## 7️⃣ Migrar Projeto Antigo (Opcional)

Se conseguir reativar o projeto antigo no Supabase:

```bash
# Obtenha as SERVICE ROLE keys de ambos os projetos
# Dashboard → Settings → API → service_role secret

# Edite scripts/migrate.js com as keys
vim scripts/migrate.js

# Execute
node scripts/migrate.js
```

---

## 🔑 URLs e Keys

**Novo Projeto:**
- **URL:** `https://easbcndwwapxwcqnlgln.supabase.co`
- **Anon Key:** Já está em `src/supabase.jsx`
- **Service Role:** Settings → API (para migrations)

**Projeto Antigo (se ativar):**
- **URL:** `https://oxyvhjcankizccokozup.supabase.co`
- **Service Role:** Settings → API (se ainda existe)

---

## 🧪 Testar

Após criar conta e configurar notas:

1. **Dashboard** → deve mostrar dados do perfil
2. **Boletim** → deve exibir notas por matéria/bimestre com nome do professor
3. **Conquistas** → deve marcar como desbloqueadas as que você tiver
4. **Desempenho** → gráficos com histórico

---

## ⚠️ Troubleshooting

**"Host not in allowlist"** ao testar via API
→ Sandbox tem proxy restritivo. Isso é esperado. A app funciona do navegador.

**Nenhuma nota aparece**
→ Verifique se o SQL INSERT foi executado sem erros
→ Confirme que user_id e subject_id existem e correspondem

**"permission denied" ao inserir notas**
→ Confirme que você é admin: `select role from profiles where id = 'seu-uuid';`
→ RLS só permite teacher/admin escrever

---

## 📚 Estrutura de Dados

```
profiles (usuário)
├─ id (UUID)
├─ email
├─ name
├─ school_year (ex: 9C)
├─ plan (free | premium)
├─ last_password_change
├─ created_at
└─ is_admin (boolean)

subjects (matérias) — 11 no seed
├─ id (UUID)
├─ name (Matemática, Português, etc.)
└─ slug

bimestres (períodos)
├─ id (1, 2, 3, 4)
└─ name (1º Bimestre, etc.)

modules (unidades de estudo)
├─ id
├─ subject_id → subjects
├─ bimestre → bimestres
└─ title (Álgebra Linear, etc.)

questoes (perguntas do simulado)
├─ id
├─ module_id → modules (opcional)
├─ subject_id → subjects
├─ dificuldade (1, 2, 3)
├─ opcoes (JSON)
├─ resposta_correta
└─ peso_fácil, peso_médio, peso_difícil

notas (boletim)
├─ id
├─ user_id → profiles
├─ subject_id → subjects
├─ bimestre → bimestres
├─ prova_bim (0-10)
├─ quizzes_media (0-10)
├─ visto_atividades (0-10)
├─ professor_name ← pode editar
└─ professor_notes (texto livre)

simulado_results (histórico de simulados)
├─ id
├─ user_id → profiles
├─ score
├─ total
├─ corretas_facil, corretas_medio, corretas_dificil
└─ answers (JSON das respostas)

perf_history (gráficos de desempenho)
├─ id
├─ user_id → profiles
├─ subject_id → subjects
├─ data_point_date
├─ valor (0-10)
└─ tipo (nota_bim | simulado | quiz)

conquistas (definição de badges)
├─ id (texto único: "historiador", etc.)
├─ title
├─ tier (bronze | prata | ouro | diamante)
└─ progress_of (quantos necessários para desbloquear)

conquistas_desbloqueadas (tracking)
├─ user_id → profiles
├─ conquista_id → conquistas
└─ unlocked_at (data)
```

---

**Pronto! A app agora está integrada com Supabase.** 🚀
