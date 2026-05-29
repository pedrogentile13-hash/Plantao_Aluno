function DesempenhoScreen({ onNav, isMobile }) {
  const [tab, setTab] = React.useState("overview"); // overview | bydiff | bysubject
  const history = PERF_HISTORY;

  // build subject aggregates
  const bySubj = {};
  history.forEach(h => {
    if (!bySubj[h.disc]) bySubj[h.disc] = { n: 0, sum: 0, dif: { F: [0, 0], M: [0, 0], D: [0, 0] } };
    bySubj[h.disc].n += 1;
    bySubj[h.disc].sum += h.nota;
    ["F", "M", "D"].forEach(k => {
      bySubj[h.disc].dif[k][0] += h.dif[k][0];
      bySubj[h.disc].dif[k][1] += h.dif[k][1];
    });
  });
  const subjAgg = Object.entries(bySubj).map(([k, v]) => ({ disc: k, avg: v.sum / v.n, n: v.n, dif: v.dif }));

  const mediaGeral = history.reduce((a, h) => a + h.nota, 0) / history.length;
  const total = history.length;
  const totalAcertos = history.reduce((a, h) => a + h.acertos, 0);
  const totalQ = history.reduce((a, h) => a + h.total, 0);

  // by difficulty totals
  const difAgg = { F: [0, 0], M: [0, 0], D: [0, 0] };
  history.forEach(h => {
    ["F", "M", "D"].forEach(k => {
      difAgg[k][0] += h.dif[k][0];
      difAgg[k][1] += h.dif[k][1];
    });
  });

  return (
    <div className="main-pad anim-fade">
      <PageHead
        eyebrow="03 · Desempenho"
        title="O que dizem"
        titleEm="os números."
        meta={<>Últimos <b>{total}</b> simulados<br/>Média atual <b>{mediaGeral.toFixed(1)}</b></>}
      />

      <style>{`
        .dp-tabs { display: flex; gap: 4px; padding: 4px; background: var(--rule-soft); border-radius: 999px; align-self: flex-start; margin-bottom: 22px; width: fit-content; }
        .dp-tabs button { background: transparent; border: 0; cursor: pointer; padding: 9px 16px; border-radius: 999px; font: 500 12.5px/1 "JetBrains Mono", monospace; letter-spacing: 0.04em; color: var(--ink-soft); }
        .dp-tabs button.on { background: var(--ink); color: var(--paper); }

        .dp-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }
        .is-mobile .dp-grid { grid-template-columns: 1fr; }
        .dp-grid > .span-3 { grid-column: span 3; }
        .dp-grid > .span-4 { grid-column: span 4; }
        .dp-grid > .span-6 { grid-column: span 6; }
        .dp-grid > .span-8 { grid-column: span 8; }
        .dp-grid > .span-12 { grid-column: span 12; }
        .is-mobile .dp-grid > * { grid-column: 1 / -1 !important; }

        .chart-wrap { position: relative; height: 280px; }

        .leg { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 12px; font: 500 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.04em; }
        .leg .dot { display: inline-block; width: 10px; height: 10px; border-radius: 999px; margin-right: 6px; vertical-align: middle; }
      `}</style>

      <div className="dp-tabs">
        <button className={tab === "overview" ? "on" : ""} onClick={() => setTab("overview")}>Visão geral</button>
        <button className={tab === "bydiff" ? "on" : ""} onClick={() => setTab("bydiff")}>Por dificuldade</button>
        <button className={tab === "bysubject" ? "on" : ""} onClick={() => setTab("bysubject")}>Por matéria</button>
      </div>

      <div className="dp-grid">
        <div className="card card-pad span-3">
          <div className="big-stat">
            <div className="label">Média geral</div>
            <div className="value f-num">{mediaGeral.toFixed(1)}<sup>/10</sup></div>
            <div className="delta">↑ +0.4 vs. mês anterior</div>
          </div>
        </div>
        <div className="card card-pad span-3">
          <div className="big-stat">
            <div className="label">Simulados</div>
            <div className="value">{total}</div>
            <div className="delta f-mono" style={{ color: "var(--ink-mute)" }}>nos últimos 90 dias</div>
          </div>
        </div>
        <div className="card card-pad span-3">
          <div className="big-stat">
            <div className="label">Aproveitamento</div>
            <div className="value f-num">{Math.round((totalAcertos / totalQ) * 100)}<sup>%</sup></div>
            <div className="delta">{totalAcertos} acertos de {totalQ}</div>
          </div>
        </div>
        <div className="card card-pad span-3" style={{ background: "var(--primary-soft)", borderColor: "transparent" }}>
          <div className="big-stat">
            <div className="label">Melhor matéria</div>
            <div className="value" style={{ fontSize: 36, lineHeight: 1.1 }}>Inglês</div>
            <div className="delta f-mono" style={{ color: "var(--primary-ink)" }}>média 9.5 · 2 simulados</div>
          </div>
        </div>

        {tab === "overview" && (
          <React.Fragment>
            <div className="card card-pad span-8">
              <div className="rule-h" style={{ margin: "0 0 16px" }}>
                <span className="lbl">Evolução das notas</span>
                <span className="lbl muted f-mono">últimos 10 simulados</span>
              </div>
              <LineChart data={history} />
            </div>

            <div className="card card-pad span-4">
              <div className="rule-h" style={{ margin: "0 0 16px" }}>
                <span className="lbl">Aproveitamento por nível</span>
              </div>
              <div className="flex-col gap-4">
                {[
                  { k: "F", n: "Fáceis", c: "var(--ok)" },
                  { k: "M", n: "Médias", c: "oklch(0.72 0.16 60)" },
                  { k: "D", n: "Difíceis", c: "var(--err)" },
                ].map(d => {
                  const [c, t] = difAgg[d.k];
                  const p = (c / t) * 100;
                  return (
                    <div key={d.k}>
                      <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 500 }}>{d.n}</span>
                        <span className="f-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>{c}/{t} · {Math.round(p)}%</span>
                      </div>
                      <div className="progress" style={{ height: 10 }}><i style={{ width: `${p}%`, background: d.c }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        )}

        {tab === "bydiff" && (
          <div className="card card-pad span-12">
            <div className="rule-h" style={{ margin: "0 0 16px" }}>
              <span className="lbl">Acertos por nível ao longo do tempo</span>
            </div>
            <StackedDifficultyChart data={history} />
            <div className="leg">
              <span><i className="dot" style={{ background: "var(--ok)" }}/>Fácil</span>
              <span><i className="dot" style={{ background: "oklch(0.72 0.16 60)" }}/>Médio</span>
              <span><i className="dot" style={{ background: "var(--err)" }}/>Difícil</span>
            </div>
          </div>
        )}

        {tab === "bysubject" && (
          <div className="card card-pad span-12">
            <div className="rule-h" style={{ margin: "0 0 16px" }}>
              <span className="lbl">Média e detalhe por matéria</span>
            </div>
            {subjAgg.sort((a, b) => b.avg - a.avg).map(s => (
              <div key={s.disc} style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "180px 1fr 80px",
                gap: 16, alignItems: "center",
                padding: "16px 0", borderTop: "1px solid var(--rule)"
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.disc}</div>
                  <div className="muted f-mono" style={{ fontSize: 11, marginTop: 2 }}>{s.n} simulado{s.n > 1 ? "s" : ""}</div>
                </div>
                <div className="progress" style={{ height: 12 }}><i style={{ width: `${(s.avg / 10) * 100}%` }} /></div>
                <div style={{ textAlign: isMobile ? "left" : "right", fontFamily: "Bricolage Grotesque", fontWeight: 600, fontSize: 24, letterSpacing: "-0.02em" }}>
                  {s.avg.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// custom line chart
function LineChart({ data }) {
  const w = 800, h = 240, pad = { l: 40, r: 16, t: 12, b: 32 };
  const x = (i) => pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r);
  const y = (n) => h - pad.b - (n / 10) * (h - pad.t - pad.b);

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.nota)}`).join(" ");
  const area = `${path} L${x(data.length - 1)},${h - pad.b} L${pad.l},${h - pad.b} Z`;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", minWidth: 560 }}>
        <defs>
          <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 2.5, 5, 7.5, 10].map(t => (
          <g key={t}>
            <line x1={pad.l} y1={y(t)} x2={w - pad.r} y2={y(t)}
              stroke="var(--rule)" strokeWidth="1"
              strokeDasharray={t === 5 ? "0" : "2 4"} />
            <text x={pad.l - 8} y={y(t) + 4} fontFamily="JetBrains Mono" fontSize="10"
              fill="var(--ink-mute)" textAnchor="end">{t}</text>
          </g>
        ))}
        <path d={area} fill="url(#ga)" />
        <path d={path} stroke="var(--primary)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.nota)} r="4" fill="var(--paper)" stroke="var(--primary)" strokeWidth="2" />
            <text x={x(i)} y={h - pad.b + 18} fontFamily="JetBrains Mono" fontSize="10"
              fill="var(--ink-mute)" textAnchor="middle">{d.data}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function StackedDifficultyChart({ data }) {
  const w = 800, h = 280, pad = { l: 40, r: 16, t: 12, b: 32 };
  const max = 30;
  const bw = (w - pad.l - pad.r) / data.length * 0.7;
  const gap = (w - pad.l - pad.r) / data.length * 0.3;

  const yScale = (v) => (v / max) * (h - pad.t - pad.b);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", minWidth: 560 }}>
        {[0, 10, 20, 30].map(t => (
          <g key={t}>
            <line x1={pad.l} y1={h - pad.b - yScale(t)} x2={w - pad.r} y2={h - pad.b - yScale(t)}
              stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 4" />
            <text x={pad.l - 8} y={h - pad.b - yScale(t) + 4} fontFamily="JetBrains Mono" fontSize="10"
              fill="var(--ink-mute)" textAnchor="end">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x0 = pad.l + i * (bw + gap) + gap / 2;
          const f = d.dif.F[0], m = d.dif.M[0], dh = d.dif.D[0];
          const baseY = h - pad.b;
          return (
            <g key={i}>
              <rect x={x0} y={baseY - yScale(f)} width={bw} height={yScale(f)} fill="var(--ok)" />
              <rect x={x0} y={baseY - yScale(f + m)} width={bw} height={yScale(m)} fill="oklch(0.72 0.16 60)" />
              <rect x={x0} y={baseY - yScale(f + m + dh)} width={bw} height={yScale(dh)} fill="var(--err)" />
              <text x={x0 + bw / 2} y={h - pad.b + 18} fontFamily="JetBrains Mono" fontSize="10"
                fill="var(--ink-mute)" textAnchor="middle">{d.data}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

window.DesempenhoScreen = DesempenhoScreen;
