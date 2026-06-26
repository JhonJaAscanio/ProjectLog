import { useState } from 'react';
import useStore from './store/useStore';
import { ToastProvider } from './components/shared/UIKit';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import ProjectsPage from './pages/ProjectsPage';
import './index.css';

function AppContent() {
  const { theme, setSearchQuery, projects } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState(null);

  const navigate = (page, projectId = null) => {
    setCurrentPage(page);
    setActiveProjectId(projectId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTopbarTitle = () => {
    if (currentPage === 'dashboard') return { title: 'Dashboard', subtitle: 'Vista general de tus proyectos y tareas' };
    if (currentPage === 'projects') return { title: 'Proyectos', subtitle: 'Gestión de todos los proyectos' };
    if (currentPage.startsWith('project-') && activeProjectId) {
      const p = projects.find((x) => x.id === activeProjectId);
      return { title: `${p?.icon || ''} ${p?.name || 'Proyecto'}`, subtitle: 'Tablero Kanban' };
    }
    return { title: 'Bitácora', subtitle: '' };
  };

  const { title, subtitle } = getTopbarTitle();

  return (
    <div className="app-layout" data-theme={theme}>
      <Sidebar currentPage={currentPage} onNavigate={navigate} />

      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
        </div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Buscar tareas y proyectos..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {currentPage === 'projects' && <ProjectsPage onNavigate={navigate} />}
        {currentPage.startsWith('project-') && activeProjectId && (
          <ProjectView key={activeProjectId} projectId={activeProjectId} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
