export default function SessionStatusBadge({ status }) {
  const complete = status === 'COMPLETED';
  return <span className={`status-badge ${complete ? 'status-completed' : 'status-pending'}`}><span aria-hidden="true" className="status-dot" />{complete ? 'Completed' : 'Pending'}</span>;
}
