// shared data / mock content used across screens

const SUBJECTS = [
  { id: "port",  name: "Português",            short: "PORT", topic: "Comunicação · linguagem e sentido",          color: "#3b58e8", glyph: "P" },
  { id: "mat",   name: "Matemática",           short: "MAT",  topic: "Matemática Básica · operações fundamentais", color: "#1f6feb", glyph: "M" },
  { id: "hist",  name: "História",             short: "HIST", topic: "Era Vargas · Brasil República",              color: "#a23b1c", glyph: "H" },
  { id: "geo",   name: "Geografia",            short: "GEO",  topic: "Geopolítica · mundo bipolar e multipolar",   color: "#1f6f5f", glyph: "G" },
  { id: "ing",   name: "Inglês",               short: "ENG",  topic: "Reading Strategies · cognates & context",    color: "#5b2b87", glyph: "E" },
  { id: "bio",   name: "Biologia",             short: "BIO",  topic: "Sistema Cardiovascular · 9º ano",            color: "#197a45", glyph: "B" },
  { id: "fis",   name: "Física",               short: "FIS",  topic: "Movimento Uniforme · cinemática inicial",    color: "#3b3b3b", glyph: "F" },
  { id: "qui",   name: "Química",              short: "QUI",  topic: "Modelos atômicos · da matéria aos átomos",   color: "#6a4b1f", glyph: "Q" },
  { id: "fin",   name: "Educação Financeira",  short: "FIN",  topic: "Orçamento pessoal e juros simples",          color: "#1d4d4f", glyph: "$" },
  { id: "prod",  name: "Produção Textual",     short: "PRD",  topic: "Dissertação · estrutura argumentativa",      color: "#2d2d3a", glyph: "T" },
  { id: "tcc",   name: "Iniciação Científica", short: "TCC",  topic: "Método científico · projeto de pesquisa",    color: "#4a2a5b", glyph: "C" }
];

const BIMESTRES = ["1º", "2º", "3º", "4º"];

// modules per bimestre × subject (loaded from Supabase modules table)
const MODULES = {
  "1º": { port: [{ type: "resumo", title: "Carregando...", sub: "Aguarde os dados do servidor", status: "soon" }], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
  "2º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
  "3º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
  "4º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
};

// boletim (loaded from Supabase notas table, seed fallback for UI initialization)
const BOLETIM = [
  { disc: "Português",       prof: "Prof. Português",   notas: [null, null, null, null] },
  { disc: "Matemática",      prof: "Prof. Matemática",  notas: [null, null, null, null] },
  { disc: "História",        prof: "Prof. História",    notas: [null, null, null, null] },
  { disc: "Geografia",       prof: "Prof. Geografia",   notas: [null, null, null, null] },
  { disc: "Inglês",          prof: "Prof. Inglês",      notas: [null, null, null, null] },
  { disc: "Biologia",        prof: "Prof. Biologia",    notas: [null, null, null, null] },
  { disc: "Física",          prof: "Prof. Física",      notas: [null, null, null, null] },
  { disc: "Química",         prof: "Prof. Química",     notas: [null, null, null, null] },
  { disc: "Educação Financeira", prof: "Prof. Educação Financeira", notas: [null, null, null, null] },
  { disc: "Produção Textual",    prof: "Prof. Produção Textual",    notas: [null, null, null, null] },
  { disc: "Iniciação Científica", prof: "Prof. Iniciação Científica", notas: [null, null, null, null] },
];

// conquistas (loaded from Supabase conquistas_desbloqueadas table, seed reference)
const CONQUISTAS = [
  { id: "first",    title: "Primeira Largada",       desc: "Concluiu o primeiro simulado",       tier: "bronze" },
  { id: "streak3",  title: "Sequência de 3",         desc: "3 dias estudando em sequência",      tier: "bronze" },
  { id: "media9",   title: "Média 9.0+",             desc: "Alcançou média 9 ou maior no bimestre", tier: "prata"  },
  { id: "perfect",  title: "Acerto Perfeito",        desc: "Acertou 100% em um simulado",        tier: "ouro"   },
  { id: "all1bi",   title: "Bimestre Completo",      desc: "Concluiu todos os resumos do 1º bi", tier: "prata"  },
  { id: "hist",     title: "Historiador",            desc: "5 simulados de História em sequência", tier: "prata"  },
  { id: "fisica",   title: "Cinético",               desc: "Acerte 80%+ em Física por 3 vezes",  tier: "ouro"   },
  { id: "leitor",   title: "Leitor Voraz",           desc: "Leia 10 resumos completos",          tier: "prata" },
  { id: "polimata", title: "Polímata",               desc: "Conquiste 'Acerto Perfeito' em 5 matérias", tier: "ouro" },
  { id: "diamante", title: "Diamante",               desc: "Média 10 em todo o ano letivo",      tier: "diamante" },
];

// questões (now loaded from Supabase questoes table, seed fallback)
const QUESTOES = [
  { d: "F", q: "Carregando questões do servidor...", alts: ["Aguarde", "Carregando", "Carregando", "Carregando"], correct: 0 },
];

// performance history (loaded from Supabase perf_history table)
const PERF_HISTORY = [
  { id: 1, data: "hoje", disc: "Português", nota: 0, total: 0, acertos: 0, dif: { F: [0,0], M: [0,0], D: [0,0] } },
];

Object.assign(window, { SUBJECTS, BIMESTRES, MODULES, BOLETIM, CONQUISTAS, QUESTOES, PERF_HISTORY });
