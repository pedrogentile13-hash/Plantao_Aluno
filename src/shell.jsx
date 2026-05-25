// Shell: sidebar, header, viewport toggle, page wrapper

const NAV = [
  { id: "dashboard",  label: "Início",     num: "01", icon: "home"     },
  { id: "resumos",    label: "Estudos",    num: "02", icon: "book"     },
  { id: "desempenho", label: "Desempenho", num: "03", icon: "chart"    },
  { id: "boletim",    label: "Boletim",    num: "04", icon: "doc"      },
  { id: "conquistas", label: "Conquistas", num: "05", icon: "trophy"   },
];

const NAV_ADMIN = [
  { id: "admin",      label: "Painel Admin", num: "AD", icon: "shield" },
];

function Sidebar({ active, onNav, onLogout, profile }) {
  const isAdmin = profile?.role === 'admin';
  const fullName = profile?.full_name || 'Usuário';
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const role = profile?.role === 'admin' ? 'Admin' : 'Aluno';
  const turma = profile?.turma || '9C';

  return (
    <aside className="sidebar">
      <button onClick={() => onNav("landing")} className="sidebar-brand">
        <div className="brand-mark-box">PA</div>
        <div>
          <div className="mark">Plantão Aluno</div>
          <div className="sub">9ºc · 2026</div>
        </div>
      </button>

      <div className="nav-section">Estudo</div>
      <div className="flex-col gap-1">
        {NAV.map(item => (
          <button key={item.id}
            className={"nav-item" + (active === item.id ? " active" : "")}
            onClick={() => onNav(item.id)}>
            <span className="num">{item.num}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {isAdmin && (
        <>
          <div className="nav-section">Gestão</div>
          <div className="flex-col gap-1">
            {NAV_ADMIN.map(item => (
              <button key={item.id}
                className={"nav-item" + (active === item.id ? " active" : "")}
                onClick={() => onNav(item.id)}>
                <span className="num">{item.num}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="sidebar-foot">
        <div className="avatar">{initials}</div>
        <div className="grow">
          <div className="name">{fullName}</div>
          <div className="role">{role} · {turma}</div>
        </div>
        <button
          onClick={onLogout}
          title="Sair"
          style={{ background: "transparent", border: 0, color: "var(--ink-mute)", cursor: "pointer", padding: 4 }}
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </aside>
  );
}

function MobileTopBar({ onNav, onMenu }) {
  return (
    <div className="mobile-topbar">
      <button onClick={() => onNav("landing")}
        style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div className="brand-mark-box" style={{ width: 32, height: 32, fontSize: 15 }}>PA</div>
        <div className="mark">Plantão Aluno</div>
      </button>
      <button onClick={onMenu} style={{ background: "transparent", border: 0, color: "var(--ink)", cursor: "pointer" }}>
        <Icon name="menu" size={22} />
      </button>
    </div>
  );
}

function MobileBottomNav({ active, onNav }) {
  return (
    <div className="mobile-bottom-nav">
      {NAV.map(item => (
        <button key={item.id}
          className={active === item.id ? "active" : ""}
          onClick={() => onNav(item.id)}>
          <span className="ic"><Icon name={item.icon} size={20} /></span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function ViewportToggle({ mode, setMode }) {
  return (
    <div className="vp-toggle">
      <button className={mode === "desktop" ? "active" : ""} onClick={() => setMode("desktop")}>Desktop</button>
      <button className={mode === "mobile"  ? "active" : ""} onClick={() => setMode("mobile")}>Mobile</button>
    </div>
  );
}

function PageHead({ eyebrow, title, titleEm, meta, action }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>
          {title}{titleEm && <> <span className="accent">{titleEm}</span></>}
        </h1>
      </div>
      <div />
      {meta ? <div className="meta">{meta}</div> : <div>{action}</div>}
    </div>
  );
}

Object.assign(window, { Sidebar, MobileTopBar, MobileBottomNav, ViewportToggle, PageHead, NAV, NAV_ADMIN });
