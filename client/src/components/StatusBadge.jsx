/**
 * StatusBadge — reusable badge for donation status
 * Used in Dashboard, Donations, Matches pages
 */
const STATUS_CLASSES = {
  available: 'badge-green',
  matched: 'badge-blue',
  in_transit: 'badge-amber',
  completed: 'badge-gray',
  expired: 'badge-red',
  cancelled: 'badge-red',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`badge ${STATUS_CLASSES[status] || 'badge-gray'}`}
      style={{ textTransform: 'capitalize' }}
    >
      {status?.replace('_', ' ')}
    </span>
  );
}
