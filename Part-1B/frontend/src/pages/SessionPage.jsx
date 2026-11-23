import { useEffect, useState } from 'react';
import { workoutApi } from '../services/apiClient.js';
import { formatSessionDate } from '../services/localTime.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ExerciseEditor from '../components/ExerciseEditor.jsx';

export default function SessionPage({ id }) {
  const [session, setSession] = useState(null);
  const [title, setTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function load() {
    try { const [s, c] = await Promise.all([workoutApi.session(id), workoutApi.exercises()]); setSession(s.session); setTitle(s.session.title); setCatalog(c.exercises); }
    catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [id]);
  async function saveExercise(input) {
    setBusy(true); setError('');
    try {
      if (editing) await workoutApi.updateExercise(id, editing.id, input);
      else await workoutApi.addExercise(id, input);
      setEditing(null); setShowEditor(false); await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function saveTitle(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await workoutApi.updateSession(id, { title }); setSession((current) => ({ ...current, ...result.session })); setEditingTitle(false); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function removeExercise(exerciseId) {
    if (!window.confirm('Remove this exercise and its sets?')) return;
    try { await workoutApi.deleteExercise(id, exerciseId); await load(); } catch (e) { setError(e.message); }
  }
  async function complete() {
    setBusy(true);
    try { const data = await workoutApi.complete(id); setSession(data.session); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  if (!session) return <div className="loading-state">{error || 'Loading your workout…'}</div>;
  return <div className="session-page">
    <a className="back-link" href="#/home">← Back to today</a>
    <div className="session-title-row"><div><span className="section-kicker">{session.timeOfDay.toUpperCase()} SESSION · {formatSessionDate(session.startedAt, session.timeZone)}</span>{editingTitle ? <form className="rename-form" onSubmit={saveTitle}><input aria-label="Session name" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} /><button className="button button-primary" disabled={busy}>Save name</button><button className="button button-quiet" type="button" onClick={() => { setTitle(session.title); setEditingTitle(false); }}>Cancel</button></form> : <div className="title-edit-row"><h1>{session.title}</h1><button className="text-action" onClick={() => setEditingTitle(true)}>Rename</button></div>}<p>Keep your focus on the next rep.</p></div><StatusBadge status={session.status}/></div>
    <section className="session-stats"><div><strong>{String(session.exercises.length).padStart(2,'0')}</strong><span>EXERCISES</span></div><div><strong>{session.exercises.reduce((n, e) => n + e.sets.length, 0)}</strong><span>TOTAL SETS</span></div><div><strong>{session.status === 'PENDING' ? 'IN FLOW' : 'DONE'}</strong><span>SESSION STATUS</span></div></section>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="session-content-grid"><div className="exercise-stack">
      {session.exercises.map((item, index) => <article className="logged-exercise" key={item.id}><div className="logged-exercise-head"><span className="exercise-number">{String(index + 1).padStart(2,'0')}</span><div><span className="section-kicker">{item.exercise.muscleGroup.toUpperCase()}</span><h3>{item.exercise.name}</h3></div><div className="exercise-actions"><button className="text-action" onClick={() => { setEditing(item); setShowEditor(true); window.scrollTo({top:0,behavior:'smooth'}); }}>Edit</button><button className="text-action danger-action" onClick={() => removeExercise(item.id)}>Remove</button></div></div><div className="logged-set-list">{item.sets.map((set) => <div className="logged-set" key={set.setNumber}><span>Set {String(set.setNumber).padStart(2,'0')}</span><b>{set.weightKg} <small>kg</small></b><span>×</span><b>{set.reps} <small>reps</small></b></div>)}</div></article>)}
      {session.exercises.length === 0 && <div className="empty-exercises"><span>＋</span><h3>Your workout begins with one movement.</h3><p>Select an exercise and add the sets you completed.</p></div>}
      {showEditor && <ExerciseEditor exercises={catalog} existingExercise={editing} onSave={saveExercise} onCancel={() => { setShowEditor(false); setEditing(null); }} />}
      {!showEditor && <button className="add-exercise-card" onClick={() => setShowEditor(true)}><span>＋</span><b>Add an exercise</b><small>Choose from your exercise catalog</small></button>}
    </div><aside className="session-side-card"><span className="section-kicker">SESSION NOTE</span><div className="side-card-art">✳</div><h3>Consistency<br/>beats intensity.</h3><p>Every completed set is another promise kept to yourself.</p><div className="side-divider"/><span className="local-note">SAVED ON THIS DEVICE</span></aside></div>
    <div className="session-bottom-actions"><a className="button button-quiet" href="#/history">Save for later</a>{session.status === 'PENDING' && <button className="button button-primary" disabled={busy || !session.exercises.length} onClick={complete}>{busy ? 'Saving…' : 'Complete workout'} <span>✓</span></button>}{session.status === 'COMPLETED' && <span className="completion-note">Workout completed · {session.completedAt ? new Date(session.completedAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) : ''}</span>}</div>
  </div>;
}
