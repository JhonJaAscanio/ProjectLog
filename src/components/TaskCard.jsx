import { useState } from 'react';
import useStore, { DEFAULT_COLUMNS, PRIORITIES } from '../store/useStore';
import { useToast, Modal } from './shared/UIKit';
import { StatusBadge, PriorityBadge, formatDate, getDueClass, PRIORITY_COLOR } from './shared/helpers';
import { Dropdown, DropdownItem } from './shared/UIKit';

const TAGS_PRESETS = ['Bug', 'Feature', 'UX', 'Backend', 'Frontend', 'Documentación', 'Research', 'Diseño'];

function TaskForm({ task, projectId, onClose }) {
  const { addTask, updateTask, projects } = useStore();
  const project = projects.find(p => p.id === projectId);
  const columns = project?.columns || DEFAULT_COLUMNS;
  const toast = useToast();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Media',
    status: task?.status || 'Pendiente',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    tags: task?.tags || [],
  });
  const [tagInput, setTagInput] = useState('');

  const addTag = (t) => {
    const tag = t || tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput('');
  };
  const removeTag = (t) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const payload = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null };
    if (task?.id) { updateTask(projectId, task.id, payload); toast('Tarea actualizada', 'success'); }
    else { addTask(projectId, payload); toast('Tarea creada', 'success'); }
    onClose();
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Título *</label>
        <input className="form-input" placeholder="¿Qué hay que hacer?" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
      </div>
      <div className="form-group">
        <label className="form-label">Descripción</label>
        <textarea className="form-textarea" rows={3} placeholder="Detalles adicionales..."
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Prioridad</label>
          <select className="form-select" value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Estado</label>
          <select className="form-select" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Fecha límite</label>
        <input className="form-input" type="date" value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Etiquetas</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {TAGS_PRESETS.map((t) => (
            <button key={t} className={`filter-pill${form.tags.includes(t) ? ' active' : ''}`}
              style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => form.tags.includes(t) ? removeTag(t) : addTag(t)}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="form-input" placeholder="Etiqueta personalizada..."
            value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTag(); }} />
          <button className="btn btn-ghost btn-sm" onClick={() => addTag()}>+</button>
        </div>
        {form.tags.length > 0 && (
          <div className="task-card-tags" style={{ marginTop: 8, paddingLeft: 0 }}>
            {form.tags.map((t) => (
              <span key={t} className="tag" onClick={() => removeTag(t)} style={{ cursor: 'pointer' }}>
                {t} ×
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.title.trim()}>
          {task ? 'Guardar Cambios' : 'Crear Tarea'}
        </button>
      </div>
    </>
  );
}

function TaskDetailModal({ task, projectId, onClose }) {
  const { addComment, deleteTask, duplicateTask, projects } = useStore();
  const project = projects.find(p => p.id === projectId);
  const column = (project?.columns || []).find(c => c.id === task?.status);
  const statusName = column ? column.name : task?.status;
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const toast = useToast();

  if (!task) return null;

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(projectId, task.id, commentText);
    setCommentText('');
  };

  const handleDelete = () => {
    deleteTask(projectId, task.id);
    toast('Tarea eliminada', 'info');
    onClose();
  };

  const handleDuplicate = () => {
    duplicateTask(projectId, task.id);
    toast('Tarea duplicada', 'success');
    onClose();
  };

  const dueClass = getDueClass(task.dueDate, statusName);

  if (editing) {
    return (
      <Modal open onClose={() => setEditing(false)} title="Editar Tarea" large>
        <TaskForm task={task} projectId={projectId} onClose={() => setEditing(false)} />
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title={task.title} large
      footer={
        <>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Eliminar</button>
          <button className="btn btn-ghost btn-sm" onClick={handleDuplicate}>⎘ Duplicar</button>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>✏️ Editar</button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <StatusBadge status={task.status} projectId={projectId} />
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={`task-card-date ${dueClass}`}>
            📅 {dueClass === 'overdue' ? '⚠️ Vencida: ' : ''}{formatDate(task.dueDate)}
          </span>
        )}
      </div>
      {task.description && (
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16, background: 'var(--bg-card)', padding: '12px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          {task.description}
        </div>
      )}
      {task.tags?.length > 0 && (
        <div className="task-card-tags" style={{ paddingLeft: 0, marginBottom: 16 }}>
          {task.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div className="form-label" style={{ marginBottom: 8 }}>💬 Comentarios</div>
        <div className="comment-list">
          {(task.comments || []).length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin comentarios aún</div>
          )}
          {(task.comments || []).map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-text">{c.text}</div>
              <div className="comment-time">{new Date(c.createdAt).toLocaleString('es')}</div>
            </div>
          ))}
        </div>
        <div className="comment-input-row">
          <input placeholder="Agregar comentario..." value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()} />
          <button className="btn btn-primary btn-sm" onClick={handleComment}>Enviar</button>
        </div>
      </div>
    </Modal>
  );
}

export function TaskCard({ task, projectId }) {
  const { deleteTask, duplicateTask, projects } = useStore();
  const project = projects.find(p => p.id === projectId);
  const column = (project?.columns || []).find(c => c.id === task?.status);
  const statusName = column ? column.name : task?.status;
  
  const [showDetail, setShowDetail] = useState(false);
  const toast = useToast();

  const dueClass = getDueClass(task.dueDate, statusName);
  const priorityColors = { Alta: '#ef4444', Media: '#f97316', Baja: '#22c55e' };

  return (
    <>
      <div className="task-card" onClick={() => setShowDetail(true)}>
        <div className="task-card-priority-bar" style={{ background: priorityColors[task.priority] || '#6366f1' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div className="task-card-title">{task.title}</div>
          <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
            <Dropdown trigger={
              <button className="task-action-btn" title="Más opciones">⋯</button>
            }>
              <DropdownItem icon="✏️" onClick={() => setShowDetail(true)}>Editar</DropdownItem>
              <DropdownItem icon="⎘" onClick={() => { duplicateTask(projectId, task.id); toast('Tarea duplicada', 'success'); }}>Duplicar</DropdownItem>
              <div className="dropdown-divider" />
              <DropdownItem icon="🗑" danger onClick={() => { deleteTask(projectId, task.id); toast('Tarea eliminada', 'info'); }}>Eliminar</DropdownItem>
            </Dropdown>
          </div>
        </div>
        {task.description && <div className="task-card-desc">{task.description}</div>}
        {task.tags?.length > 0 && (
          <div className="task-card-tags">
            {task.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
            {task.tags.length > 3 && <span className="tag">+{task.tags.length - 3}</span>}
          </div>
        )}
        <div className="task-card-meta">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className={`task-card-date ${dueClass}`}>
              📅 {dueClass === 'overdue' ? '⚠️ ' : ''}{formatDate(task.dueDate)}
            </span>
          )}
          {(task.comments?.length > 0) && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>💬 {task.comments.length}</span>
          )}
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal task={task} projectId={projectId} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

export function AddTaskButton({ projectId, defaultStatus }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginTop: 4 }}
        onClick={() => setOpen(true)}>
        ＋ Agregar tarea
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nueva Tarea">
        <TaskForm
          projectId={projectId}
          task={defaultStatus ? { status: defaultStatus } : null}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
