#!/usr/bin/env node
/**
 * migrate.js — Migra dados do projeto Supabase antigo para o novo.
 *
 * Uso:
 *   node scripts/migrate.js
 *
 * Requisito: preencha as 4 variáveis abaixo com as SERVICE ROLE keys
 * (não as anon keys). No Supabase Dashboard → Settings → API → service_role secret.
 *
 * ATENÇÃO: não commite este arquivo com as chaves preenchidas.
 */

const OLD_URL  = "https://oxyvhjcankizccokozup.supabase.co";
const OLD_KEY  = "COLE_AQUI_A_SERVICE_ROLE_KEY_DO_PROJETO_ANTIGO";
const NEW_URL  = "https://easbcndwwapxwcqnlgln.supabase.co";
const NEW_KEY  = "COLE_AQUI_A_SERVICE_ROLE_KEY_DO_PROJETO_NOVO";

// ── Dependencies ──────────────────────────────────────────────────────────────
// npm install @supabase/supabase-js   (já instalado como dependência do projeto)

const { createClient } = require("@supabase/supabase-js");

const oldDb = createClient(OLD_URL, OLD_KEY, { auth: { persistSession: false } });
const newDb = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } });

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchAll(client, table, select = "*") {
  const { data, error } = await client.from(table).select(select);
  if (error) {
    console.warn(`  [WARN] ${table}: ${error.message}`);
    return [];
  }
  return data ?? [];
}

async function upsert(client, table, rows, conflictCols) {
  if (!rows.length) return 0;
  const { error } = await client.from(table).upsert(rows, {
    onConflict: conflictCols,
    ignoreDuplicates: false,
  });
  if (error) throw new Error(`${table}: ${error.message}`);
  return rows.length;
}

// ── Migration ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Iniciando migração Supabase...\n");

  // 1. Profiles
  console.log("📋 Migrando profiles...");
  try {
    const profiles = await fetchAll(oldDb, "profiles");
    if (profiles.length) {
      const n = await upsert(newDb, "profiles", profiles, "id");
      console.log(`  ✓ ${n} profiles migrados`);
    } else {
      console.log("  → nenhum profile encontrado no projeto antigo");
    }
  } catch (e) {
    console.error("  ✗", e.message);
  }

  // 2. Notas
  console.log("📊 Migrando notas...");
  try {
    const notas = await fetchAll(oldDb, "notas");
    if (notas.length) {
      const n = await upsert(newDb, "notas", notas, "user_id,subject,bimestre");
      console.log(`  ✓ ${n} notas migradas`);
    } else {
      console.log("  → nenhuma nota encontrada no projeto antigo");
    }
  } catch (e) {
    console.error("  ✗", e.message);
  }

  // 3. Simulado results
  console.log("🎯 Migrando resultados de simulados...");
  try {
    const results = await fetchAll(oldDb, "simulado_results");
    if (results.length) {
      const n = await upsert(newDb, "simulado_results", results, "id");
      console.log(`  ✓ ${n} resultados migrados`);
    } else {
      console.log("  → nenhum resultado encontrado no projeto antigo");
    }
  } catch (e) {
    console.error("  ✗", e.message);
  }

  // 4. Conquistas
  console.log("🏅 Migrando conquistas desbloqueadas...");
  try {
    const conquistas = await fetchAll(oldDb, "conquistas_desbloqueadas");
    if (conquistas.length) {
      const n = await upsert(newDb, "conquistas_desbloqueadas", conquistas, "user_id,conquista_id");
      console.log(`  ✓ ${n} conquistas migradas`);
    } else {
      console.log("  → nenhuma conquista encontrada no projeto antigo");
    }
  } catch (e) {
    console.error("  ✗", e.message);
  }

  console.log("\n✅ Migração concluída!");
  console.log("\n⚠️  Usuários (auth.users) NÃO podem ser migrados via API.");
  console.log("   Eles precisarão criar novas contas no novo projeto.");
  console.log("   Se necessário, use o Supabase CLI: https://supabase.com/docs/guides/cli\n");
}

main().catch(e => {
  console.error("\n❌ Erro fatal:", e.message);
  process.exit(1);
});
