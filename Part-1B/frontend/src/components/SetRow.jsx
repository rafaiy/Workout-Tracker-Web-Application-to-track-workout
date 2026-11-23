export default function SetRow({ index, value, onChange, onRemove, canRemove = true }) {
  return <div className="set-row">
    <span className="set-index">{String(index + 1).padStart(2, '0')}</span>
    <label className="field-wrap"><span>WEIGHT</span><div className="input-suffix"><input aria-label={`Set ${index + 1} weight in kilograms`} type="number" min="0.1" step="0.1" value={value.weightKg} onChange={(e) => onChange({ ...value, weightKg: e.target.value })} /><b>kg</b></div></label>
    <label className="field-wrap"><span>REPS</span><input aria-label={`Set ${index + 1} reps`} type="number" min="1" step="1" value={value.reps} onChange={(e) => onChange({ ...value, reps: e.target.value })} /></label>
    {canRemove && <button className="icon-button remove-set" type="button" aria-label={`Remove set ${index + 1}`} onClick={onRemove}>×</button>}
  </div>;
}
