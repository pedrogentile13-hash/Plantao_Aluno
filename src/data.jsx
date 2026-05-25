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

// modules per bimestre × subject. Each module: { type: 'resumo'|'simulado', title, status }
const MODULES = {
  "1º": {
    port: [
      { type: "resumo",  title: "O Médico e o Monstro", sub: "Livro paradidático · análise integral",     status: "done" },
      { type: "resumo",  title: "Figuras de Linguagem", sub: "Metáfora, metonímia, hipérbole e mais",     status: "ready" },
      { type: "simulado",title: "Simulado · O Médico e o Monstro", sub: "30 questões · 8F + 15M + 7D",    status: "ready" },
    ],
    mat: [
      { type: "resumo",  title: "Operações Fundamentais", sub: "Adição, subtração, mult., divisão",       status: "done" },
      { type: "resumo",  title: "Frações e Decimais",     sub: "Conversões e operações combinadas",       status: "ready" },
      { type: "simulado",title: "Simulado · Matemática Básica", sub: "20 questões · 8F + 10M + 2D",       status: "ready" },
    ],
    hist:  [{ type: "resumo", title: "Primeira Guerra Mundial", sub: "Estopim, frentes, tratados", status: "ready" }],
    geo:   [{ type: "resumo", title: "Mundo Bipolar e Multipolar", sub: "Guerra Fria à atualidade", status: "ready" }],
    ing:   [{ type: "resumo", title: "Reading Strategies", sub: "Skimming, scanning, cognates", status: "ready" }],
    bio:   [{ type: "resumo", title: "Sistema Cardiovascular", sub: "Coração, vasos, circulação", status: "ready" }],
    fis:   [{ type: "resumo", title: "Movimento Uniforme", sub: "Velocidade média e gráficos s × t", status: "soon" }],
    qui:   [{ type: "resumo", title: "Modelos Atômicos", sub: "Dalton, Thomson, Rutherford, Bohr", status: "soon" }],
    fin:   [{ type: "resumo", title: "Orçamento Pessoal", sub: "Renda, gastos, reserva", status: "ready" }],
    prod:  [{ type: "resumo", title: "Estrutura Dissertativa", sub: "Tese, argumentos, conclusão", status: "ready" }],
    tcc:   [{ type: "resumo", title: "Método Científico", sub: "Pergunta, hipótese, método", status: "ready" }],
  },
  "2º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
  "3º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
  "4º": { port: [], mat: [], hist: [], geo: [], ing: [], bio: [], fis: [], qui: [], fin: [], prod: [], tcc: [] },
};

// boletim - 9C (9º ano C)
const BOLETIM = [
  { disc: "Português",            prof: "Daiane Alves",     notas: [8.7, 9.0, 8.5, 9.2] },
  { disc: "Matemática",           prof: "Caio Bertoni",     notas: [7.4, 8.0, 8.2, 7.8] },
  { disc: "História",             prof: "Renan Pádua",      notas: [9.8, 9.5, null, null] },
  { disc: "Geografia",            prof: "Júlia Tavares",    notas: [9.1, 9.4, 9.0, null] },
  { disc: "Inglês",               prof: "Mariana Cruz",     notas: [9.5, 9.6, 9.7, 9.8] },
  { disc: "Biologia",             prof: "Pedro Lima",       notas: [8.7, 9.0, 8.9, null] },
  { disc: "Física",               prof: "Felipe Andrade",   notas: [6.8, 7.5, 7.0, null] },
  { disc: "Química",              prof: "Luana Reis",       notas: [7.9, 8.2, 8.5, null] },
  { disc: "Educação Financeira",  prof: "André Lemos",      notas: [9.9, 9.7, null, null] },
  { disc: "Produção Textual",     prof: "Aladdin Tavares",  notas: [9.1, 8.8, 8.7, 9.0] },
  { disc: "Iniciação Científica", prof: "Helena Brito",     notas: [8.6, 8.4, null, null] },
];

// conquistas
const CONQUISTAS = [
  { id: "first",    title: "Primeira Largada",       desc: "Concluiu o primeiro simulado",       got: true,  date: "12 fev 2026", tier: "bronze" },
  { id: "streak3",  title: "Sequência de 3",         desc: "3 dias estudando em sequência",      got: true,  date: "18 fev 2026", tier: "bronze" },
  { id: "media9",   title: "Média 9.0+",             desc: "Alcançou média 9 ou maior no bimestre", got: true,  date: "04 abr 2026", tier: "prata"  },
  { id: "perfect",  title: "Acerto Perfeito",        desc: "Acertou 100% em um simulado",        got: true,  date: "09 abr 2026", tier: "ouro"   },
  { id: "all1bi",   title: "Bimestre Completo",      desc: "Concluiu todos os resumos do 1º bi", got: true,  date: "29 mar 2026", tier: "prata"  },
  { id: "hist",     title: "Historiador",            desc: "5 simulados de História em sequência", got: false, progress: 3, of: 5, tier: "prata"  },
  { id: "fisica",   title: "Cinético",               desc: "Acerte 80%+ em Física por 3 vezes",  got: false, progress: 1, of: 3, tier: "ouro"   },
  { id: "leitor",   title: "Leitor Voraz",           desc: "Leia 10 resumos completos",          got: false, progress: 6, of: 10, tier: "prata" },
  { id: "polimata", title: "Polímata",               desc: "Conquiste 'Acerto Perfeito' em 5 matérias", got: false, progress: 1, of: 5, tier: "ouro" },
  { id: "diamante", title: "Diamante",               desc: "Média 10 em todo o ano letivo",      got: false, progress: 0, of: 1, tier: "diamante" },
];

// Simulado mock — "O Médico e o Monstro" (Português)
const QUESTOES = [
  { d: "F", q: "Quem é o autor da obra Strange Case of Dr Jekyll and Mr Hyde?", alts: ["Arthur Conan Doyle", "Mary Shelley", "Robert Louis Stevenson", "Bram Stoker"], correct: 2 },
  { d: "F", q: "Em qual cidade se passa a obra?", alts: ["Paris", "Londres", "Edimburgo", "Nova York"], correct: 1 },
  { d: "M", q: "Quem é o advogado amigo do Dr. Jekyll?", alts: ["Mr. Utterson", "Mr. Enfield", "Dr. Lanyon", "Mr. Poole"], correct: 0 },
  { d: "M", q: "O que Hyde representa simbolicamente em Jekyll?", alts: ["A racionalidade", "A consciência", "Os impulsos reprimidos", "A bondade"], correct: 2 },
  { d: "D", q: "O experimento de Jekyll usa que substância base, segundo a carta final?", alts: ["Um sal impuro", "Mercúrio", "Ópio", "Ferro líquido"], correct: 0 },
  { d: "F", q: "A novela é considerada um marco da literatura:", alts: ["Romântica", "Realista", "Gótica", "Naturalista"], correct: 2 },
  { d: "M", q: "Quem narra a maior parte dos eventos da história?", alts: ["Jekyll", "Hyde", "Utterson", "Poole"], correct: 2 },
  { d: "F", q: "Hyde comete um crime violento contra:", alts: ["Sir Danvers Carew", "Dr. Lanyon", "Mr. Utterson", "Mr. Poole"], correct: 0 },
];

// performance history (notas dos últimos simulados)
const PERF_HISTORY = [
  { id: 1,  data: "12 fev", disc: "Português",  nota: 6.4, total: 30, acertos: 19, dif: { F: [6,8], M: [9,15], D: [4,7] } },
  { id: 2,  data: "18 fev", disc: "Matemática", nota: 7.2, total: 20, acertos: 14, dif: { F: [6,8], M: [7,10], D: [1,2] } },
  { id: 3,  data: "25 fev", disc: "História",   nota: 8.1, total: 25, acertos: 20, dif: { F: [9,10],M: [8,10], D: [3,5] } },
  { id: 4,  data: "04 mar", disc: "Inglês",     nota: 9.0, total: 20, acertos: 18, dif: { F: [8,8], M: [8,10], D: [2,2] } },
  { id: 5,  data: "11 mar", disc: "Biologia",   nota: 7.8, total: 25, acertos: 20, dif: { F: [9,10],M: [8,10], D: [3,5] } },
  { id: 6,  data: "18 mar", disc: "Português",  nota: 8.4, total: 30, acertos: 25, dif: { F: [8,8], M: [12,15],D: [5,7] } },
  { id: 7,  data: "25 mar", disc: "Matemática", nota: 8.0, total: 20, acertos: 16, dif: { F: [8,8], M: [7,10], D: [1,2] } },
  { id: 8,  data: "01 abr", disc: "Geografia",  nota: 8.7, total: 25, acertos: 22, dif: { F: [10,10],M: [9,10],D: [3,5] } },
  { id: 9,  data: "08 abr", disc: "Português",  nota: 9.3, total: 30, acertos: 28, dif: { F: [8,8], M: [14,15],D: [6,7] } },
  { id: 10, data: "15 abr", disc: "Inglês",     nota: 10.0,total: 20, acertos: 20, dif: { F: [8,8], M: [10,10],D: [2,2] } },
];

Object.assign(window, { SUBJECTS, BIMESTRES, MODULES, BOLETIM, CONQUISTAS, QUESTOES, PERF_HISTORY });
