import { useState } from 'react';

export default function ExerciseSetEditForm({ exercise, onSave, onCancel }) {
  const [sets, setSets] = useState(exercise.sets.map(({ setNumber, weightKg, reps }) => ({ setNumber, weightKg: String(weightKg), reps: String(reps) })));
  const [error, setError] = useState('');
  function change(index, key, value) { setSets((all) => all.map((s, i) => i === index ? { ...s, [key]: value } : s)); }
  function remove(index) { if (sets.length > 1) setSets((all) => all.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 }))); }
  function add() { setSets((all) => [...all, { setNumber: all.length + 1, weightKg: '', reps: '' }]); }
  async function submit(e) {
    e.preventDefault(); setError('');
    if (sets.some((s) => s.weightKg === '' || s.reps === '')) { setError('Enter weight and reps for each set.'); return; }
    const normalized = sets.map((s, i) => ({ setNumber: i + 1, weightKg: Number(s.weightKg), reps: Number(s.reps) }));
    if (normalized.some((s) => !Number.isFinite(s.weightKg) || s.weightKg < 0 || Math.abs(s.weightKg * 10 - Math.round(s.weightKg * 10)) > 1e-7)) { setError('Weight must use 0.1 kg increments.'); return; }
    if (normalized.some((s) => !Number.isInteger(s.reps) || s.reps < 1)) { setError('Reps must be a positive whole number.'); return; }
    try { await onSave(normalized); } catch (err) { setError(err.message); }
  }
  return <form className="set-edit-form" noValidate onSubmit={submit}>
    {sets.map((set, i) => <div className="edit-set-line" key={i}><span>Set {i + 1}</span><input aria-label={`Edit set ${i + 1} weight`} type="number" min="0" step="0.1" value={set.weightKg} onChange={(e) => change(i, 'weightKg', e.target.value)} /><input aria-label={`Edit set ${i + 1} reps`} type="number" min="1" step="1" value={set.reps} onChange={(e) => change(i, 'reps', e.target.value)} /><button className="remove-set" type="button" disabled={sets.length <= 1} onClick={() => remove(i)} aria-label={`Remove edited set ${i + 1}`}>−</button></div>)}
    <button className="add-set-button" type="button" onClick={add}>＋ Add another set</button>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="edit-actions"><button className="primary-button">Save sets</button><button className="secondary-button" type="button" onClick={onCancel}>Cancel</button></div>
  </form>;
}
