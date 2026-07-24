import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_COLUMNS = [
  { id: 'Pendiente', name: 'Pendiente', color: '#8b8bff', icon: '⏳' },
  { id: 'En Proceso', name: 'En Proceso', color: '#38bdf8', icon: '⚡' },
  { id: 'En Revisión', name: 'En Revisión', color: '#f59e0b', icon: '🔍' },
  { id: 'Completada', name: 'Completada', color: '#4ade80', icon: '✅' },
  { id: 'Cancelada', name: 'Cancelada', color: '#6b7280', icon: '❌' }
];

const DEFAULT_PROJECTS = [
  {
    id: uuidv4(),
    name: 'Mi Primer Proyecto',
    description: 'Proyecto de ejemplo para empezar',
    color: '#6366f1',
    icon: '🚀',
    createdAt: new Date().toISOString(),
    tasks: [],
    columns: DEFAULT_COLUMNS,
    hasVersioning: false,
    versions: [],
    currentVersionId: null,
    clientVersionId: null,
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
          color: project.color,
          icon: project.icon,
          createdAt: new Date().toISOString(),
          tasks: [],
          columns: DEFAULT_COLUMNS,
          hasVersioning: project.hasVersioning || false,
          versions: project.versions || [],
          currentVersionId: project.currentVersionId || null,
          clientVersionId: project.clientVersionId || null,
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

      // Versions
      addVersion: (projectId, versionName) => {
        const newVersion = { id: uuidv4(), name: versionName, date: new Date().toISOString() };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, versions: [...(p.versions || []), newVersion] } : p
          ),
        }));
        get().addActivity(`Nueva versión agregada: "${versionName}"`);
      },
      
      setCurrentVersion: (projectId, versionId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, currentVersionId: versionId } : p
          ),
        }));
      },
      
      setClientVersion: (projectId, versionId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, clientVersionId: versionId } : p
          ),
        }));
      },
      
      deleteVersion: (projectId, versionId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              versions: (p.versions || []).filter(v => v.id !== versionId),
              currentVersionId: p.currentVersionId === versionId ? null : p.currentVersionId,
              clientVersionId: p.clientVersionId === versionId ? null : p.clientVersionId,
            };
          }),
        }));
      },

      // Columns CRUD
      addColumn: (projectId, column) => {
        const newColumn = { id: uuidv4(), name: column.name, color: column.color, icon: column.icon };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, columns: [...(p.columns || DEFAULT_COLUMNS), newColumn] } : p
          ),
        }));
        get().addActivity(`Columna agregada: "${newColumn.name}"`);
      },

      updateColumn: (projectId, columnId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  columns: (p.columns || DEFAULT_COLUMNS).map((c) =>
                    c.id === columnId ? { ...c, ...updates } : c
                  ),
                }
              : p
          ),
        }));
      },

      deleteColumn: (projectId, columnId) => {
        let deletedName = '';
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const columns = p.columns || DEFAULT_COLUMNS;
            const hasTasks = p.tasks.some(t => t.status === columnId);
            if (hasTasks) return p; // No borrar si tiene tareas
            const col = columns.find(c => c.id === columnId);
            if (col) deletedName = col.name;
            return { ...p, columns: columns.filter(c => c.id !== columnId) };
          }),
        }));
        if (deletedName) {
          get().addActivity(`Columna eliminada: "${deletedName}"`);
        }
      },

      reorderColumns: (projectId, sourceIndex, destinationIndex) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const newCols = Array.from(p.columns || DEFAULT_COLUMNS);
            const [moved] = newCols.splice(sourceIndex, 1);
            newCols.splice(destinationIndex, 0, moved);
            return { ...p, columns: newCols };
          }),
        }));
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

      moveTask: (projectId, taskId, newStatus, newIndex) => {
        const oldTask = get().projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
        
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            
            const taskIndex = p.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return p;
            
            const task = { ...p.tasks[taskIndex], status: newStatus };
            const tasksWithoutMoved = [...p.tasks];
            tasksWithoutMoved.splice(taskIndex, 1);
            
            if (newIndex !== undefined) {
              const filteredTasks = tasksWithoutMoved.filter(t => t.status === newStatus);
              const taskAfter = filteredTasks[newIndex];
              
              if (taskAfter) {
                const insertIndex = tasksWithoutMoved.findIndex(t => t.id === taskAfter.id);
                tasksWithoutMoved.splice(insertIndex, 0, task);
              } else {
                tasksWithoutMoved.push(task);
              }
            } else {
              tasksWithoutMoved.push(task);
            }
            
            return { ...p, tasks: tasksWithoutMoved };
          })
        }));

        if (oldTask && oldTask.status !== newStatus) {
          get().addActivity(`Tarea "${oldTask.title}" → ${newStatus}`);
        }
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
        let pending = 0, inProgress = 0, inReview = 0, completed = 0, cancelled = 0, overdue = 0, totalTasks = 0;
        let upcoming = [];
        const now = new Date();

        projects.forEach(p => {
          const cols = p.columns || DEFAULT_COLUMNS;
          p.tasks.forEach(t => {
            totalTasks++;
            const cName = cols.find(c => c.id === t.status)?.name;
            if (cName === 'Pendiente') pending++;
            else if (cName === 'En Proceso') inProgress++;
            else if (cName === 'En Revisión') inReview++;
            else if (cName === 'Completada') completed++;
            else if (cName === 'Cancelada') cancelled++;
            
            if (t.dueDate && cName !== 'Completada' && cName !== 'Cancelada') {
              if (new Date(t.dueDate) < now) overdue++;
              else upcoming.push(t);
            }
          });
        });

        upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        return {
          totalProjects: projects.length,
          totalTasks, pending, inProgress, inReview, completed, cancelled, overdue, upcoming: upcoming.slice(0, 5)
        };
      },

      getProjectStats: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return null;
        const tasks = project.tasks;
        const completedColId = (project.columns || DEFAULT_COLUMNS).find(c => c.name === 'Completada')?.id;
        const completed = completedColId ? tasks.filter((t) => t.status === completedColId).length : 0;
        const total = tasks.length;
        return {
          total,
          completed,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
          byStatus: (project.columns || DEFAULT_COLUMNS).map((c) => ({ id: c.id, status: c.name, color: c.color, count: tasks.filter((t) => t.status === c.id).length })),
          byPriority: PRIORITIES.map((p) => ({ priority: p, count: tasks.filter((t) => t.priority === p).length })),
        };
      },
    }),
    {
      name: 'bitacora-storage-v2',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0 || !version) {
          if (persistedState.projects) {
            persistedState.projects = persistedState.projects.map(p => {
              if (!p.columns) {
                return { ...p, columns: DEFAULT_COLUMNS };
              }
              return p;
            });
          }
        }
        return persistedState;
      },
    }
  )
);

export default useStore;
