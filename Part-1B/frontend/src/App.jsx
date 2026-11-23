import { useEffect, useState } from 'react';
import AppShell from './components/AppShell.jsx';
import HomePage from './pages/HomePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SessionPage from './pages/SessionPage.jsx';

function currentRoute() { return window.location.hash.replace(/^#\/?/, '') || 'home'; }

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => { const change = () => setRoute(currentRoute()); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  const [page, id] = route.split('/');
  return <AppShell route={page}><div key={route} className="page-enter">{page === 'history' ? <HistoryPage /> : page === 'session' && id ? <SessionPage id={id} /> : <HomePage />}</div></AppShell>;
}
