export default function StatusBadge({ status }) {
  const pending = status === 'PENDING';
  return <span className={`status-badge ${pending ? 'status-pending' : 'status-completed'}`}><i />{pending ? 'Pending' : 'Completed'}</span>;
}
