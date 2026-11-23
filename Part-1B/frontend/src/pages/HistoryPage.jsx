import { useEffect, useState } from 'react';
import { workoutApi } from '../services/apiClient.js';
import SessionCard from '../components/SessionCard.jsx';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  async function load() { try { const data = await workoutApi.sessions(filter === 'ALL' ? undefined : filter); setSessions(data.sessions); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, [filter]);
  async function remove(session) {
    if (!window.confirm(`Delete “${session.title}” and all its exercise sets? This cannot be undone.`)) return;
    try { await workoutApi.deleteSession(session.id); setDeleting(null); await load(); } catch (e) { setError(e.message); }
  }
  return <div className="history-page"><div className="page-heading-row"><div><span className="section-kicker">YOUR WORK, OVER TIME</span><h1>Workout <em>history.</em></h1><p>Every session is part of the progress.</p></div><a href="#/home" className="button button-primary">＋ New workout</a></div>
    <div className="history-controls"><div className="filter-tabs">{['ALL','PENDING','COMPLETED'].map((status) => <button key={status} className={filter === status ? 'selected' : ''} onClick={() => setFilter(status)}>{status === 'ALL' ? 'All sessions' : status === 'PENDING' ? 'Pending' : 'Completed'}</button>)}</div><span>{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {sessions.length ? <div className="history-list">{sessions.map((session, index) => <div className="history-card-wrap" key={session.id}><SessionCard session={session} index={index} onDelete={setDeleting}/>{deleting?.id === session.id && <div className="delete-popover"><p>Delete this session?</p><button onClick={() => remove(session)}>Delete</button><button onClick={() => setDeleting(null)}>Cancel</button></div>}</div>)}</div> : <div className="history-empty"><span>▤</span><h2>No sessions here yet.</h2><p>Your workouts will appear here as soon as you log them.</p></div>}
  </div>;
}
