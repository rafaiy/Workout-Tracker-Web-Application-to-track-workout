import { useEffect, useState } from 'react';
import SetRow from './SetRow.jsx';

const blankSets = (count = 3) => Array.from({ length: count }, () => ({ weightKg: '', reps: '' }));

export default function ExerciseEditor({ exercises = [], onSave, onCancel, existingExercise }) {
  const [exerciseId, setExerciseId] = useState(existingExercise?.exercise?.id ?? exercises[0]?.id ?? '');
  const [sets, setSets] = useState(existingExercise ? existingExercise.sets.map(({ weightKg, reps }) => ({ weightKg: String(weightKg), reps: String(reps) })) : blankSets());
  const [error, setError] = useState('');
  useEffect(() => { if (!exerciseId && exercises[0]) setExerciseId(exercises[0].id); }, [exerciseId, exercises]);

  function updateSet(index, next) { setSets((all) => all.map((set, i) => i === index ? next : set)); }
  function submit(event) {
    event.preventDefault(); setError('');
    const normalized = sets.map((set) => ({ weightKg: Number(set.weightKg), reps: Number(set.reps) }));
    const badIndex = normalized.findIndex((set) => !Number.isFinite(set.weightKg) || set.weightKg <= 0 || !Number.isInteger(set.reps) || set.reps <= 0);
    if (badIndex >= 0) { setError(`Set ${badIndex + 1}: enter a weight greater than 0 kg and a whole number of reps greater than 0.`); return; }
    if (!exerciseId) { setError('Choose an exercise from the catalog.'); return; }
    onSave({ exerciseId: Number(exerciseId), sets: normalized });
  }

  return <form className="exercise-editor" onSubmit={submit}>
    <div className="editor-heading"><div><span className="section-kicker">{existingExercise ? 'EDIT MOVEMENT' : 'ADD MOVEMENT'}</span><h3>{existingExercise ? 'Update your sets' : 'Build your exercise'}</h3></div><span className="set-count-pill">{sets.length} sets</span></div>
    <label className="field-wrap exercise-select"><span>EXERCISE</span><select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>{exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select></label>
    <div className="set-table-heading"><span>SET</span><span>LOAD</span><span>REPS</span><span /></div>
    <div className="sets-list">{sets.map((set, i) => <SetRow key={i} index={i} value={set} onChange={(next) => updateSet(i, next)} onRemove={() => setSets((all) => all.filter((_, index) => index !== i))} canRemove={sets.length > 1} />)}</div>
    <button className="add-set-button" type="button" onClick={() => setSets((all) => [...all, { weightKg: '', reps: '' }])}><span>＋</span> Add another set</button>
    {error && <p className="inline-error" role="alert">{error}</p>}
    <div className="editor-actions"><button className="button button-primary" type="submit">{existingExercise ? 'Save changes' : 'Add exercise'} <span>↗</span></button>{onCancel && <button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}
