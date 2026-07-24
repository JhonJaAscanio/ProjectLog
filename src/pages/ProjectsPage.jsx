import { useState } from 'react';
import useStore from '../store/useStore';
import { useToast, Modal } from '../components/shared/UIKit';
import { PROJECT_COLORS, PROJECT_ICONS } from '../store/useStore';
import { StatusBadge, PriorityBadge } from '../components/shared/helpers';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ProjectsPage({ onNavigate }) {
  const { projects, addProject, deleteProject, getProjectStats } = useStore();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] });
  const [search, setSearch] = useState('');

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addProject(form);
    setForm({ name: '', description: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] });
    setShowAdd(false);
    toast('Proyecto creado', 'success');
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📁 Todos los Proyectos</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{projects.length} proyecto{projects.length !== 1 ? 's' : ''} en total</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
            <input style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '7px 14px 7px 30px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)', width: 220 }}
              placeholder="Buscar proyectos..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>＋ Nuevo Proyecto</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-title">{search ? 'Sin resultados' : 'No hay proyectos'}</div>
          <div className="empty-state-desc">{search ? 'Intenta con otra búsqueda' : 'Crea tu primer proyecto para comenzar.'}</div>
          {!search && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>＋ Crear proyecto</button>}
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((p) => {
            const stats = getProjectStats(p.id);
            return (
              <div key={p.id} className="project-card" style={{ '--p-color': p.color }}
                onClick={() => onNavigate(`project-${p.id}`, p.id)}>
                <div className="project-card-header">
                  <div className="project-icon" style={{ background: `${p.color}20`, fontSize: 22, width: 44, height: 44 }}>{p.icon}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Creado</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{formatDate(p.createdAt)}</div>
                  </div>
                </div>
                <div className="project-name">{p.name}</div>
                {p.description && <div className="project-description">{p.description}</div>}
                {stats && (
                  <>
                    {stats.total > 0 && (
                      <div className="progress-bar-container">
                        <div className="progress-label">
                          <span>{stats.completed}/{stats.total} completadas</span>
                          <span style={{ color: p.color, fontWeight: 700 }}>{stats.progress}%</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${stats.progress}%`, '--p-color': p.color }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                      {stats.byStatus.filter(s => s.count > 0).map(s => (
                        <StatusBadge key={s.id || s.status} status={s.id || s.status} projectId={p.id} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nuevo Proyecto"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name.trim()}>Crear</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input className="form-input" placeholder="Nombre del proyecto" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea className="form-textarea" rows={2} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {PROJECT_COLORS.map((c) => (
              <div key={c} className={`color-dot${form.color === c ? ' selected' : ''}`}
                style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                onClick={() => setForm({ ...form, color: c })} />
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Ícono</label>
          <div className="icon-picker">
            {PROJECT_ICONS.map((ic) => (
              <div key={ic} className={`icon-option${form.icon === ic ? ' selected' : ''}`}
                onClick={() => setForm({ ...form, icon: ic })}>{ic}</div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
