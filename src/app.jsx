// Root app + viewport stage + tweaks + screen routing

function App() {
  const [t, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState(t.showLandingFirst ? "landing" : "dashboard");
  const [vp, setVp] = React.useState("desktop");
  const [subjectModal, setSubjectModal] = React.useState(null); // { subj, bim }
  const [simuladoResult, setSimuladoResult] = React.useState(null);

  // sync palette to body
  React.useEffect(() => {
    document.body.setAttribute("data-palette", t.palette);
  }, [t.palette]);

  const isMobile = vp === "mobile";

  const onNav = (s) => {
    setSubjectModal(null);
    setScreen(s);
  };

  const onLogout = () => onNav("landing");

  const noSidebar = screen === "landing" || screen === "login" || screen === "simulado";
  const showResultadoOverlay = simuladoResult && screen === "resultado";

  // when entering simulado, also stash a sample result so finishing returns to result page
  const startSimulado = () => {
    setSimuladoResult(null);
    setScreen("simulado");
  };

  return (
    <div className="viewport-stage">
      <div className={"viewport-frame" + (isMobile ? " mobile" : "")}>
        <div className={"shell" + (isMobile ? " is-mobile" : "") + (noSidebar ? " is-fullbleed" : "")}>
          {!noSidebar && (isMobile
            ? <MobileTopBar onNav={onNav} onMenu={() => {}} />
            : <Sidebar active={screen} onNav={onNav} onLogout={onLogout} />
          )}

          <main className="main">
            {screen === "landing"   && <LandingScreen   onEnter={() => onNav("dashboard")} onNav={onNav} isMobile={isMobile} />}
            {screen === "login"     && <LoginScreen     onEnter={() => onNav("dashboard")} onNav={onNav} isMobile={isMobile} />}
            {screen === "dashboard" && <DashboardScreen onNav={onNav} isMobile={isMobile} />}
            {screen === "resumos"   && (
              <ResumosScreen
                onNav={onNav}
                isMobile={isMobile}
                openSubject={(subj, bim) => setSubjectModal({ subj, bim })}
              />
            )}
            {screen === "simulado"   && (
              <SimuladoScreen
                isMobile={isMobile}
                onExit={() => onNav("resumos")}
                onFinish={(result) => { setSimuladoResult(result); setScreen("resultado"); }}
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
            {screen === "desempenho" && <DesempenhoScreen onNav={onNav} isMobile={isMobile} />}
            {screen === "boletim"    && <BoletimScreen    onNav={onNav} isMobile={isMobile} />}
            {screen === "conquistas" && <ConquistasScreen onNav={onNav} isMobile={isMobile} />}
            {screen === "admin"      && <AdminScreen      onNav={onNav} isMobile={isMobile} />}
          </main>

          {!noSidebar && isMobile && <MobileBottomNav active={screen} onNav={onNav} />}
        </div>

        {/* subject modal floats above */}
        {subjectModal && (
          <SubjectModal
            subjectId={subjectModal.subj}
            bim={subjectModal.bim}
            onClose={() => setSubjectModal(null)}
            onStartSimulado={() => { setSubjectModal(null); startSimulado(); }}
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
