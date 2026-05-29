function ResumosScreen({ onNav, isMobile, openSubject }) {
  const [bim, setBim] = React.useState("1º");
  const [view, setView] = React.useState("grade");
  const BIM_UNLOCKED = ["1º", "2º"];

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
          background: var(--paper); border: 1px solid var(--rule);
          border-radius: var(--r-3); padding: 22px;
          display: flex; flex-direction: column; gap: 14px;
          cursor: pointer; position: relative; min-height: 220px;
          transition: transform .12s ease, border-color .12s ease;
        }
        .subj-card:hover { transform: translateY(-2px); border-color: var(--ink); }
        .subj-card.locked { opacity: 0.5; cursor: not-allowed; }
        .subj-card .glyph {
          width: 48px; height: 48px; border-radius: 12px;
          display: grid; place-items: center;
          font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%;
          font-size: 26px; line-height: 1; letter-spacing: -0.04em; color: var(--paper);
        }
        .subj-card .nm { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; letter-spacing: -0.03em; font-size: 26px; line-height: 1.05; margin: 0; }
        .subj-card .tpc { color: var(--ink-soft); font-size: 13.5px; line-height: 1.4; }
        .subj-card .foot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--rule); }
        .subj-card .foot .modules { font: 500 11px/1 "JetBrains Mono", monospace; color: var(--ink-mute); letter-spacing: 0.06em; text-transform: uppercase; }
        .subj-card .foot .go { width: 32px; height: 32px; border-radius: 999px; background: var(--rule-soft); display: grid; place-items: center; color: var(--ink); transition: background .12s ease; }
        .subj-card:hover .foot .go { background: var(--ink); color: var(--paper); }
        .subj-card .corner-n { position: absolute; top: 22px; right: 22px; font: 500 10.5px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; color: var(--ink-mute); }
      `}</style>

      <div className="res-controls">
        <div className="bim-tabs">
          {BIMESTRES.map(b => (
            <button key={b} className={bim === b ? "active" : ""} onClick={() => setBim(b)}>{b} bimestre</button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <span className="chip">{SUBJECTS.length} matérias</span>
          <div className="res-view">
            <button className={view === "grade" ? "on" : ""} onClick={() => setView("grade")}>Grade</button>
            <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>Lista</button>
          </div>
        </div>
      </div>

      <div className="rule-h" style={{ margin: "0 0 18px" }}>
        <span className="lbl">{bim} bimestre · matérias</span>
        <span className="lbl muted f-mono">
          {BIM_UNLOCKED.includes(bim) ? "Toque pra ver os módulos" : "Disponível em breve"}
        </span>
      </div>

      {view === "grade" ? (
        <div className="subj-grid">
          {SUBJECTS.map((s, i) => {
            const isUnlocked = BIM_UNLOCKED.includes(bim);
            return (
              <div key={s.id}
                className={"subj-card" + (!isUnlocked ? " locked" : "")}
                onClick={() => isUnlocked && openSubject(s.id, bim)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="glyph" style={{ background: s.color }}>{s.glyph}</div>
                  <span className="corner-n">{String(i + 1).padStart(2, "0")} / {SUBJECTS.length}</span>
                </div>
                <div>
                  <h3 className="nm">{s.name}</h3>
                  <div className="tpc">{s.topic}</div>
                </div>
                <div className="foot">
                  <span className="modules">{isUnlocked ? "Abrir" : "Em breve"}</span>
                  <span className="go"><Icon name={isUnlocked ? "arrow" : "lock"} size={14} /></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          {SUBJECTS.map((s, i) => {
            const isUnlocked = BIM_UNLOCKED.includes(bim);
            return (
              <div key={s.id}
                onClick={() => isUnlocked && openSubject(s.id, bim)}
                style={{
                  display: "grid", gridTemplateColumns: "32px 40px 1fr 1fr auto",
                  alignItems: "center", gap: 16, padding: "14px 22px",
                  borderTop: i === 0 ? "0" : "1px solid var(--rule)",
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  opacity: isUnlocked ? 1 : 0.5,
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
                <span className="chip f-mono">{isUnlocked ? "Abrir" : "em breve"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SubjectModal ─────────────────────────────────────────────
function SubjectModal({ subjectId, bim, onClose, onStartSimulado, onNav, profile, userId }) {
  if (!subjectId) return null;
  const subj = SUBJECTS.find(s => s.id === subjectId);
  const bimNum = parseInt(bim) || 1;
  const isAdmin = profile?.is_admin === true;

  const resumos    = useResumosDB(subjectId, bimNum);
  const questoes   = useQuestoesSimulado(subjectId, bimNum);
  const [tab, setTab]         = React.useState("resumos");
  const [uploading, setUploading] = React.useState(false);
  const [addTitle, setAddTitle]   = React.useState("");
  const [addDesc, setAddDesc]     = React.useState("");
  const [addModal, setAddModal]   = React.useState(false);
  const [localResumos, setLocalResumos] = React.useState(null);

  // Use localResumos if updated, otherwise use fetched
  const displayResumos = localResumos ?? resumos;

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !addTitle.trim()) { alert("Preencha o título primeiro."); return; }
    setUploading(true);
    try {
      const pdfUrl = await uploadResumoPDF(file, subjectId, bimNum);
      const saved = await saveResumoDB({ subjectSlug: subjectId, bimestre: bimNum, title: addTitle, description: addDesc, pdfUrl, userId });
      setLocalResumos(prev => [...(prev ?? resumos), saved]);
      setAddModal(false);
      setAddTitle(""); setAddDesc("");
    } catch (err) {
      alert("Erro ao fazer upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResumo = async (id) => {
    if (!confirm("Remover este resumo?")) return;
    try {
      await deleteResumoDB(id);
      setLocalResumos(prev => (prev ?? resumos).filter(r => r.id !== id));
    } catch (err) {
      alert("Erro ao remover: " + err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <style>{`
        .modal-backdrop { position: fixed; inset: 0; background: oklch(0 0 0 / 0.45); backdrop-filter: blur(6px); display: grid; place-items: center; z-index: 100; animation: fadeIn 0.2s ease; }
        .modal-card { width: min(720px, calc(100vw - 32px)); max-height: calc(100vh - 64px); background: var(--bg); border-radius: 18px; overflow: auto; animation: slideUp 0.25s ease; box-shadow: 0 30px 80px rgba(0,0,0,0.3); }
        .modal-hd { padding: 28px 32px 0; display: flex; flex-direction: column; gap: 18px; }
        .modal-hd .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .modal-hd .glyph-l { width: 64px; height: 64px; border-radius: 16px; display: grid; place-items: center; font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; font-size: 34px; color: white; letter-spacing: -0.04em; }
        .modal-hd h2 { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; letter-spacing: -0.04em; font-size: 44px; line-height: 0.95; margin: 0; }
        .modal-hd .tpc { color: var(--ink-soft); margin-top: 4px; }
        .modal-x { background: transparent; border: 0; color: var(--ink-mute); cursor: pointer; padding: 6px; }
        .modal-tabs { display: flex; gap: 18px; border-bottom: 1px solid var(--rule); padding: 0 32px; margin-top: 18px; }
        .modal-tabs button { background: transparent; border: 0; padding: 12px 0; cursor: pointer; font: 500 13px/1 inherit; color: var(--ink-mute); border-bottom: 2px solid transparent; margin-bottom: -1px; }
        .modal-tabs button.on { color: var(--ink); border-color: var(--ink); }
        .modal-body { padding: 22px 32px 32px; }
        .module-row { display: grid; grid-template-columns: 40px 1fr auto; gap: 16px; padding: 18px 0; border-top: 1px solid var(--rule); align-items: center; }
        .module-row:first-of-type { border-top: 0; }
        .module-row .kind { font: 500 10.5px/1 "JetBrains Mono", monospace; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; background: var(--rule-soft); color: var(--ink-soft); width: fit-content; }
        .module-row .kind.sim { background: var(--primary-soft); color: var(--primary-ink); }
        .module-row .t { font-family: "Bricolage Grotesque"; font-weight: 500; font-stretch: 110%; letter-spacing: -0.02em; font-size: 22px; margin: 4px 0 2px; }
        .module-row .s { color: var(--ink-soft); font-size: 13.5px; }

        .add-modal-overlay { position: fixed; inset: 0; background: oklch(0 0 0 / 0.5); z-index: 200; display: grid; place-items: center; }
        .add-modal-card { background: var(--bg); border-radius: 16px; padding: 28px; width: min(480px, calc(100vw - 32px)); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .add-modal-card h3 { font-family: "Bricolage Grotesque"; font-weight: 600; letter-spacing: -0.03em; font-size: 24px; margin: 0 0 20px; }
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
          <button className={tab === "resumos" ? "on" : ""} onClick={() => setTab("resumos")}>
            Resumos ({displayResumos.length})
          </button>
          <button className={tab === "simulado" ? "on" : ""} onClick={() => setTab("simulado")}>
            Simulado ({questoes.length} questões)
          </button>
        </div>

        <div className="modal-body">
          {tab === "resumos" && (
            <>
              {displayResumos.length === 0 && (
                <div className="center muted" style={{ padding: "30px 0" }}>
                  {isAdmin ? "Nenhum resumo ainda. Adicione um PDF abaixo." : "Resumos em breve."}
                </div>
              )}
              {displayResumos.map((r, i) => (
                <div className="module-row" key={r.id}>
                  <span className="f-mono muted" style={{ fontSize: 11, letterSpacing: "0.06em" }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="kind">Resumo · PDF</div>
                    <div className="t">{r.title}</div>
                    {r.description && <div className="s">{r.description}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {r.pdf_url && (
                      <a href={r.pdf_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: "none" }}>
                        Ler PDF
                      </a>
                    )}
                    {isAdmin && (
                      <button className="btn btn-ghost" style={{ color: "var(--err)" }} onClick={() => handleDeleteResumo(r.id)}>
                        <Icon name="trash" size={14}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isAdmin && (
                <button className="btn btn-primary" style={{ marginTop: 18, width: "100%" }} onClick={() => setAddModal(true)}>
                  <Icon name="plus" size={14}/> Adicionar Resumo PDF
                </button>
              )}
            </>
          )}

          {tab === "simulado" && (
            <>
              {questoes.length === 0 ? (
                <div className="center muted" style={{ padding: "30px 0" }}>
                  {isAdmin
                    ? "Nenhuma questão ainda. Importe pelo Painel Admin."
                    : "Simulado em breve."}
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
                    {[
                      { label: "Total", val: questoes.length },
                      { label: "Fáceis", val: questoes.filter(q => q.dificuldade === 1).length },
                      { label: "Médias", val: questoes.filter(q => q.dificuldade === 2).length },
                      { label: "Difíceis", val: questoes.filter(q => q.dificuldade === 3).length },
                    ].map(s => (
                      <div key={s.label} className="card card-pad" style={{ flex: 1, minWidth: 80, padding: "12px 16px" }}>
                        <div className="muted f-mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
                        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 28, letterSpacing: "-0.03em" }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%", padding: "14px" }} onClick={() => onStartSimulado(questoes)}>
                    Iniciar Simulado <Icon name="arrow" size={14}/>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add PDF modal */}
      {addModal && (
        <div className="add-modal-overlay" onClick={() => setAddModal(false)}>
          <div className="add-modal-card" onClick={e => e.stopPropagation()}>
            <h3>Adicionar Resumo PDF</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="field-label">Título *</label>
                <input className="input" placeholder="Ex: Resumo · Equações do 1º Grau" value={addTitle} onChange={e => setAddTitle(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="field-label">Descrição (opcional)</label>
                <input className="input" placeholder="Ex: Módulos 1 ao 4" value={addDesc} onChange={e => setAddDesc(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Arquivo PDF *</label>
                <input type="file" accept=".pdf" onChange={handlePDFUpload} disabled={uploading} className="input" style={{ padding: "10px" }} />
              </div>
              {uploading && <div className="muted f-mono" style={{ fontSize: 12 }}>Fazendo upload...</div>}
              <div className="flex gap-3" style={{ marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ResumosScreen, SubjectModal });
