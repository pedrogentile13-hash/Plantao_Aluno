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

async function authSignUp(email, password, fullName, turma) {
  const { data, error } = await db.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, turma } }
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
