import { useEffect, useState } from 'react';
import { workoutApi } from '../services/apiClient.js';
import { captureLocalTime, formatSessionDate } from '../services/localTime.js';
import StatusBadge from '../components/StatusBadge.jsx';
import NlpParserInput from '../components/NlpParserInput.jsx';

export default function HomePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function load() { try { const data = await workoutApi.sessions(); setSessions(data.sessions); } catch { setSessions([]); } }
  useEffect(() => { load(); }, []);

  async function startWorkout() {
    const local = captureLocalTime();
    try {
      const { session } = await workoutApi.createSession({ startedAt: local.instant, timeZone: local.timeZone });
      window.location.hash = `#/session/${session.id}`;
    } catch (e) { setError(e.message); }
  }

  async function submit({ text, targetSessionId }) {
    setLoading(true); setError(''); setResult(null);
    try {
      const local = captureLocalTime();
      const parsed = await workoutApi.parse({ text, timeZone: local.timeZone, submittedAt: local.instant, ...(targetSessionId ? { targetSessionId } : {}) });
      setResult(parsed);
      if (parsed.outcome === 'saved') { await load(); window.location.hash = `#/session/${parsed.sessionId}`; }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const pending = sessions.filter((item) => item.status === 'PENDING');
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  return <div className="home-page">
    <section className="welcome-row"><div><span className="section-kicker">YOUR TRAINING, IN RHYTHM</span><h1>Make today<br /><em>count.</em></h1><p className="welcome-copy">A little progress, repeated consistently.</p></div><div className="welcome-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span>01</span><small>SHOW UP</small></div></section>
    <NlpParserInput onSubmit={submit} loading={loading} result={result} error={error} />
    <section className="today-row"><div className="today-copy"><span className="section-kicker">{today.toUpperCase()}</span><h2>Your next session<br />starts <em>here.</em></h2><button className="button button-primary" onClick={startWorkout}>Start a workout <span>↗</span></button></div><div className="today-panel"><div className="panel-top"><div><span className="section-kicker">IN PROGRESS</span><h3>{pending.length ? `${pending.length} pending workout${pending.length > 1 ? 's' : ''}` : 'A clean slate'}</h3></div><span className="panel-illustration">↗</span></div>{pending.length ? pending.slice(0, 2).map((session) => <a className="pending-row" href={`#/session/${session.id}`} key={session.id}><span className="pending-mark">↗</span><span><b>{session.title}</b><small>{formatSessionDate(session.startedAt, session.timeZone)}</small></span><StatusBadge status={session.status}/></a>) : <p className="empty-note">Start a workout or describe what you trained to begin.</p>}</div></section>
    <div className="home-footer"><span>MOVE WITH INTENTION</span><span>LOCAL HISTORY · CONFIGURED PROVIDER PARSING</span></div>
  </div>;
}
