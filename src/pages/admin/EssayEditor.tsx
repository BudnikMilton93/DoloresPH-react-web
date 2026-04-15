import { useState } from 'react';
import type { Essay } from '../../types';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { createEssay, patchEssay, deleteEssay } from '../../api/admin';

interface EssayEditorProps {
  essays: Essay[];
  token: string;
  onUpdate: () => void;
}

export function EssayEditor({ essays, token, onUpdate }: EssayEditorProps) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Per-essay editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await createEssay({ title: newTitle, description: newDescription, isVisible: true }, token);
      setNewTitle('');
      setNewDescription('');
      setCreating(false);
      setMessage('Ensayo creado correctamente.');
      onUpdate();
    } catch {
      setMessage('Error al crear. La API puede no estar disponible.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (essay: Essay) => {
    setEditingId(essay.id);
    setEditTitle(essay.title);
    setEditDescription(essay.description);
  };

  const handleSaveEdit = async (essayId: number) => {
    setEditSaving(true);
    setMessage('');
    try {
      await patchEssay(essayId, { title: editTitle, description: editDescription }, token);
      setEditingId(null);
      setMessage('Ensayo actualizado.');
      onUpdate();
    } catch {
      setMessage('Error al guardar. La API puede no estar disponible.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleVisibility = async (essay: Essay, visible: boolean) => {
    setMessage('');
    try {
      await patchEssay(essay.id, { isVisible: visible }, token);
      onUpdate();
    } catch {
      setMessage(`No se pudo cambiar la visibilidad de "${essay.title}".`);
    }
  };

  const handleDelete = async (essay: Essay) => {
    if (!window.confirm(`¿Eliminar "${essay.title}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(essay.id);
    setMessage('');
    try {
      await deleteEssay(essay.id, token);
      onUpdate();
    } catch {
      setMessage(`No se pudo eliminar "${essay.title}". La API puede no estar disponible.`);
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-accent/30 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Ensayos Fotográficos
        </h2>
        <Button variant="primary" size="sm" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancelar' : '+ Nuevo ensayo'}
        </Button>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="bg-background rounded-2xl p-6 mb-6 space-y-4 border border-accent/20"
        >
          <input
            type="text"
            placeholder="Título del ensayo"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className={inputClass}
            required
          />
          <textarea
            placeholder="Descripción"
            rows={3}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            required
          />
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Creando...' : 'Crear Ensayo'}
          </Button>
        </form>
      )}

      {message && <p className="text-sm text-text/60 mb-4">{message}</p>}

      <div className="space-y-3">
        {essays.map((essay) => (
          <div
            key={essay.id}
            className="bg-background rounded-xl border border-accent/20 overflow-hidden"
          >
            {editingId === essay.id ? (
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={inputClass}
                  placeholder="Título"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Descripción"
                />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleSaveEdit(essay.id)} disabled={editSaving}>
                    {editSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-medium text-text truncate">{essay.title}</p>
                  <p className="text-xs text-text/50 mt-0.5">
                    {essay.photos.length} foto{essay.photos.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Toggle
                    checked={essay.isVisible}
                    onChange={(checked) => handleToggleVisibility(essay, checked)}
                  />
                  <button
                    onClick={() => handleStartEdit(essay)}
                    className="text-xs text-primary hover:underline transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(essay)}
                    disabled={deletingId === essay.id}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    {deletingId === essay.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

