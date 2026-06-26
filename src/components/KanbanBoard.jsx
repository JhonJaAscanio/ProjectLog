import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useStore, { STATUSES } from '../store/useStore';
import { TaskCard, AddTaskButton } from './TaskCard';
import { useToast } from './shared/UIKit';

const COLUMN_COLORS = {
  'Pendiente': '#8b8bff',
  'En Proceso': '#38bdf8',
  'En Revisión': '#f59e0b',
  'Completada': '#4ade80',
  'Cancelada': '#6b7280',
};

const COLUMN_ICONS = {
  'Pendiente': '⏳',
  'En Proceso': '⚡',
  'En Revisión': '🔍',
  'Completada': '✅',
  'Cancelada': '❌',
};

export default function KanbanBoard({ project, filters }) {
  const { moveTask } = useStore();
  const toast = useToast();

  const getFilteredTasks = (status) => {
    let tasks = project.tasks.filter((t) => t.status === status);
    if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return tasks;
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    moveTask(project.id, draggableId, newStatus);
    toast(`Tarea movida a "${newStatus}"`, 'success');
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {STATUSES.map((status) => {
          const tasks = getFilteredTasks(status);
          return (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-dot" style={{ background: COLUMN_COLORS[status] }} />
                <span className="kanban-column-title">{COLUMN_ICONS[status]} {status}</span>
                <span className="kanban-column-count">{tasks.length}</span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    className="kanban-column-body"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: snapshot.isDraggingOver
                        ? `color-mix(in srgb, ${COLUMN_COLORS[status]} 8%, transparent)`
                        : undefined,
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {tasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="empty-state" style={{ padding: '24px 10px' }}>
                        <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.4 }}>{COLUMN_ICONS[status]}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin tareas</div>
                      </div>
                    )}
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.85 : 1,
                              transform: snapshot.isDragging
                                ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                                : provided.draggableProps.style?.transform,
                            }}
                          >
                            <TaskCard task={task} projectId={project.id} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <AddTaskButton projectId={project.id} defaultStatus={status} />
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
