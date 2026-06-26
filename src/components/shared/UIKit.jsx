import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{icons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ---- Dropdown Component ----
export function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>{trigger}</div>
      {open && <div className="dropdown-menu" onClick={() => setOpen(false)}>{children}</div>}
    </div>
  );
}

export function DropdownItem({ icon, children, onClick, danger }) {
  return (
    <button className={`dropdown-item${danger ? ' danger' : ''}`} onClick={onClick}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {children}
    </button>
  );
}

// ---- Modal Component ----
export function Modal({ open, onClose, title, children, footer, large }) {
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal${large ? ' modal-lg' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="icon-btn btn" onClick={onClose} style={{ width: 30, height: 30 }}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ---- Badge helpers ----
const STATUS_CLASS = {
  'Pendiente': 'pending',
  'En Proceso': 'progress',
  'En Revisión': 'review',
  'Completada': 'done',
  'Cancelada': 'cancelled',
};
const PRIORITY_CLASS = { Alta: 'high', Media: 'medium', Baja: 'low' };
const PRIORITY_COLOR = { Alta: '#ef4444', Media: '#f97316', Baja: '#22c55e' };
const PRIORITY_ICON = { Alta: '🔴', Media: '🟠', Baja: '🟢' };
const STATUS_COLOR = {
  'Pendiente': '#8b8bff',
  'En Proceso': '#38bdf8',
  'En Revisión': '#f59e0b',
  'Completada': '#4ade80',
  'Cancelada': '#6b7280',
};

export function StatusBadge({ status }) {
  return <span className={`badge badge-${STATUS_CLASS[status] || 'pending'}`}>● {status}</span>;
}
export function PriorityBadge({ priority }) {
  return <span className={`badge badge-${PRIORITY_CLASS[priority] || 'medium'}`}>{PRIORITY_ICON[priority]} {priority}</span>;
}
export { PRIORITY_COLOR, STATUS_COLOR, STATUS_CLASS };
