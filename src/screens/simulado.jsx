function SimuladoScreen({ onFinish, onExit, isMobile }) {
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const q = QUESTOES[idx];
  const total = QUESTOES.length;
  const answered = Object.keys(answers).length;
  const pct = (answered / total) * 100;

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  };

  const setAnswer = (a) => setAnswers(prev => ({ ...prev, [idx]: a }));

  const finish = () => {
    let acertos = 0, pts = 0, max = 0;
    const dif = { F: [0, 0], M: [0, 0], D: [0, 0] };
    const weight = { F: 1, M: 2, D: 3 };
    QUESTOES.forEach((q, i) => {
      const right = answers[i] === q.correct;
      dif[q.d][1] += 1;
      max += weight[q.d];
      if (right) {
        acertos += 1;
        pts += weight[q.d];
        dif[q.d][0] += 1;
      }
    });
    const nota = (pts / max) * 10;
    onFinish({ acertos, total, nota, pts, max, dif, answers });
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <style>{`
        .sim-top { padding: 18px 32px; border-bottom: 1px solid var(--rule); display: flex; justify-content: space-between; align-items: center; gap: 16px; background: var(--paper); }
        .is-mobile .sim-top { padding: 14px 18px; }
        .sim-top .mark { font-family: "Bricolage Grotesque"; font-weight: 700; font-stretch: 120%; letter-spacing: -0.04em; font-size: 18px; }
        .sim-top .mark em { font-family: "Caveat", cursive; font-weight: 700; font-style: normal; font-stretch: 100%; transform: rotate(-2deg); display: inline-block; color: var(--primary); }
        .sim-top .status { display: flex; gap: 22px; align-items: center; font: 500 12.5px/1.2 "JetBrains Mono", monospace; }
        .sim-top .status .l { color: var(--ink-mute); letter-spacing: 0.04em; text-transform: uppercase; font-size: 10.5px; }
        .sim-top .status .v { font-family: "Bricolage Grotesque"; font-weight: 500; font-stretch: 110%; font-size: 18px; }

        .sim-progress { height: 4px; background: var(--rule-soft); }
        .sim-progress i { display: block; height: 100%; background: var(--ink); transition: width .25s ease; }

        .sim-body { display: grid; grid-template-columns: 1fr 280px; gap: 0; flex: 1; min-height: 0; }
        .is-mobile .sim-body { grid-template-columns: 1fr; }

        .sim-main { padding: 56px 64px; max-width: 880px; }
        .is-mobile .sim-main { padding: 24px 18px 100px; }

        .sim-q-meta { display: flex; gap: 18px; align-items: center; margin-bottom: 28px; }
        .sim-q-meta .num { font-family: "Bricolage Grotesque"; font-weight: 600; font-stretch: 115%; font-size: 64px; line-height: 0.9; letter-spacing: -0.04em; color: var(--primary); }
        .sim-q-meta .num span { color: var(--ink-mute); font-size: 24px; vertical-align: top; }
        .sim-q-meta .dif {
          padding: 6px 12px; border-radius: 999px;
          font: 500 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.1em; text-transform: uppercase;
        }
        .sim-q-meta .dif.F { background: oklch(0.62 0.16 148 / 0.14); color: oklch(0.42 0.16 148); }
        .sim-q-meta .dif.M { background: oklch(0.72 0.16 60 / 0.16); color: oklch(0.45 0.14 60); }
        .sim-q-meta .dif.D { background: oklch(0.58 0.22 25 / 0.14); color: var(--err); }

        .sim-q-text {
          font-family: "Bricolage Grotesque";
          font-weight: 500; font-stretch: 115%;
          letter-spacing: -0.025em;
          font-size: 30px; line-height: 1.2;
          margin: 0 0 32px;
          color: var(--ink);
        }
        .is-mobile .sim-q-text { font-size: 22px; }

        .alt-list { display: flex; flex-direction: column; gap: 10px; }
        .alt {
          display: grid;
          grid-template-columns: 36px 1fr 18px;
          gap: 14px;
          padding: 16px 18px;
          align-items: center;
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          font: inherit;
          color: inherit;
          width: 100%;
          transition: border-color .12s ease, background .12s ease;
        }
        .alt:hover { border-color: var(--ink-mute); }
        .alt.selected { border-color: var(--ink); background: var(--ink); color: var(--paper); }
        .alt .letter {
          width: 28px; height: 28px;
          border-radius: 999px;
          display: grid; place-items: center;
          background: var(--rule-soft);
          font: 500 13px/1 "JetBrains Mono", monospace;
          letter-spacing: 0.04em;
        }
        .alt.selected .letter { background: var(--paper); color: var(--ink); }
        .alt .text { font-size: 15.5px; }

        .sim-nav { display: flex; gap: 10px; justify-content: space-between; margin-top: 40px; }

        .sim-side { border-left: 1px solid var(--rule); padding: 28px 24px; display: flex; flex-direction: column; gap: 18px; background: var(--paper); overflow-y: auto; }
        .is-mobile .sim-side { display: none; }
        .sim-side h4 { font: 500 11px/1 "JetBrains Mono", monospace; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-mute); margin: 0 0 10px; }
        .q-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
        .q-grid button {
          aspect-ratio: 1;
          border-radius: 8px;
          background: var(--rule-soft);
          border: 1px solid transparent;
          cursor: pointer;
          font: 500 13px/1 "JetBrains Mono", monospace;
          color: var(--ink-soft);
        }
        .q-grid button.done { background: var(--ink); color: var(--paper); }
        .q-grid button.current { outline: 2px solid var(--primary); outline-offset: 2px; }
      `}</style>

      <div className="sim-top">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button className="modal-x" onClick={onExit} style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--ink)" }}>
            <Icon name="x" size={20}/>
          </button>
          <div>
            <div className="mark">Simulado <em>·</em> O Médico e o Monstro</div>
            <div className="muted f-mono" style={{ fontSize: 11, letterSpacing: "0.06em", marginTop: 2 }}>PORTUGUÊS · 1º BIMESTRE</div>
          </div>
        </div>
        <div className="status">
          <div>
            <div className="l">Tempo</div>
            <div className="v">{fmt(seconds)}</div>
          </div>
          <div>
            <div className="l">Respondidas</div>
            <div className="v">{answered}<span style={{ color: "var(--ink-mute)" }}>/{total}</span></div>
          </div>
        </div>
      </div>
      <div className="sim-progress"><i style={{ width: `${pct}%` }} /></div>

      <div className="sim-body">
        <div className="sim-main">
          <div className="sim-q-meta">
            <div className="num f-num">{String(idx + 1).padStart(2, "0")}<span> / {String(total).padStart(2, "0")}</span></div>
            <div>
              <span className={"dif " + q.d}>
                {q.d === "F" ? "Fácil · 1pt" : q.d === "M" ? "Médio · 2pts" : "Difícil · 3pts"}
              </span>
            </div>
          </div>

          <p className="sim-q-text">{q.q}</p>

          <div className="alt-list">
            {q.alts.map((alt, i) => (
              <button key={i}
                className={"alt" + (answers[idx] === i ? " selected" : "")}
                onClick={() => setAnswer(i)}>
                <span className="letter">{String.fromCharCode(65 + i)}</span>
                <span className="text">{alt}</span>
                <span style={{ opacity: answers[idx] === i ? 1 : 0 }}>
                  <Icon name="check" size={16} />
                </span>
              </button>
            ))}
          </div>

          <div className="sim-nav">
            <button className="btn btn-ghost"
              disabled={idx === 0}
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              style={{ opacity: idx === 0 ? 0.4 : 1 }}>
              ← Anterior
            </button>
            {idx < total - 1 ? (
              <button className="btn btn-primary" onClick={() => setIdx(i => Math.min(total - 1, i + 1))}>
                Próxima <Icon name="arrow" size={14} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={finish}>
                Encerrar simulado <Icon name="check" size={14} />
              </button>
            )}
          </div>
        </div>

        <aside className="sim-side">
          <h4>Mapa das questões</h4>
          <div className="q-grid">
            {QUESTOES.map((_, i) => (
              <button key={i}
                className={(answers[i] != null ? "done " : "") + (i === idx ? "current" : "")}
                onClick={() => setIdx(i)}>
                {i + 1}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "auto", paddingTop: 18, borderTop: "1px solid var(--rule)" }}>
            <h4>Pontuação possível</h4>
            <div className="f-mono" style={{ fontSize: 12, lineHeight: 1.7, color: "var(--ink-soft)" }}>
              <div>{QUESTOES.filter(q => q.d === "F").length} fáceis × 1pt</div>
              <div>{QUESTOES.filter(q => q.d === "M").length} médias × 2pts</div>
              <div>{QUESTOES.filter(q => q.d === "D").length} difíceis × 3pts</div>
              <div style={{ marginTop: 8, color: "var(--ink)", fontWeight: 600 }}>
                Máx · {QUESTOES.reduce((a, q) => a + ({ F: 1, M: 2, D: 3 }[q.d]), 0)} pts
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

window.SimuladoScreen = SimuladoScreen;
