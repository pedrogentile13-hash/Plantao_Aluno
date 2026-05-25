// New Boletim with 3 tabs + activity modal
// Data model: each discipline has 4 bimestres; each bimestre has 3 categories
// (PB Prova Bimestral 35%, Q Qualitativa 30%, VA 35%) with a list of activities.

const CAT_DEF = [
  { key: "PB", label: "Prova Bimestral", peso: 35, color: "var(--primary)",  soft: "var(--primary-soft)", ink: "var(--primary-ink)" },
  { key: "Q",  label: "Qualitativa",     peso: 30, color: "var(--accent-2)", soft: "oklch(0.94 0.05 28)", ink: "oklch(0.30 0.10 28)" },
  { key: "VA", label: "VA",              peso: 35, color: "var(--accent-3)", soft: "oklch(0.93 0.05 145)", ink: "oklch(0.25 0.10 145)" },
];

// generate seed activities for each discipline / bimestre
const seedBoletim = () => {
  const data = {};
  BOLETIM.forEach((row, i) => {
    data[row.disc] = { prof: row.prof, bims: {} };
    [0,1,2,3].forEach(bi => {
      const grade = row.notas[bi];
      data[row.disc].bims[bi] = {
        PB: grade != null ? [
          { id: `pb-${i}-${bi}-1`, nome: `PA - ${row.disc.slice(0,4)}`, desc: "", nota: Math.max(0, grade - 0.3), max: 10, peso: 9.25, data: "2026-03-30" },
          { id: `pb-${i}-${bi}-2`, nome: `PB - ${row.disc.slice(0,4)}`, desc: "", nota: Math.min(10, grade + 0.3), max: 10, peso: 9.75, data: "2026-03-26" },
        ] : [],
        Q: grade != null ? [
          { id: `q-${i}-${bi}-1`, nome: "Qualitativa", desc: "", nota: Math.min(10, grade + 0.6), max: 10, peso: 1, data: "2026-03-27" },
        ] : [],
        VA: grade != null ? [
          { id: `va-${i}-${bi}-1`, nome: `VA 1 - ${row.disc.slice(0,4).toUpperCase()}`, desc: "Conteúdo 1", nota: Math.max(0, grade - 0.4), max: 10, peso: 3.25, data: "2026-02-12" },
          { id: `va-${i}-${bi}-2`, nome: `VA 2 - ${row.disc.slice(0,4).toUpperCase()}`, desc: "Conteúdo 2", nota: grade, max: 10, peso: 5, data: "2026-03-05" },
        ] : [],
      };
    });
  });
  return data;
};

// Compute category average (weighted by activity peso)
const catAverage = (acts) => {
  if (!acts || acts.length === 0) return null;
  let sumPN = 0, sumP = 0;
  acts.forEach(a => {
    const norm = (a.nota / a.max) * 10;
    sumPN += norm * a.peso;
    sumP += a.peso;
  });
  if (sumP === 0) return null;
  return sumPN / sumP;
};

// Compute bimestre composite (weighted by cat peso)
const bimAverage = (bim) => {
  let sumPN = 0, sumP = 0, anyData = false;
  CAT_DEF.forEach(cat => {
    const avg = catAverage(bim[cat.key]);
    if (avg != null) {
      sumPN += avg * cat.peso;
      sumP += cat.peso;
      anyData = true;
    }
  });
  if (!anyData) return null;
  return sumPN / sumP;
};

function BoletimScreen({ onNav, isMobile }) {
  const [tab, setTab] = React.useState("geral");   // geral | detalhado | desempenho
  const [year, setYear] = React.useState("2026");
  const [data, setData] = React.useState(() => seedBoletim());

  // visao geral state: clicking disciplina opens "manage activities" overlay
  const [openDisc, setOpenDisc] = React.useState(null); // string disc name
  // detalhado state: which disc is selected
  const [selectedDisc, setSelectedDisc] = React.useState("Artes");
  // activity modal
  const [actModal, setActModal] = React.useState(null); // { disc, bim, cat, editing? }

  // computed across all
  const allBimAvgs = Object.values(data).flatMap(d => [0,1,2,3].map(b => bimAverage(d.bims[b])).filter(v => v != null));
  const mediaGeral = allBimAvgs.length ? allBimAvgs.reduce((a,b)=>a+b,0) / allBimAvgs.length : 0;
  const maior = allBimAvgs.length ? Math.max(...allBimAvgs) : 0;
  const menor = allBimAvgs.length ? Math.min(...allBimAvgs) : 0;
  const aprovado = mediaGeral >= 7;

  const discList = Object.keys(data).sort();

  const addActivity = ({ disc, bim, cat, activity }) => {
    setData(prev => {
      const next = { ...prev };
      const arr = next[disc].bims[bim][cat].slice();
      if (activity.id && arr.find(a => a.id === activity.id)) {
        // edit
        const idx = arr.findIndex(a => a.id === activity.id);
        arr[idx] = activity;
      } else {
        arr.push({ ...activity, id: `${cat}-${disc}-${bim}-${Date.now()}` });
      }
      next[disc] = { ...next[disc], bims: { ...next[disc].bims, [bim]: { ...next[disc].bims[bim], [cat]: arr } } };
      return next;
    });
  };
  const removeActivity = ({ disc, bim, cat, id }) => {
    setData(prev => {
      const next = { ...prev };
      const arr = next[disc].bims[bim][cat].filter(a => a.id !== id);
      next[disc] = { ...next[disc], bims: { ...next[disc].bims, [bim]: { ...next[disc].bims[bim], [cat]: arr } } };
      return next;
    });
  };

  return (
    <div className="main-pad anim-fade">
      <PageHead
        eyebrow="04 · Boletim"
        title="Boletim"
        titleEm={tab === "geral" ? "geral" : tab === "detalhado" ? "detalhado" : "em gráficos"}
        meta={<>Ano letivo <b>2026 — 9C</b><br/>Situação <b style={{ color: aprovado ? "var(--ok)" : "var(--err)" }}>{aprovado ? "APROVADO" : "EM RISCO"}</b></>}
      />

      <style>{`
        .bo-tabs-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
        .bo-tabs {
          display: inline-flex; gap: 4px; padding: 4px;
          background: var(--paper);
          border: 1.5px solid var(--ink); border-radius: 999px;
          box-shadow: 3px 3px 0 var(--ink);
        }
        .bo-tabs button {
          background: transparent; border: 0; cursor: pointer;
          padding: 9px 18px; border-radius: 999px;
          font: 700 12.5px/1 "JetBrains Mono", monospace;
          letter-spacing: 0.04em; color: var(--ink-soft);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .bo-tabs button.on { background: var(--ink); color: var(--paper); }

        .bo-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
        .is-mobile .bo-summary { grid-template-columns: repeat(2, 1fr); }

        /* GERAL — table */
        .bo-table {
          background: var(--paper);
          border: 1.5px solid var(--ink);
          border-radius: var(--r-3);
          box-shadow: 4px 4px 0 var(--ink);
          overflow: hidden;
        }
        .bo-row {
          display: grid;
          grid-template-columns: 36px 1.5fr 1fr repeat(4, 70px) 80px;
          gap: 12px;
          padding: 14px 22px;
          align-items: center;
        }
        .bo-row.head {
          background: var(--ink); color: var(--paper);
          font: 700 10.5px/1.3 "JetBrains Mono", monospace;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .bo-row:not(.head) {
          border-top: 1.5px dashed var(--rule);
          font-size: 14px; cursor: pointer;
          transition: background .12s ease;
        }
        .bo-row:not(.head):hover { background: var(--accent); }
        .bo-row:not(.head):hover .cell, .bo-row:not(.head):hover .final { color: var(--accent-ink) !important; }
        .bo-row .qn { font: 700 11px/1 "JetBrains Mono", monospace; color: var(--ink-mute); }
        .bo-row .disc { font-weight: 700; }
        .bo-row .prof { color: var(--ink-mute); }
        .bo-row .cell { text-align: center; font: 600 14px/1 "JetBrains Mono", monospace; }
        .bo-row .final { text-align: right; font-family: "Bricolage Grotesque"; font-weight: 700; font-size: 24px; letter-spacing: -0.025em; }
        .bo-row .final.ok { color: var(--primary); }
        .bo-row .final.bad { color: var(--err); }

        .is-mobile .bo-row { grid-template-columns: 1fr 70px; padding: 14px 16px; }
        .is-mobile .bo-row .qn, .is-mobile .bo-row .prof, .is-mobile .bo-row .cell { display: none; }
        .is-mobile .bo-row.head { display: none; }

        /* DETALHADO — chips */
        .chip-pick { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0 18px; }
        .chip-pick button {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1.5px solid var(--ink);
          background: var(--paper);
          cursor: pointer;
          font: 700 13px/1 inherit;
          display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 2px 2px 0 var(--ink);
        }
        .chip-pick button .nota {
          font: 700 11px/1 "JetBrains Mono", monospace;
          padding: 3px 6px; border-radius: 6px;
          background: var(--rule-soft); color: var(--ink-soft);
        }
        .chip-pick button.on { background: var(--ink); color: var(--paper); }
        .chip-pick button.on .nota { background: var(--accent); color: var(--accent-ink); }

        /* DESEMPENHO charts placeholder */
      `}</style>

      <div className="bo-tabs-row">
        <div className="bo-tabs">
          <button className={tab === "geral" ? "on" : ""} onClick={() => setTab("geral")}>
            <Icon name="doc" size={14}/> Visão Geral
          </button>
          <button className={tab === "detalhado" ? "on" : ""} onClick={() => setTab("detalhado")}>
            <Icon name="search" size={14}/> Detalhado
          </button>
          <button className={tab === "desempenho" ? "on" : ""} onClick={() => setTab("desempenho")}>
            <Icon name="chart" size={14}/> Desempenho
          </button>
        </div>
        <div className="bim-tabs">
          <button className={year === "2026" ? "active" : ""} onClick={() => setYear("2026")}>2026 — 9C</button>
          <button className={year === "2025" ? "active" : ""} onClick={() => setYear("2025")}>2025 — 8C</button>
        </div>
      </div>

      {/* SUMMARY (always visible) */}
      <div className="bo-summary">
        <div className="card card-pad">
          <div className="big-stat">
            <div className="label">Disciplinas</div>
            <div className="value">{discList.length}</div>
          </div>
        </div>
        <div className="card card-pad" style={{ background: "var(--primary)", borderColor: "var(--ink)", color: "var(--on-primary)" }}>
          <div className="big-stat">
            <div className="label" style={{ color: "oklch(0.9 0.05 258)" }}>Média geral</div>
            <div className="value f-num" style={{ color: "var(--paper)" }}>{mediaGeral.toFixed(1)}</div>
          </div>
        </div>
        <div className="card card-pad">
          <div className="big-stat">
            <div className="label">Maior média</div>
            <div className="value f-num" style={{ color: "var(--ok)" }}>{maior.toFixed(1)}</div>
          </div>
        </div>
        <div className="card card-pad">
          <div className="big-stat">
            <div className="label">Menor média</div>
            <div className="value f-num" style={{ color: "var(--err)" }}>{menor.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {tab === "geral" && (
        <BoletimGeral
          data={data}
          discList={discList}
          onOpenDisc={(d) => setOpenDisc(d)}
        />
      )}

      {tab === "detalhado" && (
        <BoletimDetalhado
          data={data}
          discList={discList}
          selected={selectedDisc}
          onSelect={setSelectedDisc}
          onAddActivity={(disc, bim, cat) => setActModal({ disc, bim, cat })}
          onEditActivity={(disc, bim, cat, act) => setActModal({ disc, bim, cat, editing: act })}
          onRemoveActivity={removeActivity}
        />
      )}

      {tab === "desempenho" && (
        <BoletimDesempenho data={data} discList={discList} />
      )}

      {/* Disc manage overlay (Visão Geral click) */}
      {openDisc && (
        <DiscOverlay
          disc={openDisc}
          data={data[openDisc]}
          onClose={() => setOpenDisc(null)}
          onAdd={(bim, cat) => setActModal({ disc: openDisc, bim, cat })}
          onEdit={(bim, cat, act) => setActModal({ disc: openDisc, bim, cat, editing: act })}
          onRemove={(bim, cat, id) => removeActivity({ disc: openDisc, bim, cat, id })}
        />
      )}

      {/* Activity modal */}
      {actModal && (
        <ActivityModal
          ctx={actModal}
          onClose={() => setActModal(null)}
          onSave={(activity) => { addActivity({ ...actModal, activity }); setActModal(null); }}
        />
      )}
    </div>
  );
}

/* ───────── VISÃO GERAL — TABLE ───────── */
function BoletimGeral({ data, discList, onOpenDisc }) {
  return (
    <React.Fragment>
      <div className="rule-h" style={{ margin: "0 0 14px" }}>
        <span className="lbl">Notas por bimestre</span>
        <span className="lbl muted">Clique numa matéria para gerenciar atividades</span>
      </div>

      <div className="bo-table">
        <div className="bo-row head">
          <span>#</span>
          <span>Disciplina</span>
          <span>Professor(a)</span>
          {BIMESTRES.map(b => (
            <span key={b} style={{ textAlign: "center" }}>{b}</span>
          ))}
          <span style={{ textAlign: "right" }}>Final</span>
        </div>

        {discList.map((disc, i) => {
          const d = data[disc];
          const bims = [0,1,2,3].map(b => bimAverage(d.bims[b]));
          const finals = bims.filter(v => v != null);
          const final = finals.length ? finals.reduce((a,b)=>a+b,0)/finals.length : null;
          return (
            <div key={disc} className="bo-row" onClick={() => onOpenDisc(disc)}>
              <span className="qn">{String(i + 1).padStart(2, "0")}</span>
              <span className="disc">{disc}</span>
              <span className="prof">{d.prof}</span>
              {bims.map((avg, b) => (
                <span key={b} className="cell">
                  {avg == null ? <span style={{ color: "var(--ink-mute)" }}>—</span> : avg.toFixed(1)}
                </span>
              ))}
              <span className={"final " + (final == null ? "" : final >= 7 ? "ok" : "bad")}>
                {final == null ? "—" : final.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}

/* ───────── DISC OVERLAY — manage activities for one disc ───────── */
function DiscOverlay({ disc, data, onClose, onAdd, onEdit, onRemove }) {
  const [bim, setBim] = React.useState(0);

  const totalAvg = bimAverage(data.bims[bim]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <style>{`
        .doc-card { width: min(1100px, 100%); }
        .doc-hd { padding: 22px 28px 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; border-bottom: 1.5px dashed var(--rule); }
        .doc-hd h2 { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; letter-spacing: -0.04em; font-size: 38px; margin: 0; line-height: 1; }
        .doc-hd .desc { color: var(--ink-soft); margin-top: 6px; font-size: 14px; }
        .doc-body { padding: 18px 28px 28px; }
        .doc-bim-row { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
        .doc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 920px) { .doc-grid { grid-template-columns: 1fr; } }

        .cat-card {
          border: 1.5px solid var(--ink);
          border-radius: var(--r-3);
          padding: 18px;
          background: var(--paper);
          box-shadow: 4px 4px 0 var(--ink);
          display: flex; flex-direction: column;
          min-height: 280px;
        }
        .cat-card .ct-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding-bottom: 12px;
        }
        .cat-card .ct-name {
          font-family: "Bricolage Grotesque";
          font-weight: 700; font-stretch: 115%;
          letter-spacing: -0.02em;
          font-size: 22px;
        }
        .cat-card .ct-peso {
          font: 700 11px/1 "JetBrains Mono", monospace;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--ink-mute); margin-top: 4px;
        }
        .cat-card .ct-avg {
          font-family: "Bricolage Grotesque";
          font-weight: 700; font-stretch: 120%; letter-spacing: -0.03em;
          font-size: 28px; line-height: 1;
        }
        .cat-card .acts { flex: 1; display: flex; flex-direction: column; gap: 8px; min-height: 100px; }
        .act-item {
          padding: 10px 12px;
          background: var(--bg);
          border: 1px solid var(--rule);
          border-radius: 10px;
          display: grid; grid-template-columns: 1fr auto;
          gap: 8px; align-items: flex-start;
        }
        .act-item .nm { font-weight: 600; font-size: 13.5px; line-height: 1.2; }
        .act-item .mt { font: 600 11px/1.3 "JetBrains Mono", monospace; color: var(--ink-mute); margin-top: 4px; }
        .act-actions { display: flex; gap: 4px; }
        .iconb { width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--rule); background: var(--paper); cursor: pointer; display: grid; place-items: center; color: var(--ink-soft); }
        .iconb:hover { background: var(--ink); color: var(--paper); }
        .iconb.danger:hover { background: var(--err); color: white; }
        .add-act {
          padding: 14px;
          border: 2px dashed var(--rule);
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          font: 700 13px/1 inherit;
          color: var(--ink);
          text-align: center;
        }
        .add-act:hover { border-color: var(--ink); background: var(--rule-soft); }

        .doc-foot {
          margin-top: 22px; padding: 18px;
          background: var(--ink); color: var(--paper);
          border-radius: var(--r-3);
          display: flex; justify-content: space-between; align-items: center; gap: 14px;
          flex-wrap: wrap;
        }
        .doc-foot .lbl { font: 700 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; text-transform: uppercase; color: oklch(0.75 0.02 260); }
        .doc-foot .pills { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
        .doc-foot .pill {
          padding: 6px 12px; border-radius: 999px;
          background: oklch(0 0 0 / 0.3);
          font: 600 12px/1 "JetBrains Mono", monospace;
        }
        .doc-foot .pill .v { font-family: "Bricolage Grotesque"; font-weight: 700; font-size: 15px; margin-left: 6px; }
        .doc-foot .big {
          font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%;
          letter-spacing: -0.04em; font-size: 48px; line-height: 1;
          color: var(--accent);
        }
      `}</style>

      <div className="modal-card-pop doc-card" onClick={(e) => e.stopPropagation()}>
        <div className="doc-hd">
          <div>
            <div className="num-tag">Boletim · {data.prof}</div>
            <h2>{disc}</h2>
            <div className="desc">Adicione e gerencie as atividades de cada bimestre.</div>
          </div>
          <button className="iconb" onClick={onClose}><Icon name="x" size={18}/></button>
        </div>

        <div className="doc-body">
          <div className="doc-bim-row">
            <div className="bim-tabs">
              {BIMESTRES.map((b, i) => (
                <button key={b} className={bim === i ? "active" : ""} onClick={() => setBim(i)}>{b} bim</button>
              ))}
            </div>
            <div className="muted f-mono" style={{ fontSize: 12 }}>
              PB 35% · Q 30% · VA 35%
            </div>
          </div>

          <div className="doc-grid">
            {CAT_DEF.map(cat => {
              const acts = data.bims[bim][cat.key];
              const avg = catAverage(acts);
              return (
                <div className="cat-card" key={cat.key} style={{ background: cat.soft }}>
                  <div className="ct-head">
                    <div>
                      <div className="ct-name" style={{ color: cat.ink }}>{cat.label}</div>
                      <div className="ct-peso" style={{ color: cat.ink, opacity: 0.7 }}>Peso · {cat.peso}</div>
                    </div>
                    <div className="ct-avg" style={{ color: cat.ink }}>
                      {avg == null ? "—" : avg.toFixed(2)}
                    </div>
                  </div>

                  <div className="acts">
                    {acts.map(a => (
                      <div className="act-item" key={a.id}>
                        <div>
                          <div className="nm">{a.nome}</div>
                          <div className="mt">
                            {a.nota}/{a.max} · Peso {a.peso} · Norm {((a.nota/a.max)*10).toFixed(2)}{a.data && <> · {a.data}</>}
                          </div>
                        </div>
                        <div className="act-actions">
                          <button className="iconb" onClick={() => onEdit(bim, cat.key, a)}><Icon name="edit" size={12}/></button>
                          <button className="iconb danger" onClick={() => onRemove(bim, cat.key, a.id)}><Icon name="trash" size={12}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="add-act" style={{ color: cat.ink, borderColor: cat.ink, opacity: 0.85 }} onClick={() => onAdd(bim, cat.key)}>
                    + Adicionar
                  </button>
                </div>
              );
            })}
          </div>

          <div className="doc-foot">
            <div>
              <div className="lbl">Composição da Média · {BIMESTRES[bim]} bim</div>
              <div className="pills">
                {CAT_DEF.map(cat => {
                  const avg = catAverage(data.bims[bim][cat.key]);
                  return (
                    <span className="pill" key={cat.key}>
                      <span style={{ color: cat.color }}>●</span> {cat.label}:
                      <span className="v">{avg == null ? "—" : avg.toFixed(2)}</span>
                      <span style={{ opacity: 0.6 }}> ×{cat.peso}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="lbl" style={{ textAlign: "right" }}>Média do bimestre</div>
              <div className="big" style={{ textAlign: "right" }}>{totalAvg == null ? "—" : totalAvg.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── ACTIVITY MODAL ───────── */
function ActivityModal({ ctx, onClose, onSave }) {
  const editing = ctx.editing || {};
  const [nome, setNome] = React.useState(editing.nome || "");
  const [desc, setDesc] = React.useState(editing.desc || "");
  const [nota, setNota] = React.useState(editing.nota ?? 7);
  const [max,  setMax]  = React.useState(editing.max  ?? 10);
  const [peso, setPeso] = React.useState(editing.peso ?? 1);
  const [data, setData] = React.useState(editing.data || "");

  const catLabel = CAT_DEF.find(c => c.key === ctx.cat).label;

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...(editing.id ? { id: editing.id } : {}), nome, desc, nota: Number(nota), max: Number(max), peso: Number(peso), data });
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 200 }} onClick={onClose}>
      <style>{`
        .act-modal { width: min(560px, 100%); }
        .act-hd { padding: 22px 28px 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; border-bottom: 1.5px dashed var(--rule); }
        .act-hd h2 { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; letter-spacing: -0.04em; font-size: 30px; margin: 0; line-height: 1.05; }
        .act-hd .meta { font: 600 12px/1 "JetBrains Mono", monospace; color: var(--ink-mute); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 6px; }
        .act-body { padding: 22px 28px 28px; display: flex; flex-direction: column; gap: 14px; }
        .three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      `}</style>

      <div className="modal-card-pop act-modal" onClick={(e) => e.stopPropagation()}>
        <div className="act-hd">
          <div>
            <h2>{editing.id ? "Editar atividade" : `Nova ${catLabel}`}</h2>
            <div className="meta">{ctx.disc} · {BIMESTRES[ctx.bim]} bim · {ctx.cat}</div>
          </div>
          <button className="iconb" onClick={onClose}><Icon name="x" size={18}/></button>
        </div>

        <form className="act-body" onSubmit={submit}>
          <div>
            <label className="field-label">Nome da atividade</label>
            <input className="input" placeholder="Ex: Prova Anglo P7 8" value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="field-label">Descrição / conteúdo (opcional)</label>
            <input className="input" placeholder="Ex: Módulos 37 a 44" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="three">
            <div>
              <label className="field-label">Nota</label>
              <input className="input" type="number" step="0.1" min="0" max={max} value={nota} onChange={(e) => setNota(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Máx.</label>
              <input className="input" type="number" step="0.1" min="0.1" value={max} onChange={(e) => setMax(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Peso</label>
              <input className="input" type="number" step="0.05" min="0.05" value={peso} onChange={(e) => setPeso(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="field-label">Data (opcional)</label>
            <input className="input" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="flex gap-3" style={{ marginTop: 6 }}>
            <button className="btn btn-primary btn-lg" type="submit">
              <Icon name="plus" size={14}/> {editing.id ? "Salvar alterações" : "Adicionar"}
            </button>
            <button className="btn btn-ghost btn-lg" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ───────── DETALHADO ───────── */
function BoletimDetalhado({ data, discList, selected, onSelect, onAddActivity, onEditActivity, onRemoveActivity }) {
  const d = data[selected];
  if (!d) return null;

  return (
    <React.Fragment>
      <div className="rule-h" style={{ margin: "0 0 4px" }}>
        <span className="lbl">Selecione a disciplina</span>
        <span className="lbl muted">↳ análise completa por bimestre</span>
      </div>
      <div className="chip-pick">
        {discList.map(disc => {
          const dd = data[disc];
          const finals = [0,1,2,3].map(b => bimAverage(dd.bims[b])).filter(v => v != null);
          const final = finals.length ? finals.reduce((a,b)=>a+b,0)/finals.length : null;
          return (
            <button key={disc} className={selected === disc ? "on" : ""} onClick={() => onSelect(disc)}>
              {disc}
              <span className="nota">{final == null ? "—" : final.toFixed(1)}</span>
            </button>
          );
        })}
      </div>

      <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div className="avatar" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 16 }}>
          {d.prof.split(" ").map(w => w[0]).slice(0,2).join("")}
        </div>
        <div>
          <div className="muted f-mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Professor(a) · {selected}</div>
          <div style={{ fontWeight: 700, fontSize: 20, fontFamily: "Bricolage Grotesque", fontStretch: "115%", letterSpacing: "-0.02em" }}>{d.prof}</div>
        </div>
      </div>

      {[0,1,2,3].map(bim => (
        <BimDetailBlock
          key={bim}
          disc={selected}
          bim={bim}
          bimData={d.bims[bim]}
          onAdd={(cat) => onAddActivity(selected, bim, cat)}
          onEdit={(cat, act) => onEditActivity(selected, bim, cat, act)}
          onRemove={(cat, id) => onRemoveActivity({ disc: selected, bim, cat, id })}
        />
      ))}
    </React.Fragment>
  );
}

function BimDetailBlock({ disc, bim, bimData, onAdd, onEdit, onRemove }) {
  const avg = bimAverage(bimData);
  return (
    <div style={{ marginBottom: 28 }}>
      <style>{`
        .bdb-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .bdb-tag {
          width: 56px; height: 56px; border-radius: 14px;
          display: grid; place-items: center;
          background: var(--primary); color: var(--on-primary);
          font-family: "Bricolage Grotesque"; font-weight: 800; font-stretch: 120%;
          font-size: 22px; letter-spacing: -0.04em;
          border: 1.5px solid var(--ink); box-shadow: 3px 3px 0 var(--ink);
          transform: rotate(-4deg);
        }
        .bdb-head h3 { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 115%; letter-spacing: -0.03em; font-size: 26px; margin: 0; line-height: 1; }
        .bdb-head .av { margin-left: auto; text-align: right; }
        .bdb-head .av .lbl { font: 700 10.5px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-mute); }
        .bdb-head .av .v { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; font-size: 38px; letter-spacing: -0.035em; color: var(--primary); margin-top: 4px; }

        .bdb-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 960px) { .bdb-cards { grid-template-columns: 1fr; } }

        .bdb-cat {
          border: 1.5px solid var(--ink);
          border-radius: var(--r-3);
          padding: 18px;
          background: var(--paper);
          box-shadow: 4px 4px 0 var(--ink);
          display: flex; flex-direction: column;
        }
        .bdb-cat-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .bdb-cat-head .nm { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 115%; letter-spacing: -0.025em; font-size: 20px; }
        .bdb-cat-head .pesoinfo { font: 600 11px/1.3 "JetBrains Mono", monospace; color: var(--ink-mute); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }
        .bdb-cat-head .av { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; font-size: 24px; letter-spacing: -0.03em; }

        .bdb-table {
          font: 12.5px/1.4 "JetBrains Mono", monospace;
          display: grid;
          grid-template-columns: 1.4fr 1fr 90px 50px 50px 60px 28px;
          gap: 4px;
        }
        .bdb-table .h { font-size: 9.5px; color: var(--ink-mute); letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 0; border-bottom: 1px dashed var(--rule); }
        .bdb-table .c { padding: 8px 0; border-bottom: 1px solid var(--rule-soft); align-self: center; }
        .bdb-table .c.right { text-align: right; }
        .bdb-table .c.nota { color: var(--primary); font-weight: 700; }
        .bdb-table .c.norm { font-weight: 700; }
        .bdb-table .c.tools { display: flex; gap: 2px; justify-content: flex-end; }
        .bdb-table .c.tools button { width: 22px; height: 22px; border: 0; background: var(--rule-soft); border-radius: 5px; cursor: pointer; display: grid; place-items: center; color: var(--ink-soft); }
        .bdb-table .c.tools button:hover { background: var(--ink); color: var(--paper); }

        .bdb-add { margin-top: auto; padding: 10px; border: 1.5px dashed var(--rule); background: transparent; border-radius: 10px; cursor: pointer; font: 700 12.5px/1 inherit; color: var(--ink); }
        .bdb-add:hover { background: var(--rule-soft); border-color: var(--ink); }
        .empty-msg { color: var(--ink-mute); font-size: 13px; padding: 14px 0; text-align: center; }

        .bdb-formula {
          margin-top: 18px;
          padding: 16px 22px;
          background: var(--ink); color: var(--paper);
          border-radius: var(--r-3);
          display: flex; justify-content: space-between; align-items: center;
          gap: 14px; flex-wrap: wrap;
          font: 14px/1.4 "JetBrains Mono", monospace;
        }
        .bdb-formula .form-text { color: oklch(0.85 0.02 260); }
        .bdb-formula .form-text b { color: var(--accent); }
        .bdb-formula .result {
          font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%;
          letter-spacing: -0.04em; font-size: 32px;
          color: var(--accent);
        }
      `}</style>

      <div className="bdb-head">
        <div className="bdb-tag">{bim + 1}º</div>
        <div>
          <h3>{BIMESTRES[bim]} bimestre</h3>
          <div className="muted f-mono" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>peso · 25 do ano</div>
        </div>
        <div className="av">
          <div className="lbl">Média do bimestre</div>
          <div className="v">{avg == null ? "—" : avg.toFixed(2)}</div>
        </div>
      </div>

      <div className="bdb-cards">
        {CAT_DEF.map(cat => {
          const acts = bimData[cat.key];
          const a = catAverage(acts);
          return (
            <div className="bdb-cat" key={cat.key}>
              <div className="bdb-cat-head">
                <div>
                  <div className="nm" style={{ color: cat.ink }}>{cat.label}</div>
                  <div className="pesoinfo">peso na média · {cat.peso} · {acts.length} ativ</div>
                </div>
                <div className="av" style={{ color: cat.ink }}>{a == null ? "—" : a.toFixed(2)}</div>
              </div>

              {acts.length > 0 ? (
                <div className="bdb-table">
                  <span className="h">Nome</span>
                  <span className="h">Conteúdo</span>
                  <span className="h">Data</span>
                  <span className="h right">Nota</span>
                  <span className="h right">Máx</span>
                  <span className="h right">Norm</span>
                  <span className="h"></span>
                  {acts.map(act => (
                    <React.Fragment key={act.id}>
                      <span className="c">{act.nome}</span>
                      <span className="c" style={{ color: "var(--ink-mute)" }}>{act.desc || "—"}</span>
                      <span className="c" style={{ color: "var(--ink-mute)" }}>{act.data || "—"}</span>
                      <span className="c right nota">{act.nota}</span>
                      <span className="c right" style={{ color: "var(--ink-mute)" }}>{act.max}</span>
                      <span className="c right norm">{((act.nota/act.max)*10).toFixed(1)}</span>
                      <span className="c tools">
                        <button onClick={() => onEdit(cat.key, act)}><Icon name="edit" size={11}/></button>
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="empty-msg">Nenhuma atividade ainda</div>
              )}

              <button className="bdb-add" style={{ marginTop: 12 }} onClick={() => onAdd(cat.key)}>
                + Adicionar {cat.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bdb-formula">
        <div className="form-text">
          M<sub style={{ fontSize: 9 }}>{bim+1}º</sub> = ( {CAT_DEF.map((c, i) => {
            const v = catAverage(bimData[c.key]);
            return <React.Fragment key={c.key}>{i > 0 && " + "}<b>{v == null ? "—" : v.toFixed(2)}</b> × {c.peso}</React.Fragment>;
          })} ) ÷ {CAT_DEF.reduce((a,c)=>a+c.peso,0)}
        </div>
        <div className="result">= {avg == null ? "—" : avg.toFixed(2)}</div>
      </div>
    </div>
  );
}

/* ───────── DESEMPENHO ───────── */
function BoletimDesempenho({ data, discList }) {
  // Build avg series across bims for each disc
  const series = discList.map(disc => {
    const d = data[disc];
    const bims = [0,1,2,3].map(b => bimAverage(d.bims[b]));
    return { disc, bims };
  });

  // Overall per bimestre
  const overall = [0,1,2,3].map(b => {
    const xs = series.map(s => s.bims[b]).filter(v => v != null);
    return xs.length ? xs.reduce((a,c)=>a+c,0)/xs.length : null;
  });

  const sortByGrade = [...series].map(s => ({
    ...s,
    final: (() => {
      const xs = s.bims.filter(v => v != null);
      return xs.length ? xs.reduce((a,c)=>a+c,0)/xs.length : null;
    })()
  })).sort((a,b) => (b.final ?? 0) - (a.final ?? 0));

  return (
    <React.Fragment>
      <div className="rule-h" style={{ margin: "0 0 14px" }}>
        <span className="lbl">Evolução da média geral · por bimestre</span>
      </div>

      <div className="card card-pad" style={{ marginBottom: 22 }}>
        <BoletimLine bims={overall} />
      </div>

      <div className="rule-h" style={{ margin: "22px 0 14px" }}>
        <span className="lbl">Ranking de disciplinas · média final</span>
        <span className="lbl muted">do maior pro menor</span>
      </div>

      <div className="card card-pad">
        {sortByGrade.map((s, i) => (
          <div key={s.disc} style={{
            display: "grid",
            gridTemplateColumns: "44px 1.4fr 1fr 70px",
            gap: 16, alignItems: "center",
            padding: "14px 0", borderTop: i === 0 ? "0" : "1.5px dashed var(--rule)"
          }}>
            <div className="f-mono" style={{ fontSize: 18, color: "var(--ink-mute)", fontWeight: 700, letterSpacing: "0.02em" }}>
              #{String(i+1).padStart(2,"0")}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontFamily: "Bricolage Grotesque", fontSize: 18, letterSpacing: "-0.02em" }}>{s.disc}</div>
              <div className="muted f-mono" style={{ fontSize: 11, marginTop: 2 }}>
                {s.bims.map((b, idx) => `${idx+1}º ${b == null ? "—" : b.toFixed(1)}`).join("  ·  ")}
              </div>
            </div>
            <div className="progress" style={{ height: 12 }}>
              <i style={{ width: `${((s.final ?? 0)/10)*100}%` }} />
            </div>
            <div style={{ textAlign: "right", fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", color: s.final == null ? "var(--ink-mute)" : s.final >= 7 ? "var(--primary)" : "var(--err)" }}>
              {s.final == null ? "—" : s.final.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      <div className="rule-h" style={{ margin: "22px 0 14px" }}>
        <span className="lbl">Distribuição das médias por bimestre</span>
      </div>

      <div className="card card-pad">
        <BoletimHeatmap series={series} />
      </div>
    </React.Fragment>
  );
}

function BoletimLine({ bims }) {
  const w = 760, h = 220, pad = { l: 36, r: 16, t: 12, b: 32 };
  const x = (i) => pad.l + (i / (bims.length - 1)) * (w - pad.l - pad.r);
  const y = (n) => h - pad.b - ((n ?? 0) / 10) * (h - pad.t - pad.b);

  const pathPts = bims.map((b, i) => ({ x: x(i), y: y(b ?? 0), v: b }));
  const path = pathPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", minWidth: 500 }}>
        {[0,2.5,5,7.5,10].map(t => (
          <g key={t}>
            <line x1={pad.l} y1={y(t)} x2={w-pad.r} y2={y(t)} stroke="var(--rule)" strokeWidth="1" strokeDasharray={t === 7 ? "0" : "2 4"} />
            <text x={pad.l - 6} y={y(t) + 4} fontFamily="JetBrains Mono" fontSize="10" fill="var(--ink-mute)" textAnchor="end">{t}</text>
          </g>
        ))}
        <line x1={pad.l} y1={y(7)} x2={w-pad.r} y2={y(7)} stroke="var(--accent-2)" strokeWidth="1" strokeDasharray="4 4" />
        <text x={w-pad.r-2} y={y(7)-4} fontFamily="JetBrains Mono" fontSize="10" fill="var(--accent-2)" textAnchor="end">7 · aprovação</text>
        <path d={path} stroke="var(--primary)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pathPts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="7" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y} r="3" fill="var(--primary)" />
            <text x={p.x} y={h - pad.b + 18} fontFamily="JetBrains Mono" fontWeight="600" fontSize="10" fill="var(--ink-mute)" textAnchor="middle">{i+1}º BIM</text>
            <text x={p.x} y={p.y - 12} fontFamily="Bricolage Grotesque" fontWeight="700" fontSize="14" fill="var(--ink)" textAnchor="middle">{p.v == null ? "" : p.v.toFixed(1)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function BoletimHeatmap({ series }) {
  const colorFor = (v) => {
    if (v == null) return "var(--rule-soft)";
    if (v >= 9)   return "oklch(0.55 0.18 148)";
    if (v >= 7.5) return "oklch(0.65 0.18 148)";
    if (v >= 7)   return "oklch(0.75 0.18 100)";
    if (v >= 5)   return "oklch(0.78 0.16 60)";
    return "oklch(0.62 0.22 25)";
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px repeat(4, 1fr)", gap: 6, alignItems: "center" }}>
      <span></span>
      {BIMESTRES.map(b => (
        <span key={b} className="f-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, textAlign: "center" }}>{b} bim</span>
      ))}
      {series.map(s => (
        <React.Fragment key={s.disc}>
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{s.disc}</span>
          {s.bims.map((v, b) => (
            <div key={b} style={{
              height: 38,
              borderRadius: 8,
              background: colorFor(v),
              display: "grid", placeItems: "center",
              fontFamily: "Bricolage Grotesque", fontWeight: 700,
              color: v == null ? "var(--ink-mute)" : "white",
              fontSize: 15, letterSpacing: "-0.02em",
              border: "1px solid var(--rule)"
            }}>
              {v == null ? "—" : v.toFixed(1)}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

window.BoletimScreen = BoletimScreen;
