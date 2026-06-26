import { useState } from 'react';
import useStore from '../store/useStore';
import { Modal, useToast } from './shared/UIKit';

export default function VersionsModal({ open, onClose, projectId, project }) {
  const { addVersion, setCurrentVersion, setClientVersion, deleteVersion } = useStore();
  const [newVersionName, setNewVersionName] = useState('');
  const toast = useToast();

  const handleAddVersion = () => {
    if (!newVersionName.trim()) return;
    addVersion(projectId, newVersionName.trim());
    setNewVersionName('');
    toast('Versión agregada', 'success');
  };

  const handleSetCurrent = (id) => {
    setCurrentVersion(projectId, id);
    toast('Versión actual actualizada', 'success');
  };

  const handleSetClient = (id) => {
    setClientVersion(projectId, id);
    toast('Versión del cliente actualizada', 'success');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta versión?')) {
      deleteVersion(projectId, id);
      toast('Versión eliminada', 'info');
    }
  };

  if (!project) return null;

  const versions = project.versions || [];

  return (
    <Modal open={open} onClose={onClose} title={`Versiones: ${project.name}`}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="Nombre de la nueva versión (Ej: v1.0.2)"
          value={newVersionName}
          onChange={(e) => setNewVersionName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddVersion()}
        />
        <button className="btn btn-primary" onClick={handleAddVersion} disabled={!newVersionName.trim()}>
          Agregar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
        {versions.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>No hay versiones guardadas.</div>
        ) : (
          versions.map((v) => {
            const isCurrent = project.currentVersionId === v.id;
            const isClient = project.clientVersionId === v.id;
            
            return (
              <div key={v.id} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                padding: '10px 14px', borderRadius: 'var(--r-md)', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', gap: 10
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{v.name}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleSetCurrent(v.id)}
                    style={{ padding: '4px 8px', fontSize: 11 }}
                    title="Marcar como la versión de desarrollo más reciente"
                  >
                    {isCurrent ? '✅ Actual' : 'Marcar Actual'}
                  </button>
                  <button 
                    className={`btn btn-sm ${isClient ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleSetClient(v.id)}
                    style={{ padding: '4px 8px', fontSize: 11, background: isClient ? '#22c55e' : undefined, color: isClient ? '#fff' : undefined }}
                    title="Marcar como la versión que tiene instalada el cliente"
                  >
                    {isClient ? '✅ Cliente' : 'Marcar Cliente'}
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(v.id)}
                    style={{ padding: '4px 8px', fontSize: 11 }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
