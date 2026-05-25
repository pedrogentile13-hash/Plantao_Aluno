function LoginScreen({ onEnter, onNav, isMobile }) {
  const [mode,       setMode]       = React.useState("login");
  const [email,      setEmail]      = React.useState("");
  const [password,   setPassword]   = React.useState("");
  const [name,       setName]       = React.useState("");
  const [turma,      setTurma]      = React.useState("9C");
  const [authError,  setAuthError]  = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await authSignIn(email, password);
      } else {
        await authSignUp(email, password, name, turma);
      }
      onEnter();
    } catch (err) {
      setAuthError(err.message || "Erro ao autenticar. Verifique seus dados.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(360px, 480px) 1fr" }}>
      <style>{`
        .auth-pane { padding: 32px 40px; display:flex; flex-direction:column; gap: 18px; background: var(--bg); }
        .is-mobile .auth-pane { padding: 20px 18px; }
        .auth-mark { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; letter-spacing: -0.04em; font-size: 22px; cursor: pointer; background: transparent; border: 0; padding: 0; text-align: left; }
        .auth-mark em { font-family: "Caveat", cursive; font-weight: 700; font-style: normal; font-stretch: 100%; transform: rotate(-2deg); display: inline-block; color: var(--primary); }
        .auth-h { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; letter-spacing: -0.04em; font-size: 56px; line-height: 0.95; margin: 28px 0 8px; }
        .auth-h em { font-family: "Caveat", cursive; font-weight: 700; font-style: normal; font-stretch: 100%; transform: rotate(-2deg); display: inline-block; color: var(--primary); }
        .auth-sub { color: var(--ink-soft); font-size: 15px; margin-bottom: 12px; }
        .auth-switch { display: inline-flex; padding: 4px; background: var(--rule-soft); border-radius: 999px; align-self: flex-start; }
        .auth-switch button { background: transparent; border: 0; cursor: pointer; padding: 8px 14px; border-radius: 999px; font: 500 12px/1 "JetBrains Mono", monospace; letter-spacing: 0.06em; color: var(--ink-soft); }
        .auth-switch button.on { background: var(--ink); color: var(--paper); }
        .auth-form { display: flex; flex-direction: column; gap: 14px; max-width: 380px; margin-top: 16px; }
        .auth-row { display: flex; flex-direction: column; gap: 6px; }
        .auth-help { font-size: 12.5px; color: var(--ink-mute); }
        .auth-foot { margin-top: auto; padding-top: 24px; font: 500 11px/1.4 "JetBrains Mono", monospace; letter-spacing: 0.08em; color: var(--ink-mute); }
        .auth-error { background: oklch(0.96 0.04 25); border: 1px solid oklch(0.88 0.08 25); color: oklch(0.40 0.10 25); border-radius: 10px; padding: 10px 14px; font-size: 13px; line-height: 1.4; }

        .auth-side { position: relative; background: var(--ink); color: var(--paper); padding: 56px 56px; overflow: hidden; display: flex; flex-direction: column; }
        .is-mobile .auth-side { display: none; }
        .auth-side .corner { font: 500 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.18em; text-transform: uppercase; color: oklch(0.72 0.02 260); }
        .auth-side .big { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; letter-spacing: -0.045em; font-size: clamp(48px, 6vw, 92px); line-height: 0.9; margin: auto 0; max-width: 720px; }
        .auth-side .big em { font-family: "Caveat", cursive; font-weight: 700; font-style: normal; font-stretch: 100%; transform: rotate(-2deg); display: inline-block; color: var(--accent); }
        .auth-side .grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .auth-side .data-strip { display: flex; gap: 36px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); position: relative; z-index: 2; }
        .auth-side .data-strip .col .v { font-family: "Bricolage Grotesque"; font-weight: 500; font-stretch: 115%; font-size: 32px; line-height: 1; }
        .auth-side .data-strip .col .l { font: 500 11px/1.3 "JetBrains Mono", monospace; letter-spacing: 0.1em; text-transform: uppercase; color: oklch(0.72 0.02 260); margin-top: 6px; }
      `}</style>

      <div className="auth-pane">
        <button className="auth-mark" onClick={() => onNav("landing")}>Plantão <em>Aluno</em></button>

        <h1 className="auth-h">{mode === "login" ? <>Bem-vindo<br/>de <em>volta</em>.</> : <>Bora <em>começar</em>.</>}</h1>
        <p className="auth-sub">{mode === "login" ? "Entre com a sua conta para continuar de onde parou." : "Crie sua conta — leva uns 20 segundos."}</p>

        <div className="auth-switch">
          <button className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setAuthError(null); }}>Entrar</button>
          <button className={mode === "signup" ? "on" : ""} onClick={() => { setMode("signup"); setAuthError(null); }}>Criar conta</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="auth-row">
              <label className="field-label">Nome completo</label>
              <input className="input" placeholder="Como você quer ser chamado"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="auth-row">
            <label className="field-label">E-mail</label>
            <input className="input" type="email" placeholder="você@escola.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="auth-row">
            <label className="field-label">Senha</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {mode === "signup" && (
            <div className="auth-row">
              <label className="field-label">Turma</label>
              <select className="input" value={turma} onChange={e => setTurma(e.target.value)}>
                <option>9A</option><option>9B</option><option>9C</option><option>9D</option>
              </select>
            </div>
          )}

          {authError && <div className="auth-error">{authError}</div>}

          <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}
            style={{ alignSelf: "flex-start", marginTop: 6, opacity: submitting ? 0.7 : 1 }}>
            {submitting
              ? (mode === "login" ? "Entrando…" : "Criando conta…")
              : (mode === "login" ? "Entrar" : "Criar conta")}
            {!submitting && <Icon name="arrow" size={16}/>}
          </button>
          <div className="auth-help">
            {mode === "login"
              ? "Esqueceu a senha? A escola pode resetar pra você."
              : "Ao criar, você aceita estudar pelo menos 20min por semana 😏"}
          </div>
        </form>

        <div className="auth-foot">© Plantão Aluno · 2026</div>
      </div>

      <div className="auth-side">
        <div className="grid-bg" />
        <div className="corner" style={{ position: "relative", zIndex: 2 }}>P/A · 9C · 2026</div>
        <div className="big">
          Aprender é<br/>simples.<br/>
          <em>Aprender bem</em><br/>
          dá trabalho.
        </div>
        <div className="data-strip">
          <div className="col"><div className="v">11</div><div className="l">Matérias</div></div>
          <div className="col"><div className="v">4</div><div className="l">Bimestres</div></div>
          <div className="col"><div className="v">120+</div><div className="l">Questões</div></div>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
