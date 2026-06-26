import { useState } from 'react';
import useStore, { PROJECT_COLORS, PROJECT_ICONS } from '../store/useStore';
import { useToast, Modal } from './shared/UIKit';

export default function Sidebar({ currentPage, onNavigate }) {
  const { projects, theme, toggleTheme, addProject } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] });
  const toast = useToast();

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addProject(form);
    setForm({ name: '', description: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] });
    setShowAddModal(false);
    toast('Proyecto creado exitosamente', 'success');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
    { id: 'projects', label: 'Todos los Proyectos', icon: '📁' },
  ];

  return (
    <>
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📋</div>
          <span className="sidebar-logo-text">Bitácora</span>
          <button
            className="icon-btn btn"
            onClick={toggleTheme}
            style={{ marginLeft: 'auto', width: 30, height: 30, border: 'none' }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Main Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navegación</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item${currentPage === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Projects List */}
          {projects.length > 0 && (
            <>
              <div className="sidebar-section-title" style={{ marginTop: 16 }}>Proyectos</div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  className={`sidebar-item${currentPage === `project-${p.id}` ? ' active' : ''}`}
                  onClick={() => onNavigate(`project-${p.id}`, p.id)}
                >
                  <span
                    className="sidebar-item-dot"
                    style={{ background: p.color }}
                  />
                  <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.icon} {p.name}
                  </span>
                  <span className="sidebar-item-count">{p.tasks.length}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Footer / Add Project */}
        <div className="sidebar-footer">
          <button className="sidebar-add-btn" onClick={() => setShowAddModal(true)}>
            <span>＋</span> Nuevo Proyecto
          </button>
        </div>
      </aside>

      {/* Add Project Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Crear Nuevo Proyecto"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name.trim()}>Crear Proyecto</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nombre del proyecto *</label>
          <input
            className="form-input"
            placeholder="Ej: App Mobile, Rediseño Web..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-textarea"
            placeholder="Describe brevemente el proyecto..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Color del proyecto</label>
          <div className="color-picker">
            {PROJECT_COLORS.map((c) => (
              <div
                key={c}
                className={`color-dot${form.color === c ? ' selected' : ''}`}
                style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                onClick={() => setForm({ ...form, color: c })}
              />
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Ícono</label>
          <div className="icon-picker">
            {PROJECT_ICONS.map((ic) => (
              <div
                key={ic}
                className={`icon-option${form.icon === ic ? ' selected' : ''}`}
                onClick={() => setForm({ ...form, icon: ic })}
              >
                {ic}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
