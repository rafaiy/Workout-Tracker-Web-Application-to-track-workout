export default function SetRow({ index, set, onChange, onRemove, canRemove }) {
  return <div className="set-row">
    <span className="set-number">{String(index + 1).padStart(2, '0')}</span>
    <label className="set-input"><span className="sr-only">Set {index + 1} weight in kilograms</span><input type="number" min="0" step="0.1" inputMode="decimal" placeholder="0.0" value={set.weightKg ?? ''} onChange={(e) => onChange(index, 'weightKg', e.target.value)} required /></label>
    <span className="set-multiply">×</span>
    <label className="set-input reps-input"><span className="sr-only">Set {index + 1} reps</span><input type="number" min="1" step="1" inputMode="numeric" placeholder="0" value={set.reps ?? ''} onChange={(e) => onChange(index, 'reps', e.target.value)} required /></label>
    <span className="set-unit">kg · reps</span>
    <button className="remove-set" type="button" aria-label={`Remove set ${index + 1}`} disabled={!canRemove} onClick={() => onRemove(index)}>−</button>
  </div>;
}
