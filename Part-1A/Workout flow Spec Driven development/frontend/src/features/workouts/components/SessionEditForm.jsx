import { useState } from 'react';

function localValue(iso) {
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function withOffset(value) {
  const date = new Date(value);
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${value}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

export default function SessionEditForm({ session, onSave, onCancel }) {
  const [title, setTitle] = useState(session.title);
  const [startedAt, setStartedAt] = useState(localValue(session.startedAt));
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setError('');
    if (!title.trim() || !startedAt) { setError('Enter a title and start date/time.'); return; }
    try { await onSave({ title: title.trim(), startedAt: withOffset(startedAt) }); }
    catch (err) { setError(err.message); }
  }
  return <form className="session-edit-form" onSubmit={submit}>
    <label>Session title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
    <label>Start date and time<input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="edit-actions"><button className="primary-button">Save changes</button><button className="secondary-button" type="button" onClick={onCancel}>Cancel</button></div>
  </form>;
}
