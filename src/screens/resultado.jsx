function ResultadoScreen({ result, onClose, onNav, isMobile }) {
  if (!result) return null;
  const { acertos, total, nota, pts, max, dif, answers } = result;
  const pct = Math.round((acertos / total) * 100);

  const tier =
    nota >= 9 ? { label: "Excelente", msg: "Você dominou.", color: "var(--ok)", accent: "oklch(0.85 0.16 148)" } :
    nota >= 7 ? { label: "Muito bom",  msg: "Quase lá. Revisa as médias.", color: "var(--primary)", accent: "var(--primary-soft)" } :
    nota >= 5 ? { label: "Em construção", msg: "Continue praticando.", color: "var(--warn)", accent: "oklch(0.92 0.06 60)" } :
                { label: "Revisar", msg: "Volte pro resumo, refaça depois.", color: "var(--err)", accent: "oklch(0.94 0.04 25)" };

  return (
    <div className="main anim-fade" style={{ background: "var(--bg)" }}>
      <style>{`
        .res-pad { padding: 32px 44px 80px; max-width: 1200px; }
        .is-mobile .res-pad { padding: 20px 18px 100px; }

        .res-hero {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 28px;
          padding: 36px;
          border-radius: var(--r-3);
          background: var(--ink);
          color: var(--paper);
          margin-bottom: 22px;
          align-items: end;
          position: relative;
          overflow: hidden;
          min-height: 280px;
        }
        .is-mobile .res-hero { grid-template-columns: 1fr; padding: 24px; min-height: 0; }
        .res-hero .grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .res-hero .corner { font: 500 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; color: oklch(0.72 0.02 260); position: relative; z-index: 1; }
        .res-hero h1 { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; letter-spacing: -0.045em; font-size: clamp(40px, 5vw, 72px); line-height: 0.95; margin: 16px 0 6px; position: relative; z-index: 1; }
        .res-hero h1 em { font-family: "Caveat", cursive; font-weight: 700; font-style: normal; font-stretch: 100%; transform: rotate(-2deg); display: inline-block; }
        .res-hero .msg { font-family: "Instrument Serif"; font-style: italic; font-size: 22px; color: oklch(0.85 0.02 260); position: relative; z-index: 1; }
        .nota-block { text-align: right; position: relative; z-index: 1; }
        .is-mobile .nota-block { text-align: left; }
        .nota-block .nota-v {
          font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 120%; letter-spacing: -0.05em;
          font-size: clamp(120px, 16vw, 220px); line-height: 0.9;
        }
        .nota-block .nota-v sup { font-size: 36px; color: oklch(0.72 0.02 260); vertical-align: top; font-stretch: 100%; }

        .res-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
        .is-mobile .res-stats { grid-template-columns: repeat(2, 1fr); }

        .dif-bars { display: flex; flex-direction: column; gap: 16px; }
        .dif-bar { display: grid; grid-template-columns: 90px 1fr 80px; gap: 14px; align-items: center; }
        .dif-bar .lbl { display: flex; align-items: center; gap: 10px; font-weight: 500; }
        .dif-bar .lbl .pill { width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; font: 600 11px/1 "JetBrains Mono", monospace; }
        .dif-bar .lbl .pill.F { background: oklch(0.62 0.16 148 / 0.14); color: oklch(0.42 0.16 148); }
        .dif-bar .lbl .pill.M { background: oklch(0.72 0.16 60 / 0.16); color: oklch(0.45 0.14 60); }
        .dif-bar .lbl .pill.D { background: oklch(0.58 0.22 25 / 0.14); color: var(--err); }
        .dif-bar .bar { height: 12px; border-radius: 999px; background: var(--rule-soft); overflow: hidden; }
        .dif-bar .bar i { display: block; height: 100%; border-radius: 999px; }
        .dif-bar .right { text-align: right; font: 500 13px/1 "JetBrains Mono", monospace; }
        .dif-bar .right b { font-family: "Bricolage Grotesque"; font-size: 17px; }

        .review-row {
          display: grid; grid-template-columns: 40px 30px 1fr 80px;
          gap: 14px; align-items: center;
          padding: 14px 0; border-top: 1px solid var(--rule);
          font-size: 14.5px;
        }
        .review-row:first-of-type { border-top: 0; }
        .review-row .qn { font: 600 12px/1 "JetBrains Mono", monospace; }
        .review-row .dot { width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; color: var(--paper); font: 600 11px/1 "JetBrains Mono"; }
        .review-row .dot.ok { background: var(--ok); }
        .review-row .dot.bad { background: var(--err); }
        .review-row .ans { font-size: 12.5px; color: var(--ink-mute); font-family: "JetBrains Mono", monospace; text-align: right; }
      `}</style>

      <div className="res-pad">
        <div className="res-hero">
          <div className="grid-bg" />
          <div>
            <div className="corner">RESULTADO · PORT · 1BI · O MÉDICO E O MONSTRO</div>
            <h1>
              {tier.label}.<br/>
              <em>{tier.msg}</em>
            </h1>
          </div>
          <div className="nota-block">
            <div className="corner" style={{ marginBottom: 10 }}>SUA NOTA</div>
            <div className="nota-v f-num" style={{ color: tier.accent }}>
              {nota.toFixed(1)}<sup>/10</sup>
            </div>
          </div>
        </div>

        <div className="res-stats">
          <div className="card card-pad">
            <div className="big-stat">
              <div className="label">Acertos</div>
              <div className="value">{acertos}<sup>/{total}</sup></div>
              <div className="delta f-mono" style={{ color: "var(--ink-mute)" }}>{pct}% de aproveitamento</div>
            </div>
          </div>
          <div className="card card-pad">
            <div className="big-stat">
              <div className="label">Pontos</div>
              <div className="value">{pts}<sup>/{max}</sup></div>
              <div className="delta f-mono" style={{ color: "var(--ink-mute)" }}>pontos ponderados</div>
            </div>
          </div>
          <div className="card card-pad">
            <div className="big-stat">
              <div className="label">Posição na turma</div>
              <div className="value">3<sup>º</sup></div>
              <div className="delta">↑ subiu 2 posições</div>
            </div>
          </div>
          <div className="card card-pad" style={{ background: tier.accent, borderColor: "transparent" }}>
            <div className="big-stat">
              <div className="label" style={{ color: "oklch(0.25 0.05 260)" }}>Diagnóstico</div>
              <div className="value" style={{ fontSize: 32, lineHeight: 1.05, marginTop: 6, color: "oklch(0.18 0.04 260)" }}>
                {nota >= 9 ? "Pronto pro próximo módulo" : nota >= 7 ? "Revisar as questões médias" : "Voltar ao resumo"}
              </div>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="rule-h" style={{ margin: "0 0 18px" }}>
            <span className="lbl">Desempenho por dificuldade</span>
          </div>
          <div className="dif-bars">
            {[
              { k: "F", n: "Fáceis", w: 1, bg: "var(--ok)" },
              { k: "M", n: "Médias", w: 2, bg: "oklch(0.72 0.16 60)" },
              { k: "D", n: "Difíceis", w: 3, bg: "var(--err)" },
            ].map(d => {
              const [c, t] = dif[d.k];
              const p = t === 0 ? 0 : (c / t) * 100;
              return (
                <div className="dif-bar" key={d.k}>
                  <div className="lbl">
                    <span className={`pill ${d.k}`}>{d.k}</span>
                    <span>{d.n}</span>
                  </div>
                  <div className="bar"><i style={{ width: `${p}%`, background: d.bg }} /></div>
                  <div className="right">
                    <b>{c}<span style={{ color: "var(--ink-mute)" }}>/{t}</span></b>
                    <div className="muted f-mono" style={{ fontSize: 11 }}>{Math.round(p)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-pad" style={{ marginTop: 18 }}>
          <div className="rule-h" style={{ margin: "0 0 8px" }}>
            <span className="lbl">Revisão · questão a questão</span>
            <span className="lbl muted">Clique no item pra ver explicação (mock)</span>
          </div>
          {QUESTOES.map((q, i) => {
            const a = answers[i];
            const right = a === q.correct;
            return (
              <div className="review-row" key={i}>
                <span className="qn">Q{String(i + 1).padStart(2, "0")}</span>
                <span className={"dot " + (right ? "ok" : "bad")}>
                  {right ? "✓" : "×"}
                </span>
                <div>
                  <div style={{ lineHeight: 1.3 }}>{q.q}</div>
                  <div className="muted f-mono" style={{ fontSize: 11, marginTop: 2, letterSpacing: "0.04em" }}>
                    {q.d === "F" ? "FÁCIL" : q.d === "M" ? "MÉDIA" : "DIFÍCIL"}
                    {a != null && (
                      <> · sua resposta · <b>{String.fromCharCode(65 + a)}</b>
                        {!right && <> · correta · <b style={{ color: "var(--ok)" }}>{String.fromCharCode(65 + q.correct)}</b></>}
                      </>
                    )}
                    {a == null && <> · não respondida</>}
                  </div>
                </div>
                <span className="ans">{a != null ? q.alts[a].slice(0, 18) : "—"}</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3" style={{ marginTop: 22, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => onNav("resumos")}>Próximo simulado <Icon name="arrow" size={14}/></button>
          <button className="btn btn-ghost" onClick={() => onNav("desempenho")}>Ver desempenho geral</button>
          <button className="btn btn-ghost" onClick={onClose}>Voltar</button>
        </div>
      </div>
    </div>
  );
}

window.ResultadoScreen = ResultadoScreen;
