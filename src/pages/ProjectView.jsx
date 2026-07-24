import { useState } from 'react';
import useStore, { PRIORITIES } from '../store/useStore';
import KanbanBoard from '../components/KanbanBoard';
import { Modal, useToast } from '../components/shared/UIKit';
import VersionsModal from '../components/VersionsModal';
import { PROJECT_COLORS, PROJECT_ICONS } from '../store/useStore';
import { StatusBadge } from '../components/shared/helpers';

function ProjectStats({ stats }) {
  if (!stats) return null;
  const items = [
    { label: 'Total', value: stats.total, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    ...stats.byStatus.map(s => ({
      label: s.status, 
      value: s.count, 
      color: s.color, 
      bg: `color-mix(in srgb, ${s.color} 10%, transparent)`
    }))
  ];
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      {items.map((item) => (
        <div key={item.label} style={{
          background: item.bg, border: `1px solid ${item.color}30`,
          borderRadius: 'var(--r-md)', padding: '8px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
        </div>
      ))}
      {stats.total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
          <div style={{ flex: 1 }}>
            <div className="progress-label"><span>Progreso</span><span>{stats.progress}%</span></div>
            <div className="progress-bar-track" style={{ marginTop: 4, height: 7 }}>
              <div className="progress-bar-fill" style={{ width: `${stats.progress}%`, '--p-color': '#4ade80' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectView({ projectId }) {
  const { projects, updateProject, deleteProject, getProjectStats } = useStore();
  const project = projects.find((p) => p.id === projectId);
  const stats = getProjectStats(projectId);
  const toast = useToast();

  const [filters, setFilters] = useState({ priority: '', search: '' });
  const [showEdit, setShowEdit] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [editForm, setEditForm] = useState(null);

  if (!project) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Proyecto no encontrado</div>
          <div className="empty-state-desc">Es posible que haya sido eliminado.</div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm({ name: project.name, description: project.description, color: project.color, icon: project.icon, hasVersioning: project.hasVersioning });
    setShowEdit(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) return;
    updateProject(projectId, editForm);
    toast('Proyecto actualizado', 'success');
    setShowEdit(false);
  };

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`)) {
      deleteProject(projectId);
      toast('Proyecto eliminado', 'info');
    }
  };

  const priorities = ['Alta', 'Media', 'Baja'];

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div className="project-icon" style={{ background: `${project.color}20`, fontSize: 26, width: 50, height: 50 }}>
            {project.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 3 }}>{project.name}</h1>
            {project.description && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{project.description}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleEdit}>✏️ Editar</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Eliminar</button>
          </div>
        </div>

        {/* Versioning Block */}
        {project.hasVersioning && (
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
          }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 2 }}>Versión Actual</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>
                  {project.versions?.find(v => v.id === project.currentVersionId)?.name || 'Ninguna'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 2 }}>Versión del Cliente</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                  {project.versions?.find(v => v.id === project.clientVersionId)?.name || 'Ninguna'}
                </span>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowVersions(true)}>
              ⚙️ Gestionar Versiones
            </button>
          </div>
        )}

        {/* Stats */}
        <ProjectStats stats={stats} />

        {/* Filters */}
        <div className="filter-bar">
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filtrar:</span>
          <button className={`filter-pill${!filters.priority ? ' active' : ''}`}
            onClick={() => setFilters({ ...filters, priority: '' })}>Todas las prioridades</button>
          {priorities.map((p) => (
            <button key={p} className={`filter-pill${filters.priority === p ? ' active' : ''}`}
              onClick={() => setFilters({ ...filters, priority: filters.priority === p ? '' : p })}>
              {p === 'Alta' ? '🔴' : p === 'Media' ? '🟠' : '🟢'} {p}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 10, fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
            <input
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)', padding: '6px 14px 6px 30px',
                fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)',
                width: 200, transition: 'all 0.2s',
              }}
              placeholder="Buscar tareas..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Kanban */}
      <KanbanBoard project={project} filters={filters} />

      {/* Edit Modal */}
      {editForm && (
        <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar Proyecto"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Guardar</button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" rows={2} value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map((c) => (
                <div key={c} className={`color-dot${editForm.color === c ? ' selected' : ''}`}
                  style={{ background: c, borderColor: editForm.color === c ? 'white' : 'transparent' }}
                  onClick={() => setEditForm({ ...editForm, color: c })} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Ícono</label>
            <div className="icon-picker">
              {PROJECT_ICONS.map((ic) => (
                <div key={ic} className={`icon-option${editForm.icon === ic ? ' selected' : ''}`}
                  onClick={() => setEditForm({ ...editForm, icon: ic })}>{ic}</div>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <input
              type="checkbox"
              id="editHasVersioning"
              checked={editForm.hasVersioning || false}
              onChange={(e) => setEditForm({ ...editForm, hasVersioning: e.target.checked })}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand)' }}
            />
            <label htmlFor="editHasVersioning" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              Habilitar control de versiones para este proyecto
            </label>
          </div>
        </Modal>
      )}

      {/* Versions Modal */}
      <VersionsModal 
        open={showVersions} 
        onClose={() => setShowVersions(false)} 
        projectId={project.id} 
        project={project} 
      />
    </div>
  );
}
