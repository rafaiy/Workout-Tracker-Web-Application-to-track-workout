import { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import { formatSessionDate } from '../services/localTime.js';

export default function NlpParserInput({ onSubmit, loading = false, result = null, error = '' }) {
  const [text, setText] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  useEffect(() => {
    if (result?.outcome === 'saved') { setText(''); setSelectedSessionId(''); }
    if (result?.outcome !== 'choose_session') setSelectedSessionId('');
  }, [result]);

  function submit(event, target = undefined) {
    event.preventDefault();
    if (!text.trim() || loading) return;
    onSubmit({ text: text.trim(), ...(target ? { targetSessionId: Number(target) } : {}) });
  }

  return <section className="quick-start card-surface">
    <div className="section-heading"><div><span className="section-kicker">QUICK LOG</span><h2>What did you train?</h2></div><span className="ai-chip"><span>✳</span> SMART ENTRY</span></div>
    <form onSubmit={submit} className="nlp-form"><textarea aria-label="Describe your workout" rows="2" value={text} onChange={(e) => setText(e.target.value)} placeholder={'Try “I did 3 sets of chest press at 50kg for 10 reps”'} /><div className="nlp-bottom"><span className="input-hint">Your sentence goes to your configured AI provider; values are checked before saving.</span><button className="button button-dark" type="submit" disabled={loading || !text.trim()}>{loading ? 'Checking…' : 'Log workout'} <span>↗</span></button></div></form>
    {result?.outcome === 'saved' && <div className="notice success" role="status"><span className="notice-icon">✓</span><span>{result.exercise.name} added to your {result.created ? 'new' : 'existing'} workout.</span></div>}
    {result?.outcome === 'needs_clarification' && <div className="notice clarify" role="status"><span className="notice-icon">✳</span><span>{result.message}</span></div>}
    {result?.outcome === 'choose_session' && <div className="session-choices"><p>{result.message} Nothing is saved until you select one.</p>{result.matches.map((match) => <button key={match.sessionId} className={`choice-card ${Number(selectedSessionId) === match.sessionId ? 'chosen' : ''}`} onClick={() => setSelectedSessionId(String(match.sessionId))} type="button"><span><b>{match.title}</b><small>{formatSessionDate(match.startedAt, match.timeZone)}</small></span><StatusBadge status={match.status}/></button>)}{selectedSessionId && <button className="button button-primary" onClick={(event) => submit(event, selectedSessionId)} disabled={loading}>Add to selected workout ↗</button>}</div>}
    {error && <p className="form-error" role="alert">{error} Edit the sentence and try again, or start a workout manually.</p>}
  </section>;
}
