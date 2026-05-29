// Supabase client + auth/data hooks

const SUPABASE_URL      = "https://easbcndwwapxwcqnlgln.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhc2JjbmR3d2FweHdjcW5sZ2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzAxODEsImV4cCI6MjA5NTMwNjE4MX0.F0TQcA4eO2YeHqh40UnwkAom8IbZILaDWn-L3AQhR0M";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.db = db;

// ── Auth ────────────────────────────────────────────────────

function useAuth() {
  const [user,    setUser]    = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
window.useAuth = useAuth;

async function authSignIn(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
window.authSignIn = authSignIn;

async function authSignUp(email, password, fullName, schoolYear) {
  const { data, error } = await db.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, turma: schoolYear } }
  });
  if (error) throw error;
  return data;
}
window.authSignUp = authSignUp;

async function authSignOut() {
  const { error } = await db.auth.signOut();
  if (error) throw error;
}
window.authSignOut = authSignOut;

// ── Perfil ──────────────────────────────────────────────────

function useProfile(userId) {
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    if (!userId) { setProfile(null); return; }
    db.from("profiles").select("*").eq("id", userId).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [userId]);

  return profile;
}
window.useProfile = useProfile;

// ── Simulados ───────────────────────────────────────────────

function useSimuladoResults(userId) {
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    if (!userId) { setResults([]); return; }
    db.from("simulado_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setResults(data); });
  }, [userId]);

  return results;
}
window.useSimuladoResults = useSimuladoResults;

async function saveSimuladoResult({ userId, subject, bimestre, score, total, answers }) {
  const { data, error } = await db.from("simulado_results").insert({
    user_id: userId, subject, bimestre, score, total, answers
  }).select().single();
  if (error) throw error;
  return data;
}
window.saveSimuladoResult = saveSimuladoResult;

// ── Notas / Boletim ─────────────────────────────────────────

function useNotas(userId) {
  const [notas, setNotas] = React.useState(null);

  React.useEffect(() => {
    if (!userId) { setNotas(null); return; }
    db.from("notas").select("*").eq("user_id", userId)
      .then(({ data }) => { if (data) setNotas(data); });
  }, [userId]);

  return notas;
}
window.useNotas = useNotas;

function useAtividades(userId, year) {
  const [atividades, setAtividades] = React.useState(null);

  React.useEffect(() => {
    if (!userId) { setAtividades(null); return; }
    let q = db.from("boletim_atividades_rows")
      .select("*")
      .eq("user_id", userId)
      .order("bimestre");
    if (year) {
      q = q.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
    }
    q.then(({ data }) => { if (data) setAtividades(data); });
  }, [userId, year]);

  return atividades;
}
window.useAtividades = useAtividades;

// ── Conquistas ──────────────────────────────────────────────

function useConquistasDesbloqueadas(userId) {
  const [ids, setIds] = React.useState(null);

  React.useEffect(() => {
    if (!userId) { setIds(null); return; }
    db.from("conquistas_desbloqueadas")
      .select("conquista_id, unlocked_at")
      .eq("user_id", userId)
      .then(({ data }) => { if (data) setIds(data); });
  }, [userId]);

  return ids;
}
window.useConquistasDesbloqueadas = useConquistasDesbloqueadas;

async function unlockConquista(userId, conquistaId) {
  const { error } = await db.from("conquistas_desbloqueadas").insert({
    user_id: userId, conquista_id: conquistaId
  });
  if (error && !error.message.includes("unique")) throw error;
}
window.unlockConquista = unlockConquista;

// ── Dados Base (Subjects, Bimestres, Modules, Questoes) ─────

function useSubjects() {
  const [subjects, setSubjects] = React.useState([]);

  React.useEffect(() => {
    db.from("subjects")
      .select("*")
      .order("name")
      .then(({ data }) => { if (data) setSubjects(data); });
  }, []);

  return subjects;
}
window.useSubjects = useSubjects;

function useBimestres() {
  const [bims, setBims] = React.useState([]);

  React.useEffect(() => {
    db.from("bimestres")
      .select("*")
      .order("id")
      .then(({ data }) => { if (data) setBims(data); });
  }, []);

  return bims;
}
window.useBimestres = useBimestres;

function useModules(subjectId, bimestre) {
  const [modules, setModules] = React.useState([]);

  React.useEffect(() => {
    if (!subjectId || bimestre == null) { setModules([]); return; }
    db.from("modules")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("bimestre", bimestre)
      .order("order_idx")
      .then(({ data }) => { if (data) setModules(data); });
  }, [subjectId, bimestre]);

  return modules;
}
window.useModules = useModules;

function useQuestoes(moduleId) {
  const [questoes, setQuestoes] = React.useState([]);

  React.useEffect(() => {
    if (!moduleId) { setQuestoes([]); return; }
    db.from("questoes")
      .select("*")
      .eq("module_id", moduleId)
      .order("number")
      .then(({ data }) => { if (data) setQuestoes(data); });
  }, [moduleId]);

  return questoes;
}
window.useQuestoes = useQuestoes;

function usePerfHistory(userId, subjectId) {
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    if (!userId) { setHistory([]); return; }
    let q = db.from("perf_history")
      .select("*")
      .eq("user_id", userId);
    if (subjectId) q = q.eq("subject_id", subjectId);
    q.order("data_point_date")
      .then(({ data }) => { if (data) setHistory(data); });
  }, [userId, subjectId]);

  return history;
}
window.usePerfHistory = usePerfHistory;

// ── Boletim Write ───────────────────────────────────────────

const CAT_TO_TYPE = { PB: "prova_bimestral", Q: "qualitativa", VA: "va" };

async function saveAtividade(userId, { subject, bimestre, cat, subtype, nome, desc, nota, max, peso, data: date }) {
  const { data, error } = await db.from("boletim_atividades_rows").insert({
    user_id: userId,
    subject,
    bimestre,
    type: CAT_TO_TYPE[cat] || cat,
    subtype: subtype || null,
    name: nome,
    description: desc || null,
    nota,
    nota_maxima: max,
    peso,
    date: date || new Date().toISOString().split("T")[0],
  }).select().single();
  if (error) throw error;
  return data;
}
window.saveAtividade = saveAtividade;

async function updateAtividade(id, { subtype, nome, desc, nota, max, peso, data: date }) {
  const { error } = await db.from("boletim_atividades_rows").update({
    name: nome, subtype: subtype || null, description: desc || null, nota, nota_maxima: max, peso, date: date || null,
  }).eq("id", id);
  if (error) throw error;
}
window.updateAtividade = updateAtividade;

async function deleteAtividade(id) {
  const { error } = await db.from("boletim_atividades_rows").delete().eq("id", id);
  if (error) throw error;
}
window.deleteAtividade = deleteAtividade;

// ── Resumos (PDFs) ───────────────────────────────────────────

function useResumosDB(subjectSlug, bimestre) {
  const [resumos, setResumos] = React.useState([]);
  React.useEffect(() => {
    if (!subjectSlug || !bimestre) return;
    db.from("resumos")
      .select("*")
      .eq("subject_slug", subjectSlug)
      .eq("bimestre", parseInt(bimestre) || bimestre)
      .order("created_at")
      .then(({ data }) => { if (data) setResumos(data); });
  }, [subjectSlug, bimestre]);
  return resumos;
}
window.useResumosDB = useResumosDB;

async function uploadResumoPDF(file, subjectSlug, bimestre) {
  const ext = file.name.split(".").pop();
  const path = `${subjectSlug}/${bimestre}/${Date.now()}.${ext}`;
  const { error } = await db.storage.from("resumos").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = db.storage.from("resumos").getPublicUrl(path);
  return publicUrl;
}
window.uploadResumoPDF = uploadResumoPDF;

async function saveResumoDB({ subjectSlug, bimestre, title, description, pdfUrl, userId }) {
  const { data, error } = await db.from("resumos").insert({
    subject_slug: subjectSlug,
    bimestre: parseInt(bimestre) || bimestre,
    title,
    description: description || null,
    pdf_url: pdfUrl || null,
    created_by: userId,
  }).select().single();
  if (error) throw error;
  return data;
}
window.saveResumoDB = saveResumoDB;

async function deleteResumoDB(id) {
  const { error } = await db.from("resumos").delete().eq("id", id);
  if (error) throw error;
}
window.deleteResumoDB = deleteResumoDB;

// ── Questões para Simulado ───────────────────────────────────

function useQuestoesSimulado(subjectSlug, bimestre) {
  const [questoes, setQuestoes] = React.useState([]);
  React.useEffect(() => {
    if (!subjectSlug || !bimestre) { setQuestoes([]); return; }
    db.from("subjects").select("id").eq("slug", subjectSlug).single()
      .then(({ data: subj }) => {
        if (!subj) return Promise.resolve({ data: [] });
        return db.from("questoes")
          .select("*")
          .eq("subject_id", subj.id)
          .eq("bimestre", parseInt(bimestre) || 1)
          .order("number");
      })
      .then(res => { if (res?.data) setQuestoes(res.data); });
  }, [subjectSlug, bimestre]);
  return questoes;
}
window.useQuestoesSimulado = useQuestoesSimulado;

async function importQuestoesDB(questoes, subjectSlug, bimestre) {
  const { data: subj } = await db.from("subjects").select("id").eq("slug", subjectSlug).single();
  if (!subj) throw new Error("Matéria não encontrada: " + subjectSlug);
  const bim = parseInt(bimestre) || 1;
  // Get current max number
  const { data: existing } = await db.from("questoes")
    .select("number").eq("subject_id", subj.id).eq("bimestre", bim)
    .order("number", { ascending: false }).limit(1);
  const startNum = (existing?.[0]?.number || 0) + 1;
  const rows = questoes.map((q, i) => ({
    subject_id: subj.id,
    bimestre: bim,
    number: startNum + i,
    enunciado: q.enunciado,
    opcoes: q.opcoes,
    resposta_correta: q.resposta_correta,
    dificuldade: q.dificuldade,
  }));
  const { error } = await db.from("questoes").insert(rows);
  if (error) throw error;
  return rows.length;
}
window.importQuestoesDB = importQuestoesDB;

async function deleteQuestoesDB(subjectSlug, bimestre) {
  const { data: subj } = await db.from("subjects").select("id").eq("slug", subjectSlug).single();
  if (!subj) throw new Error("Matéria não encontrada");
  const { error } = await db.from("questoes")
    .delete().eq("subject_id", subj.id).eq("bimestre", parseInt(bimestre) || 1);
  if (error) throw error;
}
window.deleteQuestoesDB = deleteQuestoesDB;

// ── Write Functions ──────────────────────────────────────────

async function savePerfHistory(userId, subjectId, valor, tipo) {
  const { error } = await db.from("perf_history").upsert({
    user_id: userId,
    subject_id: subjectId,
    valor,
    tipo,
    data_point_date: new Date().toISOString().split("T")[0]
  }, { onConflict: "user_id,subject_id,data_point_date,tipo" });
  if (error) throw error;
}
window.savePerfHistory = savePerfHistory;
