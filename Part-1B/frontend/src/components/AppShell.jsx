const nav = [{ path: '#/home', label: 'Today', icon: '◷' }, { path: '#/history', label: 'History', icon: '▤' }];

export default function AppShell({ children, route }) {
  return <div className="app-frame">
    <aside className="sidebar">
      <a href="#/home" className="brand"><span className="brand-mark">f.</span><span>form<span className="brand-light">&function</span></span></a>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="side-nav">{nav.map((item) => <a className={route === item.path.slice(2) ? 'nav-item active' : 'nav-item'} href={item.path} key={item.path}><span className="nav-icon">{item.icon}</span>{item.label}</a>)}</nav>
      <div className="sidebar-bottom"><div className="local-dot" /><span>Local workout history</span><small>AI text goes to your provider</small></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><span className="eyebrow">PERSONAL TRAINING LOG</span><div className="topbar-right"><span className="today-date">{new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span><span className="avatar">Y</span></div></header>
      <div className="page-content">{children}</div>
    </main>
  </div>;
}
