// thin-line icon set (no emoji)

const Icon = ({ name, size = 18 }) => {
  const s = { width: size, height: size };
  const stroke = { stroke: "currentColor", fill: "none", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></svg>;
    case "book":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5z"/><path d="M8 7h7M8 11h7"/></svg>;
    case "chart":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2"/></svg>;
    case "trophy":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M7 4h10v4a5 5 0 1 1-10 0V4z"/><path d="M5 6H3v2a3 3 0 0 0 3 3M19 6h2v2a3 3 0 0 1-3 3M9 18h6M12 13v5"/></svg>;
    case "doc":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M14 3H6v18h12V7l-4-4z"/><path d="M14 3v4h4M8 12h8M8 16h5"/></svg>;
    case "settings":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "lock":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "user":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "logout":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h12"/></svg>;
    case "menu":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case "arrow":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "check":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M5 12l5 5L20 7"/></svg>;
    case "x":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "plus":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M12 5v14M5 12h14"/></svg>;
    case "edit":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M4 20h4l11-11-4-4L4 16v4z"/></svg>;
    case "trash":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>;
    case "play":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M7 5l12 7-12 7V5z"/></svg>;
    case "circle":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><circle cx="12" cy="12" r="9"/></svg>;
    case "spark":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"/></svg>;
    case "filter":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></svg>;
    case "search":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>;
    case "shield":
      return <svg viewBox="0 0 24 24" style={s} {...stroke}><path d="M12 3l8 3v6c0 5-4 9-8 9s-8-4-8-9V6l8-3z"/></svg>;
    default: return null;
  }
};

window.Icon = Icon;
