function AdminScreen({ onNav, isMobile, userId, profile }) {
  // ⚠️ Bloqueia acesso se não for admin
  if (!userId || !profile || profile.is_admin !== true) {
    return (
      <div className="main-pad anim-fade" style={{ display: 'grid', placeItems: 'center', minHeight: '100%' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            fontFamily: 'Bricolage Grotesque',
            fontWeight: 700,
            fontSize: 48,
            letterSpacing: '-0.04em',
            color: 'var(--ink-mute)',
            marginBottom: 16
          }}>
            🔐
          </div>
          <h2 style={{
            fontFamily: 'Bricolage Grotesque',
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: '-0.02em',
            margin: '0 0 8px'
          }}>
            Acesso Negado
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.5, margin: '0 0 20px' }}>
            Você precisa ser admin para acessar este painel.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => onNav('dashboard')}
            style={{ alignSelf: 'center' }}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [subj, setSubj] = React.useState("port");
  const [bim, setBim] = React.useState("1º");
  const [tab, setTab] = React.useState("resumo"); // resumo | simulado | questoes | modulos
  const [formula, setFormula] = React.useState("5F+5M+5D");
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [body, setBody] = React.useState("# Título\n## Subtítulo\n\n**Negrito**, *itálico*\n\n- Item 1\n- Item 2");
  const [importText, setImportText] = React.useState("");
  const [parsedQuestoes, setParsedQuestoes] = React.useState(null);
  const [importStatus, setImportStatus] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  const bimNum = parseInt(bim) || 1;

  const parseQuestoesText = (text) => {
    const blocks = text.trim().split(/\n\s*\n/).filter(b => b.trim());
    const result = [];
    for (const block of blocks) {
      const lines = block.trim().split("\n").map(l => l.trim()).filter(Boolean);
      if (!lines.length) continue;
      const difMatch = lines[0].match(/^\[([FMD])\]\s*(.+)/i);
      if (!difMatch) continue;
      const dif = difMatch[1].toUpperCase();
      const enunciado = difMatch[2].trim();
      const opcoes = [];
      let correta = "a";
      for (const line of lines.slice(1)) {
        const altMatch = line.match(/^([A-D])\)\s*(.+)/i);
        if (altMatch) opcoes.push({ id: altMatch[1].toLowerCase(), text: altMatch[2].trim() });
        const rMatch = line.match(/^R:\s*([A-D])/i);
        if (rMatch) correta = rMatch[1].toLowerCase();
      }
      if (opcoes.length >= 2) {
        result.push({ enunciado, opcoes, resposta_correta: correta, dificuldade: { F: 1, M: 2, D: 3 }[dif] || 1 });
      }
    }
    return result;
  };

  const handleParseImport = () => {
    const q = parseQuestoesText(importText);
    setParsedQuestoes(q);
    setImportStatus(q.length > 0 ? `${q.length} questão(ões) detectada(s). Confirme para salvar.` : "Nenhuma questão válida encontrada.");
  };

  const handleSaveQuestoes = async () => {
    if (!parsedQuestoes || parsedQuestoes.length === 0) return;
    setImportStatus("Salvando...");
    try {
      const count = await importQuestoesDB(parsedQuestoes, subj, bimNum);
      setImportStatus(`✅ ${count} questão(ões) importada(s) com sucesso!`);
      setImportText("");
      setParsedQuestoes(null);
    } catch (err) {
      setImportStatus("Erro: " + err.message);
    }
  };

  const handleDeleteAllQuestoes = async () => {
    if (!confirm(`Apagar TODAS as questões de ${SUBJECTS.find(s => s.id === subj)?.name} · ${bim} bimestre?`)) return;
    try {
      await deleteQuestoesDB(subj, bimNum);
      setImportStatus("✅ Questões apagadas.");
      setParsedQuestoes(null);
    } catch (err) {
      setImportStatus("Erro: " + err.message);
    }
  };

  // Resumo PDF upload
  const handleResumoPDF = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !title.trim()) { alert("Preencha o título primeiro."); e.target.value = ""; return; }
    setUploading(true);
    try {
      const pdfUrl = await uploadResumoPDF(file, subj, bimNum);
      await saveResumoDB({ subjectSlug: subj, bimestre: bimNum, title, description: desc, pdfUrl, userId });
      setTitle(""); setDesc("");
      alert(`✅ PDF "${file.name}" salvo com sucesso!`);
    } catch (err) {
      alert("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // parse formula
  const parsed = (() => {
    const m = formula.match(/(\d+)F\+(\d+)M\+(\d+)D/);
    if (!m) return null;
    const [_, f, mm, d] = m.map(Number);
    return { f: Number(f), m: Number(mm), d: Number(d), total: Number(f) + Number(mm) + Number(d), pts: Number(f) * 1 + Number(mm) * 2 + Number(d) * 3 };
  })();

  const presets = [
    { name: "Padrão", f: "5F+5M+5D" },
    { name: "Leve", f: "10F+5M+5D" },
    { name: "Difícil", f: "5F+5M+10D" },
    { name: "Completo", f: "10F+10M+10D" },
    { name: "Fáceis", f: "10F+0M+0D" },
  ];

  return (
    <div className="main-pad anim-fade">
      <PageHead
        eyebrow="ADMIN · Gestão"
        title="Painel"
        titleEm="admin."
        meta={<>Logado como <b>Pedro Gentile</b><br/>Permissão <b style={{ color: "var(--primary)" }}>ADMIN</b></>}
      />

      <style>{`
        .ad-grid { display: grid; grid-template-columns: 280px 1fr; gap: 22px; }
        .is-mobile .ad-grid { grid-template-columns: 1fr; }
        .ad-side { display: flex; flex-direction: column; gap: 14px; }
        .ad-side .card-pad { padding: 18px; }

        .ad-pick {
          display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
          margin-top: 8px;
        }
        .ad-pick button {
          background: var(--bg);
          border: 1px solid var(--rule);
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          font: 500 12.5px/1 inherit;
          text-align: left;
          display: flex; align-items: center; gap: 8px;
        }
        .ad-pick button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
        .ad-pick button .gl {
          width: 18px; height: 18px;
          border-radius: 5px;
          display: grid; place-items: center;
          color: white;
          font: 700 11px/1 "Bricolage Grotesque";
        }

        .ad-main { display: flex; flex-direction: column; gap: 22px; }
        .ad-tabs { display: flex; gap: 4px; padding: 4px; background: var(--rule-soft); border-radius: 999px; width: fit-content; }
        .ad-tabs button { background: transparent; border: 0; cursor: pointer; padding: 9px 16px; border-radius: 999px; font: 500 12.5px/1 "JetBrains Mono", monospace; letter-spacing: 0.04em; color: var(--ink-soft); }
        .ad-tabs button.on { background: var(--ink); color: var(--paper); }

        .preset-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .preset-row button {
          padding: 7px 12px;
          border-radius: 999px;
          background: var(--rule-soft);
          border: 1px solid transparent;
          cursor: pointer;
          font: 500 12px/1 "JetBrains Mono", monospace;
          color: var(--ink-soft);
        }
        .preset-row button.on { border-color: var(--ink); color: var(--ink); background: var(--paper); }

        .formula-box {
          padding: 18px;
          background: var(--bg);
          border: 1px solid var(--rule);
          border-radius: 12px;
          display: grid; grid-template-columns: 1fr auto auto; gap: 12px;
          align-items: center;
        }
        .formula-box input {
          font: 600 22px/1 "JetBrains Mono", monospace;
          background: transparent; border: 0; outline: 0;
          width: 100%;
          color: var(--ink);
          letter-spacing: 0.02em;
        }
        .formula-help {
          display: flex; gap: 16px; flex-wrap: wrap;
          font: 500 11px/1.4 "JetBrains Mono", monospace;
          color: var(--ink-mute);
          margin-top: 10px;
        }
        .formula-help b { color: var(--ink); }

        .summary-card {
          padding: 22px;
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: 12px;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
        }
        .summary-card .col { display: flex; flex-direction: column; gap: 4px; }
        .summary-card .v { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; font-size: 32px; letter-spacing: -0.03em; line-height: 1; }
        .summary-card .l { font: 500 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-mute); }

        .md-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .is-mobile .md-row { grid-template-columns: 1fr; }
        .md-textarea {
          width: 100%; min-height: 280px;
          padding: 14px; border-radius: 10px;
          background: var(--bg); border: 1px solid var(--rule);
          font: 13px/1.55 "JetBrains Mono", monospace;
          resize: vertical;
        }
        .md-preview {
          padding: 18px; border-radius: 10px;
          background: var(--paper); border: 1px solid var(--rule);
          font-size: 14px; line-height: 1.5;
          min-height: 280px;
          overflow-y: auto;
        }
        .md-preview h1 { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; font-size: 28px; margin: 0 0 8px; letter-spacing: -0.025em; }
        .md-preview h2 { font-family: "Bricolage Grotesque"; font-weight: 500; font-stretch: 110%; font-size: 18px; margin: 16px 0 6px; letter-spacing: -0.02em; }
        .md-preview ul { padding-left: 22px; margin: 8px 0; }

        .mod-list-row { display: grid; grid-template-columns: 30px 1fr 100px 90px; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid var(--rule); }
        .mod-list-row:first-of-type { border-top: 0; }
        .mod-list-row .k { font: 500 10.5px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; background: var(--rule-soft); color: var(--ink-soft); display: inline-block; width: fit-content; }
        .mod-list-row .k.sim { background: var(--primary-soft); color: var(--primary-ink); }
        .mod-actions { display: flex; gap: 6px; justify-content: flex-end; }
        .icon-btn { width: 30px; height: 30px; border-radius: 8px; background: var(--rule-soft); border: 0; cursor: pointer; display: grid; place-items: center; color: var(--ink-soft); }
        .icon-btn:hover { background: var(--ink); color: var(--paper); }
        .icon-btn.danger:hover { background: var(--err); color: white; }
      `}</style>

      <div className="ad-grid">
        {/* sidebar — context */}
        <aside className="ad-side">
          <div className="card card-pad">
            <div className="num-tag" style={{ marginBottom: 12 }}>Contexto</div>
            <label className="field-label">Matéria</label>
            <div className="ad-pick">
              {SUBJECTS.map(s => (
                <button key={s.id} className={subj === s.id ? "on" : ""} onClick={() => setSubj(s.id)}>
                  <span className="gl" style={{ background: s.color }}>{s.glyph}</span>
                  <span>{s.short}</span>
                </button>
              ))}
            </div>

            <label className="field-label" style={{ marginTop: 14 }}>Bimestre</label>
            <div className="ad-pick" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {BIMESTRES.map(b => (
                <button key={b} className={bim === b ? "on" : ""} onClick={() => setBim(b)} style={{ justifyContent: "center" }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="card card-pad" style={{ background: "var(--primary-soft)", borderColor: "transparent" }}>
            <div className="num-tag" style={{ marginBottom: 8, color: "var(--primary-ink)" }}>Dica</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--primary-ink)" }}>
              Crie sempre <strong>resumo + simulado</strong> em par. O simulado usa o resumo como referência na revisão.
            </div>
          </div>
        </aside>

        {/* main */}
        <div className="ad-main">
          <div className="card card-pad">
            <div className="flex justify-between items-center" style={{ marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontFamily: "Bricolage Grotesque", fontWeight: 600, fontStretch: "115%", letterSpacing: "-0.03em", fontSize: 28, margin: 0 }}>
                Novo módulo
                <span className="muted f-mono" style={{ fontSize: 11, marginLeft: 12, letterSpacing: "0.1em" }}>
                  {SUBJECTS.find(s => s.id === subj).name.toUpperCase()} · {bim} BIM
                </span>
              </h3>
              <div className="ad-tabs">
                <button className={tab === "resumo" ? "on" : ""} onClick={() => setTab("resumo")}>Resumo PDF</button>
                <button className={tab === "questoes" ? "on" : ""} onClick={() => setTab("questoes")}>Questões</button>
                <button className={tab === "simulado" ? "on" : ""} onClick={() => setTab("simulado")}>Simulado</button>
              </div>
            </div>

            {tab === "resumo" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
                  <div style={{ flex: 2, minWidth: 220 }}>
                    <label className="field-label">Título do módulo</label>
                    <input className="input" placeholder="Ex: Fatoração Algébrica" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <label className="field-label">Tag curta</label>
                    <input className="input" placeholder="Ex: FATORAÇÃO" />
                  </div>
                </div>
                <div>
                  <label className="field-label">Descrição breve</label>
                  <input className="input" placeholder="Aparece no card da matéria" value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Conteúdo · Markdown</label>
                  <div className="md-row">
                    <textarea className="md-textarea" value={body} onChange={(e) => setBody(e.target.value)} />
                    <div className="md-preview">
                      <MDPreview text={body} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3" style={{ flexWrap: "wrap" }}>
                  <label className={"btn btn-primary" + (uploading ? " disabled" : "")} style={{ cursor: "pointer" }}>
                    <Icon name="doc" size={14}/> {uploading ? "Enviando..." : "Upload PDF"}
                    <input type="file" accept=".pdf" style={{ display: "none" }} onChange={handleResumoPDF} disabled={uploading} />
                  </label>
                  <button className="btn btn-ghost" onClick={() => { setTitle(""); setDesc(""); }}>Limpar</button>
                  <div className="muted f-mono" style={{ fontSize: 12, alignSelf: "center" }}>
                    O PDF será salvo no Supabase Storage (bucket "resumos")
                  </div>
                </div>
              </div>
            )}

            {tab === "questoes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "var(--bg)", border: "1px solid var(--rule)", borderRadius: 10, padding: "14px 16px" }}>
                  <div className="f-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Formato de importação</div>
                  <pre style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.7, color: "var(--ink-soft)", margin: 0, overflowX: "auto" }}>{`[F] Enunciado da questão fácil
A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D
R: A

[M] Enunciado da questão média
A) Opção A
B) Opção B
C) Opção C
D) Opção D
R: C

[D] Enunciado difícil
A) ... B) ... C) ... D) ...
R: B`}</pre>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label className="field-label" style={{ margin: 0 }}>Cole as questões aqui</label>
                    <span className="chip f-mono">{SUBJECTS.find(s => s.id === subj)?.name} · {bim} bim</span>
                  </div>
                  <textarea
                    className="md-textarea"
                    style={{ minHeight: 320, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}
                    placeholder={`[F] Qual é a capital do Brasil?\nA) Brasília\nB) São Paulo\nC) Rio de Janeiro\nD) Salvador\nR: A`}
                    value={importText}
                    onChange={e => { setImportText(e.target.value); setParsedQuestoes(null); setImportStatus(""); }}
                  />
                </div>

                {parsedQuestoes && parsedQuestoes.length > 0 && (
                  <div style={{ background: "var(--bg)", border: "1px solid var(--rule)", borderRadius: 10, padding: 14 }}>
                    <div className="f-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                      Preview · {parsedQuestoes.length} questão(ões)
                    </div>
                    {parsedQuestoes.slice(0, 3).map((q, i) => (
                      <div key={i} style={{ padding: "10px 0", borderTop: i === 0 ? 0 : "1px solid var(--rule)" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <span className={`chip f-mono`} style={{ fontSize: 10, background: q.dificuldade === 1 ? "oklch(0.62 0.16 148/0.15)" : q.dificuldade === 2 ? "oklch(0.72 0.16 60/0.15)" : "oklch(0.58 0.22 25/0.15)", color: q.dificuldade === 1 ? "oklch(0.42 0.16 148)" : q.dificuldade === 2 ? "oklch(0.45 0.14 60)" : "var(--err)" }}>
                            {["Fácil", "Médio", "Difícil"][q.dificuldade - 1]}
                          </span>
                          <span style={{ fontWeight: 500, fontSize: 14 }}>{q.enunciado}</span>
                        </div>
                        <div className="muted f-mono" style={{ fontSize: 11 }}>
                          {q.opcoes.map(o => `${o.id.toUpperCase()}) ${o.text}`).join(" · ")} · R: {q.resposta_correta.toUpperCase()}
                        </div>
                      </div>
                    ))}
                    {parsedQuestoes.length > 3 && (
                      <div className="muted f-mono" style={{ fontSize: 11, marginTop: 8 }}>...e mais {parsedQuestoes.length - 3} questão(ões)</div>
                    )}
                  </div>
                )}

                {importStatus && (
                  <div className="f-mono" style={{ fontSize: 13, color: importStatus.includes("Erro") ? "var(--err)" : "var(--ok)", padding: "10px 14px", background: "var(--bg)", borderRadius: 8 }}>
                    {importStatus}
                  </div>
                )}

                <div className="flex gap-3" style={{ flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={handleParseImport} disabled={!importText.trim()}>
                    Verificar questões
                  </button>
                  {parsedQuestoes && parsedQuestoes.length > 0 && (
                    <button className="btn btn-primary" style={{ background: "var(--ok)", borderColor: "var(--ok)" }} onClick={handleSaveQuestoes}>
                      <Icon name="check" size={14}/> Salvar {parsedQuestoes.length} questão(ões)
                    </button>
                  )}
                  <button className="btn btn-ghost" style={{ marginLeft: "auto", color: "var(--err)" }} onClick={handleDeleteAllQuestoes}>
                    <Icon name="trash" size={14}/> Apagar todas
                  </button>
                </div>
              </div>
            )}

            {tab === "simulado" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="field-label">Título do simulado</label>
                  <input className="input" placeholder="Ex: Simulado · Era Vargas" />
                </div>

                <div>
                  <label className="field-label">Presets</label>
                  <div className="preset-row">
                    {presets.map(p => (
                      <button key={p.name} className={formula === p.f ? "on" : ""} onClick={() => setFormula(p.f)}>
                        {p.name} · {p.f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label">Fórmula da prova</label>
                  <div className="formula-box">
                    <input value={formula} onChange={(e) => setFormula(e.target.value)} />
                    <button className="btn btn-primary btn-sm">Gerar estrutura</button>
                    <button className="btn btn-ghost btn-sm"><Icon name="trash" size={14}/></button>
                  </div>
                  <div className="formula-help">
                    <span><b>F</b> = Fácil · 1pt</span>
                    <span><b>M</b> = Médio · 2pts</span>
                    <span><b>D</b> = Difícil · 3pts</span>
                    <span>Exemplo: <b>8F+6M+4D</b> = 18 questões</span>
                  </div>
                </div>

                {parsed && (
                  <div className="summary-card">
                    <div className="col">
                      <span className="l">Total de questões</span>
                      <span className="v">{parsed.total}</span>
                    </div>
                    <div className="col">
                      <span className="l">Pontuação máxima</span>
                      <span className="v">{parsed.pts}</span>
                    </div>
                    <div className="col">
                      <span className="l">Distribuição</span>
                      <span className="v" style={{ fontSize: 20, letterSpacing: 0 }}>
                        <span style={{ color: "var(--ok)" }}>{parsed.f}F</span> · <span style={{ color: "oklch(0.45 0.14 60)" }}>{parsed.m}M</span> · <span style={{ color: "var(--err)" }}>{parsed.d}D</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="btn btn-primary"><Icon name="plus" size={14}/> Adicionar questão manual</button>
                  <button className="btn btn-ghost"><Icon name="doc" size={14}/> Importar texto</button>
                  <button className="btn btn-ghost" style={{ marginLeft: "auto" }}>Salvar simulado</button>
                </div>
              </div>
            )}

            {tab === "modulos" && (
              <div>
                {((MODULES[bim] && MODULES[bim][subj]) || []).map((m, i) => (
                  <div className="mod-list-row" key={i}>
                    <span className="f-mono muted" style={{ fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className={"k " + (m.type === "simulado" ? "sim" : "")}>{m.type === "simulado" ? "Simulado" : "Resumo"}</div>
                      <div style={{ fontWeight: 500, marginTop: 6 }}>{m.title}</div>
                      <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{m.sub}</div>
                    </div>
                    <span className="chip">{m.status === "done" ? "Ativo" : m.status === "ready" ? "Pronto" : "Rascunho"}</span>
                    <div className="mod-actions">
                      <button className="icon-btn"><Icon name="edit" size={14}/></button>
                      <button className="icon-btn danger"><Icon name="trash" size={14}/></button>
                    </div>
                  </div>
                ))}
                {((MODULES[bim] && MODULES[bim][subj]) || []).length === 0 && (
                  <div className="center muted" style={{ padding: 40 }}>Nenhum módulo cadastrado pra essa combinação.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// minimal MD preview
function MDPreview({ text }) {
  const lines = text.split("\n");
  const out = [];
  let listBuf = [];
  const flushList = () => {
    if (listBuf.length) {
      out.push(<ul key={out.length}>{listBuf.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(l) }} />)}</ul>);
      listBuf = [];
    }
  };
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  lines.forEach((l, i) => {
    if (l.startsWith("- ")) { listBuf.push(l.slice(2)); return; }
    flushList();
    if (l.startsWith("## ")) out.push(<h2 key={i}>{l.slice(3)}</h2>);
    else if (l.startsWith("# ")) out.push(<h1 key={i}>{l.slice(2)}</h1>);
    else if (l.trim() === "") out.push(<div key={i} style={{ height: 6 }} />);
    else out.push(<p key={i} style={{ margin: "4px 0" }} dangerouslySetInnerHTML={{ __html: inline(l) }} />);
  });
  flushList();
  return <div>{out}</div>;
}

window.AdminScreen = AdminScreen;
