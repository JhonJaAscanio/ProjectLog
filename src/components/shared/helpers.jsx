import useStore from '../../store/useStore';

const STATUS_COLOR = {
  'Pendiente': '#8b8bff',
  'En Proceso': '#38bdf8',
  'En Revisión': '#f59e0b',
  'Completada': '#4ade80',
  'Cancelada': '#6b7280',
};

const PRIORITY_COLOR = { Alta: '#ef4444', Media: '#f97316', Baja: '#22c55e' };
const PRIORITY_ICON = { Alta: '🔴', Media: '🟠', Baja: '🟢' };

function StatusBadge({ status }) {
  const cls = { 'Pendiente': 'pending', 'En Proceso': 'progress', 'En Revisión': 'review', 'Completada': 'done', 'Cancelada': 'cancelled' };
  return <span className={`badge badge-${cls[status] || 'pending'}`}>● {status}</span>;
}
function PriorityBadge({ priority }) {
  const cls = { Alta: 'high', Media: 'medium', Baja: 'low' };
  return <span className={`badge badge-${cls[priority] || 'medium'}`}>{PRIORITY_ICON[priority]} {priority}</span>;
}

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace unos segundos';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

function formatDate(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

function getDueClass(dueDate, status) {
  if (!dueDate || status === 'Completada' || status === 'Cancelada') return '';
  const now = new Date();
  const due = new Date(dueDate);
  const diff = (due - now) / (1000 * 3600 * 24);
  if (diff < 0) return 'overdue';
  if (diff < 3) return 'due-soon';
  return '';
}

export { StatusBadge, PriorityBadge, formatTimeAgo, formatDate, getDueClass, STATUS_COLOR, PRIORITY_COLOR, PRIORITY_ICON };
