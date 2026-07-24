import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useStore, { DEFAULT_COLUMNS } from '../store/useStore';
import { TaskCard, AddTaskButton } from './TaskCard';
import { useToast } from './shared/UIKit';

export default function KanbanBoard({ project, filters, onEditColumn }) {
  const { moveTask, deleteColumn, reorderColumns } = useStore();
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
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'column') {
      reorderColumns(project.id, source.index, destination.index);
      return;
    }

    const newStatus = destination.droppableId;
    const newIndex = destination.index;
    moveTask(project.id, draggableId, newStatus, newIndex);
    toast(`Tarea movida a "${project.columns?.find(c => c.id === newStatus)?.name || newStatus}"`, 'success');
  };

  const handleDeleteColumn = (columnId) => {
    const hasTasks = project.tasks.some(t => t.status === columnId);
    if (hasTasks) {
      toast('No puedes eliminar una columna que contiene tareas.', 'error');
      return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar esta columna?')) {
      deleteColumn(project.id, columnId);
      toast('Columna eliminada', 'success');
    }
  };

  const columns = project.columns || DEFAULT_COLUMNS;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="column" direction="horizontal">
          {(provided) => (
            <div className="kanban-board" ref={provided.innerRef} {...provided.droppableProps}>
              {columns.map((col, index) => {
                const tasks = getFilteredTasks(col.id);
                return (
                  <Draggable key={col.id} draggableId={col.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        className="kanban-column"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.9 : 1,
                        }}
                      >
                        <div className="kanban-column-header" {...provided.dragHandleProps}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <div className="kanban-column-dot" style={{ background: col.color }} />
                            <span className="kanban-column-title">{col.icon} {col.name}</span>
                            <span className="kanban-column-count">{tasks.length}</span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="icon-btn-small" onClick={() => onEditColumn(col)} title="Editar Columna">✏️</button>
                            <button className="icon-btn-small" onClick={() => handleDeleteColumn(col.id)} title="Eliminar Columna" style={{ color: 'var(--danger)' }}>🗑</button>
                          </div>
                        </div>

                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              className="kanban-column-body"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{
                                background: snapshot.isDraggingOver
                                  ? `color-mix(in srgb, ${col.color || '#ccc'} 8%, transparent)`
                                  : undefined,
                                transition: 'background 0.2s ease',
                              }}
                            >
                              {tasks.length === 0 && !snapshot.isDraggingOver && (
                                <div className="empty-state" style={{ padding: '24px 10px' }}>
                                  <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.4 }}>{col.icon}</div>
                                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin tareas</div>
                                </div>
                              )}
                              {tasks.map((task, idx) => (
                                <Draggable key={task.id} draggableId={task.id} index={idx}>
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
                              <AddTaskButton projectId={project.id} defaultStatus={col.id} />
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}
