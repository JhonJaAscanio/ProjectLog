import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PROJECTS = [
  {
    id: uuidv4(),
    name: 'Mi Primer Proyecto',
    description: 'Proyecto de ejemplo para empezar',
    color: '#6366f1',
    icon: '🚀',
    createdAt: new Date().toISOString(),
    tasks: [],
  },
];

export const STATUSES = ['Pendiente', 'En Proceso', 'En Revisión', 'Completada', 'Cancelada'];
export const PRIORITIES = ['Alta', 'Media', 'Baja'];
export const PROJECT_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444',
  '#f97316','#eab308','#22c55e','#14b8a6',
  '#06b6d4','#3b82f6',
];
export const PROJECT_ICONS = ['🚀','💼','🎯','📊','🛠️','🎨','📱','🌐','⚙️','📝','🔬','💡','🏆','🔑','📦'];

const useStore = create(
  persist(
    (set, get) => ({
      projects: DEFAULT_PROJECTS,
      theme: 'dark',
      searchQuery: '',
      activeProjectId: null,
      recentActivity: [],

      // Theme
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Search
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Active Project
      setActiveProject: (id) => set({ activeProjectId: id }),

      // Recent Activity
      addActivity: (message) => set((state) => ({
        recentActivity: [
          { id: uuidv4(), message, time: new Date().toISOString() },
          ...state.recentActivity.slice(0, 19),
        ],
      })),

      // Projects CRUD
      addProject: (project) => {
        const newProject = {
          id: uuidv4(),
          name: project.name,
          description: project.description || '',
          color: project.color || '#6366f1',
          icon: project.icon || '📝',
          createdAt: new Date().toISOString(),
          tasks: [],
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        get().addActivity(`Proyecto creado: "${newProject.name}"`);
        return newProject.id;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
        get().addActivity(`Proyecto actualizado`);
      },

      deleteProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }));
        get().addActivity(`Proyecto eliminado: "${project?.name}"`);
      },

      // Tasks CRUD
      addTask: (projectId, task) => {
        const newTask = {
          id: uuidv4(),
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'Media',
          status: task.status || 'Pendiente',
          tags: task.tags || [],
          comments: task.comments || [],
          dueDate: task.dueDate || null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
          ),
        }));
        get().addActivity(`Tarea creada: "${newTask.title}"`);
      },

      updateTask: (projectId, taskId, updates) => {
        const old = get().projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)) }
              : p
          ),
        }));
        if (updates.status && old?.status !== updates.status) {
          get().addActivity(`Tarea "${old?.title}" → ${updates.status}`);
        }
      },

      deleteTask: (projectId, taskId) => {
        const task = get().projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p
          ),
        }));
        get().addActivity(`Tarea eliminada: "${task?.title}"`);
      },

      duplicateTask: (projectId, taskId) => {
        const task = get().projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
        if (!task) return;
        get().addTask(projectId, { ...task, title: `${task.title} (copia)` });
      },

      moveTask: (projectId, taskId, newStatus) => {
        get().updateTask(projectId, taskId, { status: newStatus });
      },

      addComment: (projectId, taskId, text) => {
        const comment = { id: uuidv4(), text, createdAt: new Date().toISOString() };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t
                  ),
                }
              : p
          ),
        }));
      },

      // Computed Helpers
      getStats: () => {
        const { projects } = get();
        const allTasks = projects.flatMap((p) => p.tasks);
        const now = new Date();
        return {
          totalProjects: projects.length,
          totalTasks: allTasks.length,
          pending: allTasks.filter((t) => t.status === 'Pendiente').length,
          inProgress: allTasks.filter((t) => t.status === 'En Proceso').length,
          inReview: allTasks.filter((t) => t.status === 'En Revisión').length,
          completed: allTasks.filter((t) => t.status === 'Completada').length,
          cancelled: allTasks.filter((t) => t.status === 'Cancelada').length,
          overdue: allTasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completada' && t.status !== 'Cancelada'
          ).length,
          upcoming: allTasks
            .filter((t) => t.dueDate && new Date(t.dueDate) >= now && t.status !== 'Completada' && t.status !== 'Cancelada')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5),
        };
      },

      getProjectStats: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return null;
        const tasks = project.tasks;
        const completed = tasks.filter((t) => t.status === 'Completada').length;
        const total = tasks.length;
        return {
          total,
          completed,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
          byStatus: STATUSES.map((s) => ({ status: s, count: tasks.filter((t) => t.status === s).length })),
          byPriority: PRIORITIES.map((p) => ({ priority: p, count: tasks.filter((t) => t.priority === p).length })),
        };
      },
    }),
    {
      name: 'bitacora-storage-v2',
    }
  )
);

export default useStore;
