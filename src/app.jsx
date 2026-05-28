// Root app + viewport stage + tweaks + screen routing

function App() {
  const { user, loading: authLoading } = useAuth();
  const profile = useProfile(user?.id ?? null);

  const [t, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState(null); // null = aguardando auth check
  const [vp, setVp] = React.useState("desktop");
  const [subjectModal, setSubjectModal] = React.useState(null); // { subj, bim }
  const [simuladoResult, setSimuladoResult] = React.useState(null);
  const [simuladoContext, setSimuladoContext] = React.useState(null);

  // Redireciona para a tela correta após resolver o estado de auth
  React.useEffect(() => {
    if (authLoading) return;
    if (user) {
      setScreen(s => s && s !== "landing" && s !== "login" ? s : "dashboard");
    } else {
      setScreen(t.showLandingFirst ? "landing" : "login");
    }
  }, [authLoading, user]);

  // sync palette to body
  React.useEffect(() => {
    document.body.setAttribute("data-palette", t.palette);
  }, [t.palette]);

  const isMobile = vp === "mobile";

  const onNav = (s) => {
    setSubjectModal(null);
    setScreen(s);
  };

  const onLogout = async () => {
    try { await authSignOut(); } catch (_) {}
    onNav("landing");
  };

  const startSimulado = (questoes, ctx) => {
    setSimuladoResult(null);
    setSimuladoContext({ questoes: questoes || [], ...(ctx || {}) });
    setScreen("simulado");
  };

  const noSidebar = screen === "landing" || screen === "login" || screen === "simulado";

  // Loading splash enquanto verifica sessão
  if (authLoading || screen === null) {
    return (
      <div className="viewport-stage">
        <div className="viewport-frame">
          <div style={{ display: "grid", placeItems: "center", height: "100%", background: "var(--bg)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 22, letterSpacing: "-0.04em" }}>
                Plantão <em style={{ fontFamily: "Caveat", color: "var(--primary)", fontStyle: "normal" }}>Aluno</em>
              </div>
              <div style={{ marginTop: 16, color: "var(--ink-mute)", fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}>
                carregando...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="viewport-stage">
      <div className={"viewport-frame" + (isMobile ? " mobile" : "")}>
        <div className={"shell" + (isMobile ? " is-mobile" : "") + (noSidebar ? " is-fullbleed" : "")}>
          {!noSidebar && (isMobile
            ? <MobileTopBar onNav={onNav} onMenu={() => {}} />
            : <Sidebar active={screen} onNav={onNav} onLogout={onLogout} profile={profile} />
          )}

          <main className="main">
            {screen === "landing"    && <LandingScreen   onEnter={() => onNav(user ? "dashboard" : "login")} onNav={onNav} isMobile={isMobile} />}
            {screen === "login"      && <LoginScreen     onEnter={() => onNav("dashboard")} onNav={onNav} isMobile={isMobile} />}
            {screen === "dashboard"  && <DashboardScreen onNav={onNav} isMobile={isMobile} user={user} profile={profile} />}
            {screen === "resumos"    && (
              <ResumosScreen
                onNav={onNav}
                isMobile={isMobile}
                openSubject={(subj, bim) => setSubjectModal({ subj, bim })}
              />
            )}
            {screen === "simulado"   && (
              <SimuladoScreen
                isMobile={isMobile}
                questoes={simuladoContext?.questoes}
                context={simuladoContext}
                onExit={() => onNav("resumos")}
                onFinish={(result) => { setSimuladoResult(result); setScreen("resultado"); }}
                userId={user?.id}
              />
            )}
            {screen === "resultado"  && (
              <ResultadoScreen
                result={simuladoResult}
                onClose={() => onNav("resumos")}
                onNav={onNav}
                isMobile={isMobile}
              />
            )}
            {screen === "desempenho" && <DesempenhoScreen onNav={onNav} isMobile={isMobile} userId={user?.id} />}
            {screen === "boletim"    && <BoletimScreen    onNav={onNav} isMobile={isMobile} userId={user?.id} />}
            {screen === "conquistas" && <ConquistasScreen onNav={onNav} isMobile={isMobile} userId={user?.id} />}
            {screen === "admin"      && <AdminScreen      onNav={onNav} isMobile={isMobile} userId={user?.id} profile={profile} />}
          </main>

          {!noSidebar && isMobile && <MobileBottomNav active={screen} onNav={onNav} />}
        </div>

        {/* subject modal floats above */}
        {subjectModal && (
          <SubjectModal
            subjectId={subjectModal.subj}
            bim={subjectModal.bim}
            profile={profile}
            userId={user?.id}
            onClose={() => setSubjectModal(null)}
            onStartSimulado={(questoes) => { setSubjectModal(null); startSimulado(questoes, subjectModal); }}
            onNav={onNav}
          />
        )}
      </div>

      <ViewportToggle mode={vp} setMode={setVp} />

      <TweaksPanel>
        <TweakSection label="Aparência" />
        <TweakRadio
          label="Paleta"
          value={t.palette}
          options={["indigo", "cyan", "grafite", "rubi"]}
          onChange={(v) => setTweak("palette", v)}
        />
        <TweakSection label="Navegação" />
        <TweakToggle
          label="Iniciar na landing"
          value={!!t.showLandingFirst}
          onChange={(v) => setTweak("showLandingFirst", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
