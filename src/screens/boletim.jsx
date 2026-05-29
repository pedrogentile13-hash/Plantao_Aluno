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

// Mapeia type da tabela para chave de categoria
const TYPE_TO_CAT = {
  prova_bimestral: "PB",
  qualitativa:     "Q",
  va:              "VA",
};

// Transform flat boletim_atividades_rows into the rich structure used pela UI
const buildBoletimFromAtividades = (rows) => {
  const base = {};
  BOLETIM.forEach(row => {
    base[row.disc] = { prof: row.prof, bims: { 0: {PB:[],Q:[],VA:[]}, 1: {PB:[],Q:[],VA:[]}, 2: {PB:[],Q:[],VA:[]}, 3: {PB:[],Q:[],VA:[]} } };
  });

  rows.forEach(row => {
    const disc = row.subject;
    const bi   = (row.bimestre ?? 1) - 1;
    const cat  = TYPE_TO_CAT[row.type] || "VA";

    if (!base[disc]) {
      base[disc] = { prof: "—", bims: { 0: {PB:[],Q:[],VA:[]}, 1: {PB:[],Q:[],VA:[]}, 2: {PB:[],Q:[],VA:[]}, 3: {PB:[],Q:[],VA:[]} } };
    }

    base[disc].bims[bi][cat].push({
      id:   row.id,
      nome: row.name,
      desc: row.description || "",
      nota: Number(row.nota),
      max:  Number(row.nota_maxima) || 10,
      peso: Number(row.peso) || 1,
      data: row.date || row.created_at?.slice(0, 10) || "—",
    });
  });

  return base;
};

function BoletimScreen({ onNav, isMobile, userId }) {
  const [tab, setTab] = React.useState("geral");   // geral | detalhado | stats | desempenho
  const [year, setYear] = React.useState("2026");

  const atividades = useAtividades(userId, year);
  const [data, setData] = React.useState(() => seedBoletim());

  React.useEffect(() => {
    if (atividades && atividades.length > 0) {
      setData(buildBoletimFromAtividades(atividades));
    }
  }, [atividades]);

  const [openDisc, setOpenDisc] = React.useState(null);
  const [selectedDisc, setSelectedDisc] = React.useState(() => Object.keys(seedBoletim()).sort()[0]);
  const [actModal, setActModal] = React.useState(null);

  const allBimAvgs = Object.values(data).flatMap(d => [0,1,2,3].map(b => bimAverage(d.bims[b])).filter(v => v != null));
  const mediaGeral = allBimAvgs.length ? allBimAvgs.reduce((a,b)=>a+b,0) / allBimAvgs.length : 0;
  const maior = allBimAvgs.length ? Math.max(...allBimAvgs) : 0;
  const menor = allBimAvgs.length ? Math.min(...allBimAvgs) : 0;
  const aprovado = mediaGeral >= 7;
  const discList = Object.keys(data).sort();

  // Raw normalized grades (nota/max * 10) for all activities
  const allActs = React.useMemo(() => {
    if (!atividades) return [];
    return atividades.map(a => ({
      ...a,
      norm: ((Number(a.nota) / (Number(a.nota_maxima) || 10)) * 10),
    }));
  }, [atividades]);

  const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const addActivity = async ({ disc, bim, cat, activity }) => {
    try {
      let finalId = activity.id;
      if (activity.id && isUUID(activity.id)) {
        await updateAtividade(activity.id, activity);
      } else {
        const saved = await saveAtividade(userId, { subject: disc, bimestre: bim + 1, cat, ...activity });
        finalId = saved.id;
      }
      setData(prev => {
        const next = { ...prev };
        const arr = next[disc].bims[bim][cat].slice();
        if (activity.id && arr.find(a => a.id === activity.id)) {
          arr[arr.findIndex(a => a.id === activity.id)] = { ...activity, id: finalId };
        } else {
          arr.push({ ...activity, id: finalId });
        }
        next[disc] = { ...next[disc], bims: { ...next[disc].bims, [bim]: { ...next[disc].bims[bim], [cat]: arr } } };
        return next;
      });
    } catch (err) {
      alert("Erro ao salvar atividade: " + err.message);
    }
  };

  const removeActivity = async ({ disc, bim, cat, id }) => {
    try {
      if (isUUID(id)) await deleteAtividade(id);
      setData(prev => {
        const next = { ...prev };
        const arr = next[disc].bims[bim][cat].filter(a => a.id !== id);
        next[disc] = { ...next[disc], bims: { ...next[disc].bims, [bim]: { ...next[disc].bims[bim], [cat]: arr } } };
        return next;
      });
    } catch (err) {
      alert("Erro ao remover atividade: " + err.message);
    }
  };

  return (
    <div className="main-pad anim-fade">
      <PageHead
        eyebrow="04 · Boletim"
        title="Boletim"
        titleEm={tab === "geral" ? "geral" : tab === "detalhado" ? "detalhado" : tab === "stats" ? "em números" : "em gráficos"}
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
            <Icon name="doc" size={14}/> Geral
          </button>
          <button className={tab === "detalhado" ? "on" : ""} onClick={() => setTab("detalhado")}>
            <Icon name="search" size={14}/> Detalhado
          </button>
          <button className={tab === "stats" ? "on" : ""} onClick={() => setTab("stats")}>
            <Icon name="chart" size={14}/> Estatísticas
          </button>
          <button className={tab === "desempenho" ? "on" : ""} onClick={() => setTab("desempenho")}>
            <Icon name="trophy" size={14}/> Evolução
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

      {tab === "stats" && (
        <BoletimEstatisticas data={data} discList={discList} allActs={allActs} />
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

/* ───────── ESTATÍSTICAS ───────── */
function BoletimEstatisticas({ data, discList, allActs }) {
  const total = allActs.length;
  const norms = allActs.map(a => a.norm);
  const avgNorm = norms.length ? norms.reduce((a, b) => a + b, 0) / norms.length : 0;
  const best  = total ? allActs.reduce((b, a) => a.norm > b.norm ? a : b) : null;
  const worst = total ? allActs.reduce((b, a) => a.norm < b.norm ? a : b) : null;
  const approved   = allActs.filter(a => a.norm >= 7).length;
  const pctApproved = total ? (approved / total * 100) : 0;

  const CAT_TYPE = { PB: "prova_bimestral", Q: "qualitativa", VA: "va" };
  const catStats = CAT_DEF.map(cat => {
    const acts = allActs.filter(a => a.type === CAT_TYPE[cat.key]);
    const ns = acts.map(a => a.norm);
    const avg = ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null;
    return { ...cat, count: acts.length, avg, max: ns.length ? Math.max(...ns) : null, min: ns.length ? Math.min(...ns) : null };
  });

  const BUCKETS = [
    { label: "0–2",  color: "oklch(0.58 0.22 25)",  range: [0, 2] },
    { label: "2–4",  color: "oklch(0.64 0.18 25)",  range: [2, 4] },
    { label: "4–6",  color: "oklch(0.70 0.14 50)",  range: [4, 6] },
    { label: "6–7",  color: "oklch(0.76 0.14 60)",  range: [6, 7] },
    { label: "7–8",  color: "oklch(0.76 0.14 100)", range: [7, 8] },
    { label: "8–9",  color: "oklch(0.66 0.18 148)", range: [8, 9] },
    { label: "9–10", color: "oklch(0.52 0.20 148)", range: [9, 10.01] },
  ];
  const bucketCounts = BUCKETS.map(b => ({
    ...b,
    count: allActs.filter(a => a.norm >= b.range[0] && a.norm < b.range[1]).length,
  }));
  const maxB = Math.max(...bucketCounts.map(b => b.count), 1);

  const subjRanking = discList.map(disc => {
    const d = data[disc];
    const bims = [0,1,2,3].map(b => bimAverage(d.bims[b]));
    const finals = bims.filter(v => v != null);
    const final = finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : null;
    return { disc, bims, final };
  }).sort((a, b) => (b.final ?? -1) - (a.final ?? -1));

  const riskSubjs = subjRanking.filter(s => s.final != null && s.final < 7);

  const sorted = [...allActs].sort((a, b) => b.norm - a.norm);
  const top5 = sorted.slice(0, 5);
  const bot5 = sorted.slice(-5).reverse();

  const [logFilter, setLogFilter] = React.useState("all");
  const logActs = logFilter === "ok" ? sorted.filter(a => a.norm >= 7) : logFilter === "bad" ? sorted.filter(a => a.norm < 7) : sorted;

  if (total === 0) {
    return (
      <div className="card card-pad" style={{ textAlign: "center", padding: 60, color: "var(--ink-mute)" }}>
        <div style={{ fontFamily: "Bricolage Grotesque", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sem dados ainda</div>
        <div style={{ fontSize: 14 }}>Adicione atividades no boletim para ver estatísticas detalhadas.</div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <style>{`
        .est-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .is-mobile .est-stat-grid { grid-template-columns: repeat(2, 1fr); }
        .est-card { background: var(--paper); border: 1.5px solid var(--ink); border-radius: var(--r-3); box-shadow: 3px 3px 0 var(--ink); padding: 16px 18px; }
        .est-card .ec-lbl { font: 700 10px/1 "JetBrains Mono", monospace; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-mute); margin-bottom: 8px; }
        .est-card .ec-val { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; letter-spacing: -0.04em; font-size: 30px; line-height: 1; }
        .est-card .ec-sub { font: 600 11px/1.4 "JetBrains Mono", monospace; color: var(--ink-soft); margin-top: 6px; }

        .histo-wrap { display: flex; align-items: flex-end; gap: 8px; height: 130px; padding-bottom: 28px; position: relative; }
        .histo-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
        .histo-bar { width: 100%; border-radius: 6px 6px 0 0; min-height: 4px; }
        .histo-lbl { font: 700 9.5px/1 "JetBrains Mono", monospace; color: var(--ink-mute); white-space: nowrap; }
        .histo-cnt { font: 700 11px/1 "JetBrains Mono", monospace; color: var(--ink); }

        .cat3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .is-mobile .cat3 { grid-template-columns: 1fr; }

        .rank-item { display: grid; grid-template-columns: 40px 1.6fr 1fr 64px; gap: 12px; align-items: center; padding: 12px 0; }
        .rank-item:not(:first-child) { border-top: 1.5px dashed var(--rule); }

        .top-act { display: flex; align-items: center; gap: 10px; padding: 10px 0; }
        .top-act:not(:first-child) { border-top: 1.5px dashed var(--rule); }
        .n-badge { display: inline-block; padding: 3px 9px; border-radius: 999px; font: 700 12px/1 "JetBrains Mono", monospace; }
        .n-ok  { background: oklch(0.92 0.12 148); color: oklch(0.28 0.14 148); }
        .n-warn { background: oklch(0.94 0.12 60); color: oklch(0.34 0.12 60); }
        .n-bad { background: oklch(0.95 0.10 25); color: oklch(0.40 0.20 25); }

        .risk-row { border: 2px solid var(--err); border-radius: var(--r-3); padding: 16px 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; background: oklch(0.97 0.015 25); }
        .risk-nm { font-family: "Bricolage Grotesque"; font-weight: 700; font-size: 19px; color: var(--err); }
        .risk-info { font: 13px/1.6 "JetBrains Mono", monospace; color: var(--ink-soft); }
        .needed { padding: 6px 12px; background: var(--err); color: white; border-radius: 999px; font: 700 13px/1 "JetBrains Mono", monospace; white-space: nowrap; }

        .log-table { width: 100%; border-collapse: collapse; font: 12.5px/1.4 "JetBrains Mono", monospace; }
        .log-table th { font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-mute); font-weight: 700; padding: 8px 12px; text-align: left; border-bottom: 1.5px solid var(--rule); position: sticky; top: 0; background: var(--paper); }
        .log-table td { padding: 9px 12px; border-bottom: 1px solid var(--rule-soft); vertical-align: middle; }
        .log-table tr:hover td { background: var(--accent); color: var(--accent-ink); }
      `}</style>

      {/* ── Bloco 1: Cards resumo ampliado ── */}
      <div className="rule-h" style={{ margin: "0 0 12px" }}>
        <span className="lbl">Visão geral · todas as atividades</span>
        <span className="lbl muted">{total} registros</span>
      </div>
      <div className="est-stat-grid">
        <div className="est-card">
          <div className="ec-lbl">Total de atividades</div>
          <div className="ec-val">{total}</div>
          <div className="ec-sub">{discList.length} disciplinas</div>
        </div>
        <div className="est-card" style={{ background: pctApproved >= 70 ? "oklch(0.50 0.18 148)" : "var(--err)", borderColor: "var(--ink)", color: "white" }}>
          <div className="ec-lbl" style={{ color: "rgba(255,255,255,0.65)" }}>Atividades aprovadas</div>
          <div className="ec-val">{pctApproved.toFixed(0)}%</div>
          <div className="ec-sub" style={{ color: "rgba(255,255,255,0.65)" }}>{approved} de {total}</div>
        </div>
        <div className="est-card">
          <div className="ec-lbl">Média geral (norm)</div>
          <div className="ec-val" style={{ color: avgNorm >= 7 ? "var(--primary)" : "var(--err)" }}>{avgNorm.toFixed(2)}</div>
          <div className="ec-sub">de todas as notas normalizadas</div>
        </div>
        <div className="est-card">
          <div className="ec-lbl">Disciplinas em risco</div>
          <div className="ec-val" style={{ color: riskSubjs.length ? "var(--err)" : "var(--ok)" }}>{riskSubjs.length}</div>
          <div className="ec-sub">de {discList.length} · abaixo de 7,0</div>
        </div>
      </div>
      <div className="est-stat-grid" style={{ marginBottom: 24 }}>
        {best && (
          <div className="est-card" style={{ borderLeftColor: "var(--ok)", borderLeftWidth: 4 }}>
            <div className="ec-lbl">Melhor atividade</div>
            <div className="ec-val" style={{ color: "var(--ok)", fontSize: 26 }}>{best.norm.toFixed(1)}</div>
            <div className="ec-sub" style={{ fontWeight: 700, color: "var(--ink)" }}>{best.name}</div>
            <div style={{ marginTop: 4, fontSize: 10, color: "var(--ink-mute)", fontFamily: "JetBrains Mono" }}>{best.subject} · {best.bimestre}º bim</div>
          </div>
        )}
        {worst && (
          <div className="est-card" style={{ borderLeftColor: "var(--err)", borderLeftWidth: 4 }}>
            <div className="ec-lbl">Pior atividade</div>
            <div className="ec-val" style={{ color: "var(--err)", fontSize: 26 }}>{worst.norm.toFixed(1)}</div>
            <div className="ec-sub" style={{ fontWeight: 700, color: "var(--ink)" }}>{worst.name}</div>
            <div style={{ marginTop: 4, fontSize: 10, color: "var(--ink-mute)", fontFamily: "JetBrains Mono" }}>{worst.subject} · {worst.bimestre}º bim</div>
          </div>
        )}
        {catStats.map(c => (
          <div className="est-card" key={c.key} style={{ borderLeftColor: c.color, borderLeftWidth: 4 }}>
            <div className="ec-lbl">{c.label}</div>
            <div className="ec-val" style={{ color: c.ink, fontSize: 26 }}>{c.avg == null ? "—" : c.avg.toFixed(2)}</div>
            <div className="ec-sub">{c.count} atividades · peso {c.peso}%</div>
          </div>
        ))}
      </div>

      {/* ── Bloco 2: Histograma ── */}
      <div className="rule-h" style={{ margin: "0 0 14px" }}>
        <span className="lbl">Distribuição das notas normalizadas</span>
        <span className="lbl muted">escala 0–10</span>
      </div>
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div className="histo-wrap">
          {bucketCounts.map(b => (
            <div key={b.label} className="histo-col">
              <div className="histo-cnt">{b.count > 0 ? b.count : ""}</div>
              <div className="histo-bar" style={{ height: `${(b.count / maxB) * 85}%`, background: b.color }} />
              <div className="histo-lbl">{b.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--rule)" }}>
          {BUCKETS.map(b => (
            <span key={b.label} style={{ display: "flex", alignItems: "center", gap: 5, font: "600 10.5px/1 JetBrains Mono", color: "var(--ink-soft)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, display: "inline-block" }} /> {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Bloco 3: Por categoria ── */}
      <div className="rule-h" style={{ margin: "0 0 14px" }}>
        <span className="lbl">Desempenho por categoria</span>
      </div>
      <div className="cat3">
        {catStats.map(c => (
          <div className="card card-pad" key={c.key} style={{ borderLeft: `4px solid ${c.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 19, color: c.ink }}>{c.label}</div>
                <div className="f-mono muted" style={{ fontSize: 10, textTransform: "uppercase", marginTop: 3 }}>Peso {c.peso}%</div>
              </div>
              <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 34, color: c.ink, lineHeight: 1, letterSpacing: "-0.03em" }}>
                {c.avg == null ? "—" : c.avg.toFixed(1)}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, textAlign: "center", marginBottom: 12 }}>
              {[
                { lbl: "Atividades", val: c.count, clr: "var(--ink)", bg: "var(--bg)" },
                { lbl: "Máx", val: c.max == null ? "—" : c.max.toFixed(1), clr: "oklch(0.28 0.14 148)", bg: "oklch(0.92 0.10 148)" },
                { lbl: "Mín", val: c.min == null ? "—" : c.min.toFixed(1), clr: "oklch(0.40 0.20 25)", bg: "oklch(0.95 0.06 25)" },
              ].map(item => (
                <div key={item.lbl} style={{ background: item.bg, borderRadius: 8, padding: "8px 4px" }}>
                  <div className="f-mono" style={{ fontSize: 9, color: item.clr, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.lbl}</div>
                  <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 20, color: item.clr }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 8, background: "var(--rule-soft)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((c.avg ?? 0) / 10) * 100}%`, background: c.color, borderRadius: 999, transition: "width .4s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Bloco 4: Ranking de disciplinas ── */}
      <div className="rule-h" style={{ margin: "0 0 14px" }}>
        <span className="lbl">Ranking de disciplinas</span>
        <span className="lbl muted">média final · maior → menor</span>
      </div>
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        {subjRanking.map((s, i) => (
          <div key={s.disc} className="rank-item">
            <div className="f-mono" style={{ fontSize: 15, fontWeight: 700, color: i === 0 ? "var(--primary)" : i < 3 ? "var(--ink-soft)" : "var(--ink-mute)" }}>
              #{String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontFamily: "Bricolage Grotesque", fontSize: 16, letterSpacing: "-0.02em" }}>{s.disc}</div>
              <div className="muted f-mono" style={{ fontSize: 10, marginTop: 2, letterSpacing: "0.02em" }}>
                {s.bims.map((b, idx) => `${idx+1}º ${b == null ? "—" : b.toFixed(1)}`).join("  ·  ")}
              </div>
            </div>
            <div>
              <div style={{ height: 10, background: "var(--rule-soft)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${((s.final ?? 0) / 10) * 100}%`,
                  background: s.final == null ? "var(--rule-soft)" : s.final >= 7 ? "var(--primary)" : "var(--err)",
                  borderRadius: 999, transition: "width .4s ease",
                }} />
              </div>
            </div>
            <div style={{ textAlign: "right", fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: s.final == null ? "var(--ink-mute)" : s.final >= 7 ? "var(--primary)" : "var(--err)" }}>
              {s.final == null ? "—" : s.final.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bloco 5: Top 5 / Bottom 5 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div>
          <div className="rule-h" style={{ margin: "0 0 12px" }}>
            <span className="lbl">Top 5 atividades</span>
          </div>
          <div className="card card-pad">
            {top5.map((a, i) => (
              <div key={a.id} className="top-act">
                <div className="f-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--ok)", minWidth: 22 }}>#{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <div className="muted f-mono" style={{ fontSize: 10, marginTop: 2 }}>{a.subject} · {a.bimestre}º bim · {TYPE_TO_CAT[a.type] || a.type}</div>
                </div>
                <span className="n-badge n-ok">{a.norm.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="rule-h" style={{ margin: "0 0 12px" }}>
            <span className="lbl">Bottom 5 atividades</span>
          </div>
          <div className="card card-pad">
            {bot5.map((a, i) => (
              <div key={a.id} className="top-act">
                <div className="f-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--err)", minWidth: 22 }}>#{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <div className="muted f-mono" style={{ fontSize: 10, marginTop: 2 }}>{a.subject} · {a.bimestre}º bim · {TYPE_TO_CAT[a.type] || a.type}</div>
                </div>
                <span className={"n-badge " + (a.norm >= 7 ? "n-ok" : a.norm >= 5 ? "n-warn" : "n-bad")}>{a.norm.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bloco 6: Análise de risco ── */}
      {riskSubjs.length > 0 && (
        <React.Fragment>
          <div className="rule-h" style={{ margin: "0 0 14px" }}>
            <span className="lbl" style={{ color: "var(--err)" }}>Alerta · matérias em risco de reprovação</span>
            <span className="lbl muted">{riskSubjs.length} disciplina{riskSubjs.length !== 1 ? "s" : ""} abaixo de 7</span>
          </div>
          <div style={{ marginBottom: 24 }}>
            {riskSubjs.map(s => {
              const filledBims = s.bims.filter(b => b != null);
              const currentSum = filledBims.reduce((a, b) => a + b, 0);
              const remaining = 4 - filledBims.length;
              const needed = remaining > 0 ? Math.min(10, (7 * 4 - currentSum) / remaining) : null;
              return (
                <div key={s.disc} className="risk-row">
                  <div>
                    <div className="risk-nm">{s.disc}</div>
                    <div className="risk-info">
                      Média atual: <b>{(s.final ?? 0).toFixed(2)}</b>
                      {" · "}Déficit: <b>{(7 - (s.final ?? 0)).toFixed(2)} pts</b>
                      {" · "}{remaining} bimestre{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {needed != null ? (
                    <div style={{ textAlign: "right" }}>
                      <div className="f-mono" style={{ fontSize: 9, color: "var(--ink-mute)", textTransform: "uppercase", marginBottom: 5 }}>Mínimo por bimestre</div>
                      <span className="needed">{needed.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="needed" style={{ background: "oklch(0.42 0.22 25)" }}>Sem recuperação possível</span>
                  )}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      )}

      {/* ── Bloco 7: Log completo ── */}
      <div className="rule-h" style={{ margin: "0 0 12px" }}>
        <span className="lbl">Log completo de atividades</span>
        <span className="lbl muted">{logActs.length} de {total}</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {[["all", `Todas (${total})`], ["ok", `Aprovadas (${allActs.filter(a=>a.norm>=7).length})`], ["bad", `Abaixo de 7 (${allActs.filter(a=>a.norm<7).length})`]].map(([v, l]) => (
          <button key={v} className={"btn " + (logFilter === v ? "btn-primary" : "btn-ghost")} style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setLogFilter(v)}>{l}</button>
        ))}
      </div>
      <div className="card" style={{ overflow: "auto", marginBottom: 28, maxHeight: 480 }}>
        <table className="log-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Disciplina</th>
              <th>Bim</th>
              <th>Tipo</th>
              <th>Nota</th>
              <th>Máx</th>
              <th>Norm</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {logActs.map((a, i) => (
              <tr key={a.id}>
                <td style={{ color: "var(--ink-mute)" }}>{i + 1}</td>
                <td style={{ fontWeight: 700 }}>{a.name}</td>
                <td style={{ color: "var(--ink-soft)" }}>{a.subject}</td>
                <td style={{ textAlign: "center" }}>{a.bimestre}º</td>
                <td>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "var(--rule-soft)" }}>
                    {TYPE_TO_CAT[a.type] || a.type}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>{a.nota}</td>
                <td style={{ color: "var(--ink-mute)" }}>{a.nota_maxima}</td>
                <td>
                  <span className={"n-badge " + (a.norm >= 7 ? "n-ok" : a.norm >= 5 ? "n-warn" : "n-bad")}>
                    {a.norm.toFixed(1)}
                  </span>
                </td>
                <td style={{ color: "var(--ink-mute)", fontSize: 11 }}>{a.date || a.created_at?.slice(0, 10) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
}

window.BoletimScreen = BoletimScreen;
