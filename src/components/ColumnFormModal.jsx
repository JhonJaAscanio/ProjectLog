import { useState, useEffect } from 'react';
import { Modal, useToast } from './shared/UIKit';
import { PROJECT_COLORS, PROJECT_ICONS } from '../store/useStore';
import useStore from '../store/useStore';

export default function ColumnFormModal({ open, onClose, projectId, column }) {
  const { addColumn, updateColumn } = useStore();
  const toast = useToast();
  
  const [form, setForm] = useState({ name: '', color: '#8b8bff', icon: '⏳' });

  useEffect(() => {
    if (column) {
      setForm({ name: column.name, color: column.color, icon: column.icon });
    } else {
      setForm({ name: '', color: '#8b8bff', icon: '⏳' });
    }
  }, [column, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast('El nombre es requerido', 'error');

    if (column) {
      updateColumn(projectId, column.id, form);
      toast('Columna actualizada', 'success');
    } else {
      addColumn(projectId, form);
      toast('Columna creada', 'success');
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={column ? 'Editar Columna' : 'Nueva Columna'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Nombre de la columna</label>
          <input
            autoFocus
            type="text"
            className="form-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej. Diseño, QA, Bloqueado..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {PROJECT_COLORS.map((c) => (
              <div key={c} className={`color-option${form.color === c ? ' selected' : ''}`}
                style={{ background: c }}
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

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{column ? 'Guardar Cambios' : 'Crear Columna'}</button>
        </div>
      </form>
    </Modal>
  );
}
