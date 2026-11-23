import { useEffect, useState } from 'react';
import SetRow from './SetRow.jsx';

const freshSets = () => [{ setNumber: 1, weightKg: '', reps: '' }, { setNumber: 2, weightKg: '', reps: '' }, { setNumber: 3, weightKg: '', reps: '' }];

export default function ExerciseEntryForm({ exercises, onSave }) {
  const [exerciseId, setExerciseId] = useState('');
  const [sets, setSets] = useState(freshSets);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!exerciseId && exercises.length) setExerciseId(String(exercises[0].id)); }, [exercises, exerciseId]);
  function changeSet(index, field, value) { setSets((current) => current.map((set, i) => i === index ? { ...set, [field]: value } : set)); }
  function removeSet(index) { if (sets.length > 1) setSets((current) => current.filter((_, i) => i !== index).map((set, i) => ({ ...set, setNumber: i + 1 }))); }
  function addSet() { setSets((current) => [...current, { setNumber: current.length + 1, weightKg: '', reps: '' }]); }
  async function submit(event) {
    event.preventDefault(); setError('');
    if (sets.some((s) => s.weightKg === '' || s.reps === '')) { setError('Enter both weight and reps for every set.'); return; }
    const parsed = sets.map((s, i) => ({ setNumber: i + 1, weightKg: Number(s.weightKg), reps: Number(s.reps) }));
    if (!exerciseId) { setError('Choose an exercise.'); return; }
    if (parsed.some((s) => s.weightKg < 0 || !Number.isFinite(s.weightKg) || Math.abs(s.weightKg * 10 - Math.round(s.weightKg * 10)) > 1e-7)) { setError('Enter each weight in 0.1 kg increments.'); return; }
    if (parsed.some((s) => !Number.isInteger(s.reps) || s.reps < 1)) { setError('Reps must be a positive whole number.'); return; }
    setSaving(true);
    try { await onSave(Number(exerciseId), parsed); setSets(freshSets()); }
    catch (e) { setError(e.message || 'Could not save exercise.'); }
    finally { setSaving(false); }
  }
  return <form className="exercise-form" noValidate onSubmit={submit}>
    <div className="form-heading"><div><span className="eyebrow">NEW MOVEMENT</span><h3>Add an exercise</h3></div><span className="default-chip">3 sets by default</span></div>
    <label className="field-label" htmlFor="exercise-choice">Exercise</label>
    <select id="exercise-choice" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
      {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
    </select>
    <div className="sets-label-row"><span className="eyebrow">SET</span><span className="eyebrow weight-heading">WEIGHT</span><span className="eyebrow reps-heading">REPS</span></div>
    <div className="set-list">{sets.map((set, index) => <SetRow key={index} index={index} set={set} onChange={changeSet} onRemove={removeSet} canRemove={sets.length > 1} />)}</div>
    <button className="add-set-button" type="button" onClick={addSet}>＋ Add another set</button>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button save-exercise" type="submit" disabled={saving || !exercises.length}>{saving ? 'Saving…' : 'Add exercise to session'}<span aria-hidden="true">↗</span></button>
  </form>;
}
