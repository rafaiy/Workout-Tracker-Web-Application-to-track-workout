import StatusBadge from './StatusBadge.jsx';
import { formatSessionDate } from '../services/localTime.js';

export default function SessionCard({ session, index, onDelete }) {
  return <article className="history-card"><span className="history-index">{String(index + 1).padStart(2,'0')}</span><a href={`#/session/${session.id}`} className="history-main"><span className="section-kicker">{session.timeOfDay.toUpperCase()} · {formatSessionDate(session.startedAt, session.timeZone)}</span><h3>{session.title}</h3><span className="history-meta">{session.exerciseCount} {session.exerciseCount === 1 ? 'exercise' : 'exercises'} <i>·</i> {session.status === 'PENDING' ? 'Resume your workout' : 'View session details'}</span></a><StatusBadge status={session.status}/><button className="icon-button history-delete" aria-label={`Delete ${session.title}`} onClick={() => onDelete(session)}>···</button></article>;
}
