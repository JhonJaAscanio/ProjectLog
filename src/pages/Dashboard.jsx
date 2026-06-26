import { useState } from 'react';
import useStore, { PROJECT_COLORS, PROJECT_ICONS } from '../store/useStore';
import { useToast, Modal } from '../components/shared/UIKit';
import { formatTimeAgo } from '../components/shared/helpers';

const STAT_CARDS = [
  { key: 'totalProjects', label: 'Proyectos', icon: '📁', accent: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { key: 'totalTasks', label: 'Tareas Totales', icon: '📋', accent: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { key: 'pending', label: 'Pendientes', icon: '⏳', accent: '#8b8bff', bg: 'rgba(139,139,255,0.12)' },
  { key: 'inProgress', label: 'En Proceso', icon: '⚡', accent: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  { key: 'inReview', label: 'En Revisión', icon: '🔍', accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'completed', label: 'Completadas', icon: '✅', accent: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  { key: 'overdue', label: 'Vencidas', icon: '⚠️', accent: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
];

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

function StatusChart({ stats }) {
  const data = [
    { label: 'Pendiente', value: stats.pending, color: '#8b8bff' },
    { label: 'En Proceso', value: stats.inProgress, color: '#38bdf8' },
    { label: 'En Revisión', value: stats.inReview, color: '#f59e0b' },
    { label: 'Completadas', value: stats.completed, color: '#4ade80' },
    { label: 'Canceladas', value: stats.cancelled, color: '#6b7280' },
  ];
  const total = stats.totalTasks || 1;

  return (
    <div className="chart-wrapper" style={{ flex: 1 }}>
      <div className="section-title" style={{ marginBottom: 16 }}>📊 Distribución de Tareas</div>
      {stats.totalTasks === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 28, opacity: 0.4 }}>📊</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin tareas aún</div></div>
      ) : (
        <>
          {/* Bar chart */}
          <div style={{ display: 'flex', height: 12, borderRadius: 'var(--r-full)', overflow: 'hidden', marginBottom: 16, gap: 2 }}>
            {data.filter(d => d.value > 0).map((d) => (
              <div key={d.label} style={{ width: `${(d.value / total) * 100}%`, background: d.color, transition: 'width 0.6s ease' }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.map((d) => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{d.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>
                  {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { projects, recentActivity, getStats, addProject, deleteProject, getProjectStats } = useStore();
  const stats = getStats();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const id = addProject(form);
    setForm({ name: '', description: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] });
    setShowAddModal(false);
    toast('Proyecto creado', 'success');
  };

  return (
    <div className="page-container">
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          ¡Bienvenido a Bitácora 👋
        </h1>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Tu centro de control personal para proyectos y tareas.</div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {STAT_CARDS.map(({ key, label, icon, accent, bg }) => (
          <div key={key} className="stat-card" style={{ '--card-accent': accent }}>
            <div className="stat-icon" style={{ background: bg }}>
              <span>{icon}</span>
            </div>
            <div className="stat-value" style={{ color: accent }}>{stats[key]}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 28 }}>
        {/* Status chart */}
        <StatusChart stats={stats} />

        {/* Upcoming deadlines */}
        <div className="chart-wrapper">
          <div className="section-title" style={{ marginBottom: 14 }}>📅 Próximos Vencimientos</div>
          {stats.upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div style={{ fontSize: 26, opacity: 0.4 }}>🎉</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin vencimientos próximos</div>
            </div>
          ) : (
            <div className="upcoming-list">
              {stats.upcoming.map((task) => {
                const proj = projects.find((p) => p.tasks.some((t) => t.id === task.id));
                const dueDate = new Date(task.dueDate);
                const isToday = dueDate.toDateString() === new Date().toDateString();
                const isTomorrow = dueDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const label = isToday ? '¡Hoy!' : isTomorrow ? 'Mañana' : formatDate(task.dueDate);
                const color = isToday ? '#ef4444' : isTomorrow ? '#f97316' : '#38bdf8';
                return (
                  <div key={task.id} className="upcoming-item" onClick={() => proj && onNavigate(`project-${proj.id}`, proj.id)} style={{ cursor: proj ? 'pointer' : 'default' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div className="upcoming-info">
                      <div className="upcoming-title">{task.title}</div>
                      {proj && <div className="upcoming-project">{proj.icon} {proj.name}</div>}
                    </div>
                    <div className="upcoming-date" style={{ color }}>{label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Projects + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Projects overview */}
        <div>
          <div className="section-header">
            <div className="section-title">📁 Proyectos</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>＋ Nuevo</button>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-title">No hay proyectos</div>
              <div className="empty-state-desc">Crea tu primer proyecto para empezar a organizar tus tareas.</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddModal(true)}>＋ Crear proyecto</button>
            </div>
          ) : (
            <div className="projects-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {projects.map((p) => {
                const pStats = getProjectStats(p.id);
                return (
                  <div key={p.id} className="project-card" style={{ '--p-color': p.color }}
                    onClick={() => onNavigate(`project-${p.id}`, p.id)}>
                    <div className="project-card-header">
                      <div className="project-icon" style={{ background: `${p.color}20`, fontSize: 22 }}>{p.icon}</div>
                      <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>
                        {pStats?.total || 0} tareas
                      </div>
                    </div>
                    <div className="project-name">{p.name}</div>
                    {p.description && <div className="project-description">{p.description}</div>}
                    {pStats && pStats.total > 0 && (
                      <div className="progress-bar-container">
                        <div className="progress-label">
                          <span style={{ color: 'var(--text-muted)' }}>Progreso</span>
                          <span style={{ color: p.color, fontWeight: 700 }}>{pStats.progress}%</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${pStats.progress}%`, '--p-color': p.color }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {pStats?.byStatus.filter(s => s.count > 0).slice(0, 3).map(s => (
                        <span key={s.status} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {s.status}: <strong style={{ color: 'var(--text-secondary)' }}>{s.count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="chart-wrapper" style={{ alignSelf: 'flex-start' }}>
          <div className="section-title" style={{ marginBottom: 14 }}>🕐 Actividad Reciente</div>
          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div style={{ fontSize: 26, opacity: 0.4 }}>🕐</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin actividad reciente</div>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivity.slice(0, 12).map((a) => (
                <div key={a.id} className="activity-item">
                  <div className="activity-dot" />
                  <div>
                    <div className="activity-text">{a.message}</div>
                    <div className="activity-time">{formatTimeAgo(a.time)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Nuevo Proyecto"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name.trim()}>Crear Proyecto</button>
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
          <textarea className="form-textarea" rows={2} placeholder="Descripción breve..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
