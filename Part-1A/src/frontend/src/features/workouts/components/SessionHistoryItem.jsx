import SessionStatusBadge from './SessionStatusBadge.jsx';

export default function SessionHistoryItem({ session, onOpen }) {
  const date = new Date(session.startedAt);
  return <button className="session-card" onClick={() => onOpen(session.id)}>
    <div className="session-card-top"><span className="session-date">{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span><SessionStatusBadge status={session.status} /></div>
    <div className="session-card-title">{session.title}</div>
    <div className="session-card-bottom"><span>{session.timeOfDayLabel}</span><span>{date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></div>
    <span className="session-arrow" aria-hidden="true">↗</span>
  </button>;
}
