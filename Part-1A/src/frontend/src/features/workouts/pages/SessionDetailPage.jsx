import { useEffect, useState } from 'react';
import { navigate } from '../../../app/routes.js';
import SessionStatusBadge from '../components/SessionStatusBadge.jsx';
import SessionEditForm from '../components/SessionEditForm.jsx';
import ExerciseSetEditForm from '../components/ExerciseSetEditForm.jsx';

export default function SessionDetailPage({ session, onResume, onRename, onDelete, onSaveSets, onDeleteExercise }) {
  const [editing, setEditing] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => setEditingExercise(null), [session?.id]);
  if (!session) return <main className="history-page"><button className="back-link" onClick={() => navigate('/')}>← History</button><div className="history-empty"><h3>Session not found</h3><button className="primary-button" onClick={() => navigate('/')}>Back to history</button></div></main>;
  const date = new Date(session.startedAt);
  return <main className="detail-page">
    <button className="back-link" onClick={() => navigate('/')}>← All sessions</button>
    <div className="detail-header"><div><div className="page-kicker">{session.timeOfDayLabel}</div><h1>{session.title}</h1><p className="page-subtitle">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p></div><SessionStatusBadge status={session.status}/></div>
    <div className="detail-actions">{session.status === 'PENDING' && <button className="primary-button" onClick={onResume}>Resume workout <span>↗</span></button>}<button className="secondary-button" onClick={() => setEditing((v) => !v)}>{editing ? 'Close edit' : 'Edit session'}</button><button className="danger-button" onClick={() => setConfirmDelete(true)}>Delete session</button></div>
    {editing && <SessionEditForm session={session} onSave={async (fields) => { await onRename(fields); setEditing(false); }} onCancel={() => setEditing(false)} />}
    {confirmDelete && <div className="confirm-banner" role="alertdialog" aria-label="Confirm delete"><span>Delete this session and its exercise history?</span><button className="danger-button" autoFocus onClick={onDelete}>Delete</button><button className="secondary-button" onClick={() => setConfirmDelete(false)}>Cancel</button></div>}
    <section className="detail-exercises"><div className="section-heading"><div><span className="eyebrow">SESSION DETAILS</span><h2>Exercises <span>{session.exercises.length}</span></h2></div></div>{session.exercises.length ? session.exercises.map((ex, index) => <article className="detail-exercise" key={ex.id}><div className="detail-ex-title"><span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><strong>{ex.name}</strong><span>{ex.sets.length} sets</span></div><div className="detail-set-table"><div className="detail-set-head"><span>SET</span><span>WEIGHT</span><span>REPS</span></div>{ex.sets.map((set) => <div className="detail-set-row" key={set.id}><span>{String(set.setNumber).padStart(2, '0')}</span><strong>{set.weightKg.toFixed(1)} <small>kg</small></strong><strong>{set.reps} <small>reps</small></strong></div>)}</div><div className="exercise-maintenance"><button className="secondary-button" onClick={() => setEditingExercise(editingExercise === ex.id ? null : ex.id)}>Edit sets</button><button className="danger-button" onClick={() => onDeleteExercise(ex.id)}>Remove exercise</button></div>{editingExercise === ex.id && <ExerciseSetEditForm exercise={ex} onSave={async (sets) => { await onSaveSets(ex.id, sets); setEditingExercise(null); }} onCancel={() => setEditingExercise(null)} />}</article>) : <div className="empty-exercises"><p>No exercises in this session.</p></div>}</section>
  </main>;
}
