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

// modules per bimestre × subject (now loaded from Supabase)
const MODULES = {
  "1º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
  "2º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
  "3º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
  "4º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
};

// boletim (now loaded from Supabase notas table)
const BOLETIM = [];

// conquistas (now loaded from Supabase conquistas_desbloqueadas table)
const CONQUISTAS = [];

// questões (now loaded from Supabase questoes table)
const QUESTOES = [];

// performance history (now loaded from Supabase perf_history table)
const PERF_HISTORY = [];

Object.assign(window, { SUBJECTS, BIMESTRES, MODULES, BOLETIM, CONQUISTAS, QUESTOES, PERF_HISTORY });
