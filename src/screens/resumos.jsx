function ResumosScreen({ onNav, isMobile, openSubject }) {
  const [bim, setBim] = React.useState("1º");
  const [subjFilter, setSubjFilter] = React.useState(null);
  const [view, setView] = React.useState("grade"); // grade | list

  return (
    <div className="main-pad anim-fade">
      <PageHead
        eyebrow="02 · Estudos"
        title="Resumos &"
        titleEm="simulados."
        meta={<>Período <b>{bim} bimestre</b><br/>{BIMESTRES.length} bimestres no ano</>}
      />

      <style>{`
        .res-controls { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
        .res-view { display: inline-flex; padding: 4px; background: var(--rule-soft); border-radius: 999px; }
        .res-view button { background: transparent; border: 0; cursor: pointer; padding: 8px 14px; border-radius: 999px; font: 500 12px/1 "JetBrains Mono", monospace; letter-spacing: 0.06em; color: var(--ink-soft); }
        .res-view button.on { background: var(--ink); color: var(--paper); }

        .subj-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .is-mobile .subj-grid { grid-template-columns: 1fr; }
        @media (max-width: 1100px) { .subj-grid { grid-template-columns: repeat(2, 1fr); } }

        .subj-card {
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: var(--r-3);
          padding: 22px;
          display: flex; flex-direction: column;
          gap: 14px;
          cursor: pointer;
          position: relative;
          min-height: 220px;
          transition: transform .12s ease, border-color .12s ease;
        }
        .subj-card:hover { transform: translateY(-2px); border-color: var(--ink); }
        .subj-card.locked { opacity: 0.6; cursor: not-allowed; }
        .subj-card .glyph {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: grid; place-items: center;
          font-family: "Bricolage Grotesque";
          font-weight: 700; font-stretch: 120%;
          font-size: 26px;
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--paper);
        }
        .subj-card .nm { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; letter-spacing: -0.03em; font-size: 26px; line-height: 1.05; margin: 0; }
        .subj-card .tpc { color: var(--ink-soft); font-size: 13.5px; line-height: 1.4; }
        .subj-card .foot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--rule); }
        .subj-card .foot .modules { font: 500 11px/1 "JetBrains Mono", monospace; color: var(--ink-mute); letter-spacing: 0.06em; text-transform: uppercase; }
        .subj-card .foot .go {
          width: 32px; height: 32px;
          border-radius: 999px;
          background: var(--rule-soft);
          display: grid; place-items: center;
          color: var(--ink);
          transition: background .12s ease;
        }
        .subj-card:hover .foot .go { background: var(--ink); color: var(--paper); }
        .subj-card .corner-n {
          position: absolute; top: 22px; right: 22px;
          font: 500 10.5px/1 "JetBrains Mono", monospace;
          letter-spacing: 0.14em; color: var(--ink-mute);
        }
      `}</style>

      <div className="res-controls">
        <div className="bim-tabs">
          {BIMESTRES.map(b => (
            <button key={b} className={bim === b ? "active" : ""} onClick={() => setBim(b)}>{b} bimestre</button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <span className="chip">11 matérias</span>
          <div className="res-view">
            <button className={view === "grade" ? "on" : ""} onClick={() => setView("grade")}>Grade</button>
            <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>Lista</button>
          </div>
        </div>
      </div>

      <div className="rule-h" style={{ margin: "0 0 18px" }}>
        <span className="lbl">{bim} bimestre · matérias</span>
        <span className="lbl muted f-mono">Toque pra ver os módulos</span>
      </div>

      {view === "grade" ? (
        <div className="subj-grid">
          {SUBJECTS.map((s, i) => {
            const mods = (MODULES[bim] && MODULES[bim][s.id]) || [];
            const hasContent = mods.length > 0;
            return (
              <div key={s.id}
                className={"subj-card" + (!hasContent ? " locked" : "")}
                onClick={() => hasContent && openSubject(s.id, bim)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="glyph" style={{ background: s.color }}>{s.glyph}</div>
                  <span className="corner-n">{String(i + 1).padStart(2, "0")} / 11</span>
                </div>
                <div>
                  <h3 className="nm">{s.name}</h3>
                  <div className="tpc">{s.topic}</div>
                </div>
                <div className="foot">
                  <span className="modules">
                    {hasContent
                      ? `${mods.length} ${mods.length === 1 ? "módulo" : "módulos"}`
                      : "Em breve"}
                  </span>
                  <span className="go">
                    <Icon name={hasContent ? "arrow" : "lock"} size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          {SUBJECTS.map((s, i) => {
            const mods = (MODULES[bim] && MODULES[bim][s.id]) || [];
            return (
              <div key={s.id}
                onClick={() => mods.length > 0 && openSubject(s.id, bim)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 40px 1fr 1fr auto",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 22px",
                  borderTop: i === 0 ? "0" : "1px solid var(--rule)",
                  cursor: mods.length > 0 ? "pointer" : "not-allowed",
                  opacity: mods.length > 0 ? 1 : 0.5,
                }}>
                <span className="f-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.06em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="glyph" style={{ background: s.color, width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", color: "white", fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 16 }}>
                  {s.glyph}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{s.short}</div>
                </div>
                <div style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>{s.topic}</div>
                <span className="chip f-mono">{mods.length > 0 ? `${mods.length} mód.` : "em breve"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// modal: módulos da matéria
function SubjectModal({ subjectId, bim, onClose, onStartSimulado, onNav }) {
  if (!subjectId) return null;
  const subj = SUBJECTS.find(s => s.id === subjectId);
  const mods = (MODULES[bim] && MODULES[bim][subjectId]) || [];
  const [tab, setTab] = React.useState("todos");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <style>{`
        .modal-backdrop {
          position: fixed; inset: 0;
          background: oklch(0 0 0 / 0.45);
          backdrop-filter: blur(6px);
          display: grid; place-items: center;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }
        .modal-card {
          width: min(720px, calc(100vw - 32px));
          max-height: calc(100vh - 64px);
          background: var(--bg);
          border-radius: 18px;
          overflow: auto;
          animation: slideUp 0.25s ease;
          box-shadow: 0 30px 80px rgba(0,0,0,0.3);
        }
        .modal-hd {
          padding: 28px 32px 0;
          display: flex; flex-direction: column; gap: 18px;
        }
        .modal-hd .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .modal-hd .glyph-l {
          width: 64px; height: 64px;
          border-radius: 16px;
          display: grid; place-items: center;
          font-family: "Bricolage Grotesque";
          font-weight: 700; font-stretch: 120%;
          font-size: 34px; color: white;
          letter-spacing: -0.04em;
        }
        .modal-hd h2 { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; letter-spacing: -0.04em; font-size: 44px; line-height: 0.95; margin: 0; }
        .modal-hd .tpc { color: var(--ink-soft); margin-top: 4px; }
        .modal-x { background: transparent; border: 0; color: var(--ink-mute); cursor: pointer; padding: 6px; }
        .modal-tabs { display: flex; gap: 18px; border-bottom: 1px solid var(--rule); padding: 0 32px; margin-top: 18px; }
        .modal-tabs button { background: transparent; border: 0; padding: 12px 0; cursor: pointer; font: 500 13px/1 inherit; color: var(--ink-mute); border-bottom: 2px solid transparent; margin-bottom: -1px; }
        .modal-tabs button.on { color: var(--ink); border-color: var(--ink); }
        .modal-body { padding: 22px 32px 32px; }
        .module-row {
          display: grid;
          grid-template-columns: 40px 1fr auto;
          gap: 16px;
          padding: 18px 0;
          border-top: 1px solid var(--rule);
          align-items: center;
        }
        .module-row:first-of-type { border-top: 0; }
        .module-row .kind {
          font: 500 10.5px/1 "JetBrains Mono", monospace;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 4px 8px; border-radius: 6px;
          background: var(--rule-soft); color: var(--ink-soft);
          width: fit-content;
        }
        .module-row .kind.sim { background: var(--primary-soft); color: var(--primary-ink); }
        .module-row .t { font-family: "Bricolage Grotesque"; font-weight: 500; font-stretch: 110%; letter-spacing: -0.02em; font-size: 22px; margin: 4px 0 2px; }
        .module-row .s { color: var(--ink-soft); font-size: 13.5px; }
      `}</style>

      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <div className="top">
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div className="glyph-l" style={{ background: subj.color }}>{subj.glyph}</div>
              <div>
                <h2>{subj.name}</h2>
                <div className="tpc">{bim} bimestre · {subj.topic}</div>
              </div>
            </div>
            <button className="modal-x" onClick={onClose}><Icon name="x" size={20}/></button>
          </div>
        </div>

        <div className="modal-tabs">
          <button className={tab === "todos" ? "on" : ""} onClick={() => setTab("todos")}>Todos ({mods.length})</button>
          <button className={tab === "resumo" ? "on" : ""} onClick={() => setTab("resumo")}>Resumos ({mods.filter(m => m.type === "resumo").length})</button>
          <button className={tab === "simulado" ? "on" : ""} onClick={() => setTab("simulado")}>Simulados ({mods.filter(m => m.type === "simulado").length})</button>
        </div>

        <div className="modal-body">
          {mods
            .filter(m => tab === "todos" || m.type === tab)
            .map((m, i) => (
              <div className="module-row" key={i}>
                <span className="f-mono muted" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className={"kind " + (m.type === "simulado" ? "sim" : "")}>
                    {m.type === "simulado" ? "Simulado" : "Resumo"}
                  </div>
                  <div className="t">{m.title}</div>
                  <div className="s">{m.sub}</div>
                </div>
                {m.type === "simulado" ? (
                  <button className="btn btn-primary" onClick={onStartSimulado}>
                    Iniciar <Icon name="arrow" size={14}/>
                  </button>
                ) : (
                  <button className="btn btn-ghost" onClick={onClose}>Ler</button>
                )}
              </div>
            ))}
          {mods.length === 0 && (
            <div className="center muted" style={{ padding: 40 }}>
              Conteúdo em breve.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ResumosScreen, SubjectModal });
