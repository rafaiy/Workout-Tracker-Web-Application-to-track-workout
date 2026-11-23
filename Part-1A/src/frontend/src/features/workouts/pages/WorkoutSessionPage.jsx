import ExerciseEntryForm from '../components/ExerciseEntryForm.jsx';

export default function WorkoutSessionPage({ session, exercises, onSaveExercise, onComplete, busy }) {
  return <main className="workout-layout">
    <section className="workout-main">
      <div className="page-kicker"><span className="live-dot" /> WORKOUT IN PROGRESS</div>
      <h1>{session?.title || 'Your workout'}</h1>
      <p className="page-subtitle">Stay in the moment. Log each set as you go.</p>
      <div className="session-summary"><div><span className="eyebrow">STARTED</span><strong>{session ? new Date(session.startedAt).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Just now'}</strong></div><div><span className="eyebrow">STATUS</span><strong className="text-pending">Pending</strong></div><div><span className="eyebrow">EXERCISES</span><strong>{session?.exercises?.length || 0} added</strong></div></div>
      <div className="logged-exercises"><div className="section-heading"><div><span className="eyebrow">YOUR SESSION</span><h2>Exercises</h2></div><span className="count-pill">{session?.exercises?.length || 0}</span></div>
        {session?.exercises?.length ? session.exercises.map((exercise, i) => <article className="logged-exercise" key={exercise.id}><span className="exercise-index">{String(i + 1).padStart(2, '0')}</span><div className="logged-exercise-content"><strong>{exercise.name}</strong><div className="logged-set-chips">{exercise.sets.map((set) => <span key={set.id || set.setNumber}>{set.weightKg.toFixed(1)} kg <i>×</i> {set.reps}</span>)}</div></div></article>) : <div className="empty-exercises"><div className="empty-icon">↘</div><p>Your session is ready.</p><span>Add your first exercise below.</span></div>}
      </div>
      <ExerciseEntryForm exercises={exercises} onSave={onSaveExercise} />
    </section>
    <aside className="workout-aside"><div className="aside-art"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><span>01</span><small>SHOW UP<br/>FOR YOURSELF</small></div><div className="aside-note"><span className="eyebrow">A SMALL REMINDER</span><p>Progress is built one <em>good rep</em> at a time.</p><span className="note-mark">✳</span></div><button className="finish-button" onClick={onComplete} disabled={busy}>{busy ? 'Saving…' : 'Finish workout'}<span aria-hidden="true">✓</span></button><p className="finish-caption">You can always keep a session pending and come back later.</p></aside>
  </main>;
}
