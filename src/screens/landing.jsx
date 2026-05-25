function LandingScreen({ onEnter, onNav, isMobile }) {
  return (
    <div className="landing">
      <style>{`
        .landing { min-height: 100%; background: var(--bg); position: relative; overflow-x: hidden; }

        /* floating shapes background */
        .land-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .land-bg .blob { position: absolute; border-radius: 50%; opacity: 0.5; filter: blur(2px); }
        .land-bg .b1 { width: 380px; height: 380px; background: var(--accent); top: -120px; right: -80px; opacity: 0.35; }
        .land-bg .b2 { width: 280px; height: 280px; background: var(--accent-4); bottom: 200px; left: -120px; opacity: 0.25; }
        .land-bg .b3 { width: 220px; height: 220px; background: var(--primary); top: 600px; right: 200px; opacity: 0.15; }

        .landing-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 44px;
          position: relative; z-index: 2;
          border-bottom: 2px dashed var(--rule);
        }
        .is-mobile .landing-nav { padding: 14px 18px; }
        .landing-mark {
          display: flex; align-items: center; gap: 10px;
          background: transparent; border: 0; padding: 0; cursor: pointer;
        }
        .landing-mark .mk-text {
          font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%;
          letter-spacing: -0.04em; font-size: 22px;
        }

        /* HERO */
        .landing-hero { padding: 60px 44px 40px; max-width: 1280px; margin: 0 auto; position: relative; z-index: 2; }
        .is-mobile .landing-hero { padding: 30px 18px; }

        .hero-stickers { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }

        .hero-h {
          font-family: "Bricolage Grotesque", sans-serif;
          font-weight: 700; font-stretch: 120%;
          letter-spacing: -0.05em; line-height: 0.9;
          font-size: clamp(54px, 9.5vw, 150px);
          margin: 0 0 28px; max-width: 1100px;
        }
        .hero-h .hl { display: inline-block; padding: 0 6px; position: relative; }
        .hero-h .hl::before {
          content: ""; position: absolute; inset: 12% -4px;
          background: var(--accent);
          z-index: -1;
          transform: rotate(-1deg);
        }
        .hero-h .caveat {
          font-family: "Caveat", cursive; font-weight: 700;
          color: var(--primary);
          font-size: 0.95em;
          display: inline-block;
          transform: rotate(-3deg) translateY(8px);
        }

        .hero-sub {
          max-width: 660px;
          font-size: 19px; color: var(--ink-soft); line-height: 1.5;
          font-family: "DM Sans", sans-serif;
        }
        .is-mobile .hero-sub { font-size: 15.5px; }
        .hero-cta { display: flex; gap: 14px; margin-top: 36px; flex-wrap: wrap; align-items: center; }
        .hero-cta .caveat-note {
          font-family: "Caveat", cursive; font-weight: 600;
          font-size: 22px; color: var(--primary);
          transform: rotate(-3deg);
          display: inline-flex; align-items: center; gap: 8px;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 56px;
        }
        .is-mobile .hero-stats { grid-template-columns: repeat(2, 1fr); }
        .hero-stats > div { padding: 18px; }
        .hero-stats .v { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; letter-spacing: -0.04em; font-size: 46px; line-height: 0.95; font-variant-numeric: tabular-nums; }
        .hero-stats .l { font: 700 11px/1.3 "JetBrains Mono", monospace; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-mute); margin-top: 8px; }

        /* FEATURES — punky cards */
        .features { padding: 60px 44px; max-width: 1280px; margin: 0 auto; position: relative; z-index: 2; }
        .is-mobile .features { padding: 30px 18px; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 18px;
        }
        .is-mobile .features-grid { grid-template-columns: 1fr; }
        .feat {
          background: var(--paper);
          border: 1.5px solid var(--ink);
          border-radius: var(--r-3);
          box-shadow: 5px 5px 0 var(--ink);
          padding: 28px;
          display: flex; flex-direction: column;
          min-height: 280px; position: relative; overflow: hidden;
        }
        .feat .feat-num { font: 700 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; color: var(--ink-mute); }
        .feat .feat-t {
          font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 115%;
          letter-spacing: -0.03em; font-size: 30px; line-height: 1.05;
          margin: 14px 0 10px;
        }
        .feat .feat-t .cav { font-family: "Caveat", cursive; font-weight: 700; font-stretch: 100%; color: var(--primary); transform: rotate(-2deg); display: inline-block; font-size: 1.15em; line-height: 1; }
        .feat .feat-d { color: var(--ink-soft); font-size: 14.5px; line-height: 1.55; }
        .feat .feat-foot { margin-top: auto; padding-top: 20px; }

        .feat.dark { background: var(--ink); color: var(--paper); }
        .feat.dark .feat-num { color: oklch(0.72 0.02 260); }
        .feat.dark .feat-d { color: oklch(0.82 0.02 260); }
        .feat.dark .feat-t .cav { color: var(--accent); }
        .feat.blue { background: var(--primary); color: var(--on-primary); }
        .feat.blue .feat-num { color: oklch(0.85 0.05 258); }
        .feat.blue .feat-d { color: oklch(0.92 0.04 258); }
        .feat.blue .feat-t .cav { color: var(--accent); }
        .feat.coral { background: var(--accent-2); color: white; }
        .feat.coral .feat-num { color: oklch(0.94 0.04 28); }
        .feat.coral .feat-d { color: oklch(0.96 0.04 28); }
        .feat.yellow { background: var(--accent); color: var(--accent-ink); }
        .feat.yellow .feat-num { color: oklch(0.36 0.10 92); }

        .feat.span-7 { grid-column: span 7; }
        .feat.span-5 { grid-column: span 5; }
        .feat.span-4 { grid-column: span 4; }
        .feat.span-8 { grid-column: span 8; }
        .feat.span-6 { grid-column: span 6; }
        .feat.span-12 { grid-column: span 12; }
        .is-mobile .feat { grid-column: 1 / -1 !important; min-height: 0; }

        .preview-card {
          background: var(--paper);
          border: 1.5px solid var(--ink);
          border-radius: 12px;
          padding: 16px;
          color: var(--ink);
          margin-top: 18px;
          font: 600 12.5px/1.4 "JetBrains Mono", monospace;
          display: flex; flex-direction: column; gap: 10px;
          box-shadow: 2px 2px 0 var(--ink);
        }
        .preview-card .row { display: flex; align-items: center; justify-content: space-between; }
        .preview-card .bar { height: 10px; border-radius: 999px; background: var(--rule-soft); overflow: hidden; border: 1px solid var(--rule); }
        .preview-card .bar i { display: block; height: 100%; background: var(--primary); }

        /* feature 04 — bar of medals */
        .medal-strip { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
        .medal-strip .m { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-family: "Bricolage Grotesque"; font-weight: 800; font-size: 18px; letter-spacing: -0.04em; border: 1.5px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); }
        .medal-strip .m.bronze { background: oklch(0.78 0.10 60); color: oklch(0.18 0.06 60); }
        .medal-strip .m.silver { background: oklch(0.86 0.02 260); color: oklch(0.22 0.02 260); }
        .medal-strip .m.gold   { background: oklch(0.87 0.16 92); color: oklch(0.28 0.08 92); transform: rotate(-4deg); }
        .medal-strip .m.diamond{ background: oklch(0.84 0.08 200); color: oklch(0.22 0.06 230); }

        /* QUOTE BAND — different from before */
        .quote-band {
          padding: 80px 44px; position: relative; z-index: 2;
          background: var(--ink); color: var(--paper); margin: 60px 0;
          border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink);
          overflow: hidden;
        }
        .is-mobile .quote-band { padding: 50px 18px; }
        .quote-band-inner { max-width: 1100px; margin: 0 auto; position: relative; }
        .quote-band p {
          font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%;
          font-size: clamp(32px, 5vw, 78px);
          line-height: 1.0; letter-spacing: -0.035em;
          margin: 0; max-width: 1000px;
        }
        .quote-band p .hl-yel { background: var(--accent); color: var(--ink); padding: 0 8px; }
        .quote-band p .scribble { font-family: "Caveat", cursive; font-weight: 700; color: var(--accent); font-stretch: 100%; }
        .quote-band .by { margin-top: 28px; font: 700 12px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; text-transform: uppercase; color: oklch(0.78 0.02 260); }

        /* HOW IT WORKS — sticker steps */
        .how { padding: 60px 44px; max-width: 1280px; margin: 0 auto; position: relative; z-index: 2; }
        .is-mobile .how { padding: 40px 18px; }
        .how-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .is-mobile .how-grid { grid-template-columns: 1fr; }
        .step-card {
          padding: 28px 22px;
          background: var(--paper);
          border: 1.5px solid var(--ink);
          border-radius: var(--r-3);
          box-shadow: 5px 5px 0 var(--ink);
          position: relative;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .step-card:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--ink); }
        .step-card .n {
          width: 64px; height: 64px;
          border-radius: 18px;
          background: var(--primary); color: var(--on-primary);
          display: grid; place-items: center;
          font-family: "Bricolage Grotesque"; font-weight: 800; font-stretch: 120%;
          font-size: 30px; letter-spacing: -0.04em;
          border: 1.5px solid var(--ink);
          box-shadow: 3px 3px 0 var(--ink);
          margin-bottom: 18px;
          transform: rotate(-4deg);
        }
        .step-card.s2 .n { background: var(--accent); color: var(--accent-ink); transform: rotate(3deg); }
        .step-card.s3 .n { background: var(--accent-2); color: white; transform: rotate(-2deg); }
        .step-card h3 { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 115%; letter-spacing: -0.03em; font-size: 26px; margin: 0 0 12px; line-height: 1.05; }
        .step-card p { color: var(--ink-soft); font-size: 14.5px; line-height: 1.55; margin: 0; }

        .footer { padding: 32px 44px; border-top: 2px dashed var(--rule); display: flex; align-items: center; justify-content: space-between; font: 700 11px/1.4 "JetBrains Mono", monospace; letter-spacing: 0.08em; color: var(--ink-mute); position: relative; z-index: 2; }
        .is-mobile .footer { flex-direction: column; gap: 10px; padding: 24px 18px; }
      `}</style>

      <div className="land-bg">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>

      <nav className="landing-nav">
        <button className="landing-mark" onClick={() => onNav("landing")}>
          <div className="brand-mark-box">PA</div>
          <div className="mk-text">Plantão Aluno</div>
        </button>
        <div className="flex gap-3 items-center">
          {!isMobile && <button className="btn-link" onClick={() => onNav("login")}>Entrar</button>}
          <button className="btn btn-primary" onClick={onEnter}>
            Começar agora <Icon name="arrow" size={16}/>
          </button>
        </div>
      </nav>

      <header className="landing-hero">
        <div className="hero-stickers">
          <span className="tape">9º ano · 2026</span>
          <span className="sticker s-blue r-pos">100% grátis</span>
          <span className="sticker s-yellow">11 matérias</span>
        </div>

        <h1 className="hero-h">
          Estuda <span className="hl">menos</span>,<br/>
          aprende <span className="caveat">mais</span>.<br/>
          Fecha o ano <span className="hl">em paz</span>.
        </h1>
        <p className="hero-sub">
          Resumos curtos, simulados que valem nota, boletim que se calcula sozinho e um painel que mostra exatamente onde mandar bem — e onde dá pra apertar.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary btn-lg" onClick={onEnter}>
            Entrar no painel <Icon name="arrow" size={16}/>
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => onNav("login")}>Criar conta</button>
          <span className="caveat-note">↖ leva 20 segundos</span>
        </div>

        <div className="hero-stats">
          <div className="card-pop"><div className="v">11</div><div className="l">Matérias</div></div>
          <div className="card-pop"><div className="v">4</div><div className="l">Bimestres</div></div>
          <div className="card-pop"><div className="v">—</div><div className="l">Questões</div></div>
          <div className="card-pop" style={{ background: "var(--accent)", borderColor: "var(--ink)" }}>
            <div className="v" style={{ color: "var(--accent-ink)" }}>0<sup style={{ fontSize: 22 }}>R$</sup></div>
            <div className="l" style={{ color: "var(--accent-ink)" }}>Pra sempre</div>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="rule-h"><span className="lbl">O que tem dentro</span><span className="lbl muted">↳ 5 superpoderes</span></div>
        <div className="features-grid">
          <article className="feat dark span-7">
            <div className="feat-num">F · 01</div>
            <h3 className="feat-t">Simulado <span className="cav">de verdade</span>,<br/>com nota e diagnóstico.</h3>
            <p className="feat-d">
              Peso por dificuldade (1, 2 e 3 pontos), correção na hora, nota de 0 a 10 e revisão questão a questão. Dá pra entender por que errou.
            </p>
            <div className="preview-card">
              <div className="row" style={{ color: "var(--ink-mute)" }}>
                <span>Aguardando conteúdo do servidor...</span>
              </div>
            </div>
            <div className="feat-foot">
              <button className="btn btn-accent btn-sm" onClick={() => onNav("simulado")}>
                Ver um em ação <Icon name="arrow" size={12}/>
              </button>
            </div>
          </article>

          <article className="feat yellow span-5">
            <div className="feat-num">F · 02</div>
            <h3 className="feat-t">Resumos curtos.<br/><span className="cav">Por bimestre.</span></h3>
            <p className="feat-d">
              Toda matéria, todo bimestre, um resumo de leitura rápida. Sem enrolação — só o que cai na prova.
            </p>
            <div className="feat-foot">
              <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                <span className="sticker s-blue r-none" style={{ fontSize: 11, padding: "4px 10px", boxShadow: "2px 2px 0 var(--primary-ink)" }}>PORT</span>
                <span className="sticker s-coral r-none" style={{ fontSize: 11, padding: "4px 10px", boxShadow: "2px 2px 0 oklch(0.3 0.12 28)" }}>MAT</span>
                <span className="sticker s-green r-none" style={{ fontSize: 11, padding: "4px 10px", boxShadow: "2px 2px 0 oklch(0.25 0.10 145)" }}>HIST</span>
                <span className="sticker s-pink r-none" style={{ fontSize: 11, padding: "4px 10px", boxShadow: "2px 2px 0 oklch(0.25 0.10 320)" }}>GEO</span>
                <span className="chip">+7</span>
              </div>
            </div>
          </article>

          <article className="feat blue span-8">
            <div className="feat-num">F · 03</div>
            <h3 className="feat-t">Boletim que <span className="cav">calcula sozinho</span>.</h3>
            <p className="feat-d">
              Você lança a nota de cada prova e o sistema cuida da média ponderada por peso e bimestre. Final do ano você já sabe se passou.
            </p>
            <div className="preview-card">
              <div className="row" style={{ color: "var(--ink-mute)" }}>
                <span>Suas notas aparecerão aqui...</span>
              </div>
            </div>
          </article>

          <article className="feat coral span-4">
            <div className="feat-num">F · 04</div>
            <h3 className="feat-t">Conquistas que<br/><span className="cav" style={{ color: "var(--accent)" }}>premiam</span> esforço.</h3>
            <p className="feat-d">
              Bronze, prata, ouro e diamante. Cada simulado, cada sequência de dias, cada média 10 conta.
            </p>
            <div className="medal-strip">
              <div className="m bronze">B</div>
              <div className="m silver">P</div>
              <div className="m gold">O</div>
              <div className="m diamond">D</div>
            </div>
          </article>

          <article className="feat span-12">
            <div className="flex justify-between items-center gap-4" style={{ flexWrap: "wrap" }}>
              <div>
                <div className="feat-num">F · 05</div>
                <h3 className="feat-t" style={{ margin: "10px 0 4px" }}>Desempenho <span className="cav">diagnóstico</span> por dificuldade.</h3>
                <p className="feat-d" style={{ marginTop: 4 }}>Acertou os fáceis e errou os médios? O painel mostra. Os difíceis vêm baixos? O painel mostra também.</p>
              </div>
              <button className="btn btn-blue" onClick={() => onNav("desempenho")}>
                Abrir o desempenho <Icon name="arrow" size={14}/>
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="quote-band">
        <div className="quote-band-inner">
          <p>
            A pior coisa <span className="scribble">não é</span> estudar — é estudar a <span className="hl-yel">coisa errada</span> na semana da prova.
          </p>
          <div className="by">— Plantão Aluno · manifesto</div>
        </div>
      </section>

      <section className="how">
        <div className="rule-h"><span className="lbl">Como funciona</span><span className="lbl muted">↳ 3 passos · 30 segundos</span></div>
        <div className="how-grid">
          <div className="step-card s1">
            <div className="n">1</div>
            <h3>Entra,<br/>escolhe o bimestre.</h3>
            <p>Tudo organizado por 1º, 2º, 3º e 4º bimestre. Você só vê o que importa agora.</p>
          </div>
          <div className="step-card s2">
            <div className="n">2</div>
            <h3>Lê o resumo,<br/>faz o simulado.</h3>
            <p>Resumo em 5–10 minutos, simulado interativo com correção imediata. Pronto pra próxima prova.</p>
          </div>
          <div className="step-card s3">
            <div className="n">3</div>
            <h3>Acompanha<br/>o desempenho.</h3>
            <p>Gráficos por matéria e por nível. Lança a nota da prova oficial no boletim e vê a média subir.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>Plantão Aluno · plataforma de estudos · 9º ano</div>
        <div>© 2026 · Feito por aluno pra aluno</div>
      </footer>
    </div>
  );
}

window.LandingScreen = LandingScreen;
