function DashboardScreen({ onNav, isMobile }) {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "short", month: "short", day: "numeric" }).replace(/,/g, "·");
  const next = MODULES["1º"].port.find(m => m.type === "simulado");

  return (
    <div className="main-pad anim-fade">
      <PageHead
        eyebrow={`Bem-vindo · ${today}`}
        title="O ano letivo"
        titleEm="em uma página."
        meta={<>Bimestre atual <b>1º</b><br/>Ano letivo <b>2026 — 9C</b></>}
      />

      <style>{`
        .db-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 18px;
        }
        .is-mobile .db-grid { grid-template-columns: 1fr; }
        .db-grid > .span-3 { grid-column: span 3; }
        .db-grid > .span-4 { grid-column: span 4; }
        .db-grid > .span-5 { grid-column: span 5; }
        .db-grid > .span-6 { grid-column: span 6; }
        .db-grid > .span-7 { grid-column: span 7; }
        .db-grid > .span-8 { grid-column: span 8; }
        .db-grid > .span-12 { grid-column: span 12; }
        .is-mobile .db-grid > * { grid-column: 1 / -1 !important; }

        .db-hero {
          background: var(--ink); color: var(--paper);
          padding: 28px;
          border-radius: var(--r-3);
          position: relative;
          overflow: hidden;
          min-height: 280px;
          display: flex; flex-direction: column;
        }
        .db-hero .corner { font: 500 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; color: oklch(0.72 0.02 260); }
        .db-hero h2 { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; letter-spacing: -0.04em; line-height: 0.95; font-size: 56px; margin: auto 0 8px; max-width: 600px; }
        .db-hero h2 em { font-family: "Caveat", cursive; font-weight: 700; font-style: normal; font-stretch: 100%; transform: rotate(-2deg); display: inline-block; color: var(--accent); }
        .db-hero p { color: oklch(0.85 0.02 260); max-width: 500px; }
        .db-hero .grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .db-hero .cta-row { margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; }

        .db-stat-card {
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: var(--r-3);
          padding: 22px;
          display: flex; flex-direction: column;
          gap: 4px;
          height: 100%;
        }
        .db-stat-card.primary { background: var(--primary-soft); border-color: transparent; }

        .upnext {
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: var(--r-3);
          padding: 22px;
          display: flex; flex-direction: column;
          gap: 14px;
          height: 100%;
        }
        .upnext .tag { font: 500 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; color: var(--ink-mute); text-transform: uppercase; }
        .upnext h3 { font-family: "Bricolage Grotesque"; font-weight: 500; font-stretch: 110%; letter-spacing: -0.025em; font-size: 30px; line-height: 1.0; margin: 0; }
        .upnext .meta { font: 500 12px/1.4 "JetBrains Mono", monospace; color: var(--ink-mute); }

        .progress-grid {
          display: grid;
          grid-template-columns: 80px 1fr 60px 40px;
          gap: 12px;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid var(--rule);
          font-size: 13px;
        }
        .progress-grid:first-of-type { border-top: 0; }
        .progress-grid .nm { font-weight: 500; }
        .progress-grid .pct { font: 500 12px/1 "JetBrains Mono", monospace; text-align: right; color: var(--ink-mute); }
        .progress-grid .sp { font: 500 11px/1 "JetBrains Mono", monospace; color: var(--ink-mute); text-align: right; letter-spacing: 0.04em; text-transform: uppercase; }

        .day-streak {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;
          margin-top: 8px;
        }
        .day-streak .d { aspect-ratio: 1; border-radius: 6px; background: var(--rule-soft); display: grid; place-items: center; font: 500 11px/1 "JetBrains Mono", monospace; color: var(--ink-mute); }
        .day-streak .d.on { background: var(--primary); color: var(--on-primary); }
        .day-streak .d.today { outline: 2px solid var(--ink); outline-offset: 1px; }

        .activity-row { display: grid; grid-template-columns: 56px 1fr auto; gap: 14px; padding: 12px 0; border-top: 1px solid var(--rule); align-items: center; }
        .activity-row:first-of-type { border-top: 0; }
        .activity-row .d { font: 500 11px/1.4 "JetBrains Mono", monospace; color: var(--ink-mute); }
        .activity-row .t { font-weight: 500; }
        .activity-row .s { font: 500 11px/1 "JetBrains Mono", monospace; color: var(--ink-mute); margin-top: 2px; }
        .activity-row .v { font-family: "Bricolage Grotesque"; font-weight: 500; font-stretch: 110%; font-size: 22px; }
      `}</style>

      <div className="db-grid">
        {/* HERO + UPNEXT row */}
        <div className="db-hero span-8">
          <div className="grid-bg" />
          <div className="corner" style={{ position: "relative", zIndex: 1 }}>RESUMO DA SEMANA</div>
          <h2 style={{ position: "relative", zIndex: 1 }}>
            Bem-vindo <em style={{ color: "var(--accent)" }}>ao painel</em>
          </h2>
          <p style={{ position: "relative", zIndex: 1 }}>Aqui você acompanha seu desempenho em tempo real. Seus dados carregarão do servidor em breve.</p>
          <div className="cta-row" style={{ position: "relative", zIndex: 1 }}>
            <button className="btn" style={{ background: "var(--paper)", color: "var(--ink)" }} onClick={() => onNav("resumos")}>
              <Icon name="book" size={14}/> Ver estudos
            </button>
            <button className="btn btn-ghost" style={{ borderColor: "oklch(1 0 0 / 0.2)", color: "var(--paper)" }} onClick={() => onNav("desempenho")}>
              Ver desempenho
            </button>
          </div>
        </div>

        <div className="upnext span-4">
          <div className="num-tag">A seguir</div>
          {next ? (
            <>
              <h3>Simulado<br/>{next.title.replace("Simulado · ", "")}</h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: 0 }}>
                {next.sub || "Questões disponíveis para praticar."}
              </p>
            </>
          ) : (
            <>
              <h3>Nenhum<br/>simulado ainda</h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: 0 }}>
                Quando o professor adicionar questões, elas aparecerão aqui.
              </p>
            </>
          )}
          <div className="meta">1º BIM · AGUARDANDO CONTEÚDO</div>
          <button className="btn btn-accent" onClick={() => onNav("resumos")} style={{ background: "var(--primary)", marginTop: "auto" }}>
            Ver estudos <Icon name="arrow" size={14}/>
          </button>
        </div>

        {/* big stats */}
        <div className="db-stat-card primary span-3">
          <div className="big-stat">
            <div className="label">Média geral · ano</div>
            <div className="value" style={{ color: "var(--ink-mute)" }}>—</div>
            <div className="delta" style={{ color: "var(--ink-mute)", fontSize: 12 }}>Carregando...</div>
          </div>
        </div>
        <div className="db-stat-card span-3">
          <div className="big-stat">
            <div className="label">Simulados feitos</div>
            <div className="value" style={{ color: "var(--ink-mute)" }}>0</div>
            <div className="delta" style={{ color: "var(--ink-mute)", fontSize: 12 }}>Faça um para começar</div>
          </div>
        </div>
        <div className="db-stat-card span-3">
          <div className="big-stat">
            <div className="label">Melhor nota</div>
            <div className="value" style={{ color: "var(--ink-mute)" }}>—</div>
            <div className="delta" style={{ color: "var(--ink-mute)", fontSize: 12 }}>Nenhuma ainda</div>
          </div>
        </div>
        <div className="db-stat-card span-3">
          <div className="big-stat">
            <div className="label">Streak de estudo</div>
            <div className="value" style={{ color: "var(--ink-mute)" }}>0</div>
            <div className="delta" style={{ color: "var(--ink-mute)", fontSize: 12 }}>Comece agora</div>
          </div>
          <div className="day-streak">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="d">·</div>
            ))}
          </div>
        </div>

        {/* progress by subject */}
        <div className="card card-pad span-7">
          <div className="rule-h" style={{ margin: "0 0 14px" }}>
            <span className="lbl">Progresso por matéria · 1º bim</span>
            <span className="lbl muted f-mono">↳ 15 matérias</span>
          </div>
          <div style={{ color: "var(--ink-mute)", fontSize: 13, padding: "16px 0" }}>
            Seus progressos aparecerão aqui conforme você faz simulados.
          </div>
        </div>

        {/* recent activity */}
        <div className="card card-pad span-5">
          <div className="rule-h" style={{ margin: "0 0 14px" }}>
            <span className="lbl">Atividade recente</span>
            <button className="btn-link f-mono" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }} onClick={() => onNav("desempenho")}>Ver tudo</button>
          </div>
          {PERF_HISTORY.filter(p => p.total > 0).length === 0 ? (
            <div style={{ color: "var(--ink-mute)", fontSize: 13, padding: "16px 0" }}>
              Nenhuma atividade ainda. Faça um simulado para ver seu histórico aqui.
            </div>
          ) : PERF_HISTORY.filter(p => p.total > 0).slice(-6).reverse().map(p => (
            <div className="activity-row" key={p.id}>
              <span className="d">{p.data}</span>
              <div>
                <div className="t">{p.disc}</div>
                <div className="s">{p.acertos}/{p.total} acertos</div>
              </div>
              <span className="v" style={{ color: p.nota >= 7 ? "var(--ink)" : "var(--err)" }}>{p.nota.toFixed(1)}</span>
            </div>
          ))}
        </div>

        {/* call to action */}
        <div className="card card-pad span-12" style={{ background: "var(--accent)", color: "var(--accent-ink)", borderColor: "transparent" }}>
          <div className="flex justify-between items-center gap-4" style={{ flexWrap: "wrap" }}>
            <div>
              <div className="num-tag" style={{ color: "var(--accent-ink)" }}>Comece agora</div>
              <h3 style={{ fontFamily: "Bricolage Grotesque", fontWeight: 500, fontStretch: "115%", letterSpacing: "-0.03em", fontSize: 34, lineHeight: 1.0, margin: "8px 0 6px" }}>
                Seus estudos <em style={{ fontFamily: "Caveat", fontWeight: 700, transform: "rotate(-2deg)", display: "inline-block" }}>carregam</em> aqui.
              </h3>
              <div style={{ fontSize: 14, opacity: 0.8 }}>Acesse seus resumos e simulados para começar a praticar.</div>
            </div>
            <button className="btn btn-primary" style={{ background: "var(--accent-ink)", color: "var(--accent)" }} onClick={() => onNav("resumos")}>
              Ir pros estudos <Icon name="arrow" size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
