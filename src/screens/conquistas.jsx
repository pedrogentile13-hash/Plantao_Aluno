function ConquistasScreen({ onNav, isMobile }) {
  const got = CONQUISTAS.filter(c => c.got);
  const pending = CONQUISTAS.filter(c => !c.got);

  const tierColor = (t) => ({
    bronze: { bg: "oklch(0.78 0.10 60)", fg: "oklch(0.20 0.06 60)" },
    prata:  { bg: "oklch(0.85 0.02 260)", fg: "oklch(0.25 0.02 260)" },
    ouro:   { bg: "oklch(0.87 0.16 92)", fg: "oklch(0.30 0.08 92)" },
    diamante: { bg: "oklch(0.84 0.08 200)", fg: "oklch(0.22 0.06 230)" },
  }[t]);

  return (
    <div className="main-pad anim-fade">
      <PageHead
        eyebrow="05 · Conquistas"
        title="Distintivos do"
        titleEm="seu ano."
        meta={<>Desbloqueadas <b>{got.length}/{CONQUISTAS.length}</b><br/>Próxima · <b>Polímata</b></>}
      />

      <style>{`
        .conq-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 1100px) { .conq-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px)  { .conq-grid { grid-template-columns: repeat(2, 1fr); } }
        .is-mobile .conq-grid { grid-template-columns: repeat(2, 1fr); }

        .conq-card {
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: var(--r-3);
          padding: 22px;
          min-height: 220px;
          display: flex; flex-direction: column; gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .conq-card.locked { opacity: 0.65; }
        .conq-card .medal {
          width: 56px; height: 56px;
          border-radius: 14px;
          display: grid; place-items: center;
          font-family: "Bricolage Grotesque";
          font-weight: 700; font-stretch: 120%;
          font-size: 22px; letter-spacing: -0.04em;
          position: relative;
        }
        .conq-card.locked .medal {
          background: var(--rule-soft);
          color: var(--ink-mute);
        }
        .conq-card .tier-tag {
          font: 500 10px/1 "JetBrains Mono", monospace;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--ink-mute);
        }
        .conq-card .t {
          font-family: "Bricolage Grotesque"; font-weight: 500; font-stretch: 110%;
          letter-spacing: -0.02em; font-size: 22px; line-height: 1.05; margin: 0;
        }
        .conq-card .d { color: var(--ink-soft); font-size: 13.5px; line-height: 1.4; }
        .conq-card .foot {
          margin-top: auto;
          font: 500 11px/1 "JetBrains Mono", monospace;
          color: var(--ink-mute); letter-spacing: 0.06em; text-transform: uppercase;
        }
        .conq-card .lock-corner {
          position: absolute; top: 18px; right: 18px;
          color: var(--ink-mute);
        }

        .progress-mini { height: 4px; border-radius: 999px; background: var(--rule-soft); overflow: hidden; }
        .progress-mini i { display: block; height: 100%; background: var(--primary); }
      `}</style>

      {/* hero band */}
      <div className="card card-pad" style={{
        background: "var(--ink)",
        color: "var(--paper)",
        borderColor: "transparent",
        marginBottom: 22,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
        gap: 22,
        alignItems: "end",
        padding: 32,
        position: "relative",
        overflow: "hidden"
      }}>
        <div>
          <div className="num-tag" style={{ color: "oklch(0.72 0.02 260)" }}>Sua coleção</div>
          <div style={{
            fontFamily: "Bricolage Grotesque",
            fontWeight: 600, fontStretch: "115%",
            letterSpacing: "-0.045em",
            fontSize: "clamp(36px, 5vw, 64px)",
            lineHeight: 0.95,
            margin: "12px 0 6px"
          }}>
            <span style={{ color: "var(--accent)" }}>{got.length}</span> distintivos<br/>
            <span style={{ fontFamily: "Caveat", fontWeight: 700, transform: "rotate(-2deg)", display: "inline-block" }}>e contando.</span>
          </div>
          <div style={{ color: "oklch(0.78 0.02 260)" }}>
            Você está a 2 simulados de desbloquear <strong style={{ color: "var(--accent)" }}>Historiador</strong>.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {got.slice(0, 4).map((c, i) => {
            const tc = tierColor(c.tier);
            return (
              <div key={c.id} className="medal" style={{ width: 64, height: 64, borderRadius: 16, background: tc.bg, color: tc.fg, display: "grid", placeItems: "center", fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 24, letterSpacing: "-0.04em" }}>
                {c.title.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rule-h" style={{ margin: "0 0 14px" }}>
        <span className="lbl">Desbloqueadas · {got.length}</span>
      </div>
      <div className="conq-grid">
        {got.map((c, i) => {
          const tc = tierColor(c.tier);
          return (
            <div className="conq-card" key={c.id}>
              <div className="medal" style={{ background: tc.bg, color: tc.fg }}>
                {c.title.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
              <div className="tier-tag">{c.tier}</div>
              <h3 className="t">{c.title}</h3>
              <div className="d">{c.desc}</div>
              <div className="foot">↗ {c.date}</div>
            </div>
          );
        })}
      </div>

      <div className="rule-h" style={{ margin: "32px 0 14px" }}>
        <span className="lbl">Em progresso · {pending.length}</span>
        <span className="lbl muted f-mono">Continue estudando</span>
      </div>
      <div className="conq-grid">
        {pending.map(c => {
          const p = (c.progress / c.of) * 100;
          return (
            <div className="conq-card locked" key={c.id}>
              <span className="lock-corner"><Icon name="lock" size={14}/></span>
              <div className="medal">?</div>
              <div className="tier-tag">{c.tier}</div>
              <h3 className="t">{c.title}</h3>
              <div className="d">{c.desc}</div>
              <div style={{ marginTop: "auto" }}>
                <div className="progress-mini" style={{ marginBottom: 6 }}>
                  <i style={{ width: `${p}%` }}/>
                </div>
                <div className="foot">{c.progress} / {c.of}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.ConquistasScreen = ConquistasScreen;
