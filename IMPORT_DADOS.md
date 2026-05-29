# Importar Dados Antigos (CSV → Supabase)

## Passo 1: Preparar o Schema Novo

1. Dashboard Supabase → **SQL Editor** → **New Query**
2. Copie todo o conteúdo de `supabase/clean.sql`
3. Cole no editor e clique **Run**
4. Isso cria todas as tabelas do zero com o campo `password` temporário

## Passo 2: Criar Tabela Temporária para o CSV

1. No **SQL Editor**, crie uma **New Query**
2. Cole este código:

```sql
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
```

3. Clique **Run**

## Passo 3: Importar o CSV

### Opção A: Via Table Editor (Mais Fácil)
1. Dashboard → **Table Editor** → **profiles_import_temp**
2. Clique em **Insert** (canto superior direito)
3. Escolha **Import CSV**
4. Selecione seu arquivo CSV
5. Clique **Import**

### Opção B: Via SQL (Copiar/Colar)
1. No **SQL Editor**, crie uma **New Query**
2. Cole cada linha como INSERT:

```sql
INSERT INTO public.profiles_import_temp (old_id, email, password, name, school_year, plan, last_password_change, created_at, is_admin) VALUES
(1, 'contateste@teste.com', 'teste123', 'Teste', '9', 'lite', NULL, '2026-02-03 19:37:46.915324', true),
(2, 'admin@teste.com', 'admin123', 'Admin', '8', 'lite', NULL, '2026-02-03 20:05:57.467461', true),
-- ... resto dos dados
(17, 'joao.vicente@colegioanglomorumbi.g12.br', '123456', 'João Vicente Lage De Oliveira e Cruz', '9', 'gratis', NULL, '2026-04-09 16:15:06.191535', false);
```

## Passo 4: Mapear IDs Antigos → UUIDs Novos

1. No **SQL Editor**, crie uma **New Query**
2. Cole este script:

```sql
-- Gerar UUIDs novos e mapear com IDs antigos
insert into public.profiles (
  id, email, password, name, school_year, plan,
  last_password_change, created_at, is_admin
)
select
  gen_random_uuid() as new_uuid,
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

-- Limpar tabela temporária
drop table public.profiles_import_temp;
```

3. Clique **Run**

## Passo 5: Verificar Importação

1. Dashboard → **Table Editor** → **profiles**
2. Deve ter os dados com UUIDs gerados automaticamente
3. Todos os campos preenchidos corretamente

## Passo 6: Remover Coluna Temporária (Depois)

Quando tudo estiver funcionando, remova a coluna `password`:

```sql
ALTER TABLE public.profiles DROP COLUMN password;
```

---

## ⚠️ Notas Importantes

- Os IDs antigos (1, 2, 3...) viram UUIDs novos automaticamente
- Passwords estão temporariamente em `profiles.password` (remova após confirmar import)
- Se houver erro de constraint, verifique se há emails duplicados
- `school_year` será importado como texto ("9", "8", etc.) - está correto

---

## 🐛 Troubleshooting

**"ERROR: invalid input syntax for type uuid"**
→ Você está tentando inserir IDs numéricos direto. Use o Passo 4 para gerar UUIDs.

**"ERROR: duplicate key value violates unique constraint"**
→ Há emails duplicados no CSV. Remova linhas duplicadas antes de importar.

**Dados importados mas senhas estão erradas**
→ Normal! As senhas antigas estão em `profiles.password`. Será necessário:
1. Recriar senhas via interface de signup
2. Ou manter as senhas antigas nessa coluna por enquanto
3. Depois dropar a coluna `password`
