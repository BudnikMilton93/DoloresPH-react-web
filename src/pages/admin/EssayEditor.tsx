import { useState } from 'react';
import type { Essay } from '../../types';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { createEssay, patchEssay } from '../../api/admin';

interface EssayEditorProps {
  essays: Essay[];
  token: string;
  onUpdate: () => void;
}

export function EssayEditor({ essays, token, onUpdate }: EssayEditorProps) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await createEssay({ title, description, isVisible: true }, token);
      setTitle('');
      setDescription('');
      setCreating(false);
      setMessage('Essay created!');
      onUpdate();
    } catch {
      setMessage('Failed to create essay. API may be unavailable.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (essay: Essay, visible: boolean) => {
    try {
      await patchEssay(essay.id, { isVisible: visible }, token);
      onUpdate();
    } catch {
      // handle gracefully
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-[var(--color-text)]" style={{ fontFamily: 'Playfair Display, serif' }}>Photo Essays</h2>
        <Button variant="primary" size="sm" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancel' : '+ New Essay'}
        </Button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="bg-[var(--color-background)] rounded-2xl p-6 mb-6 space-y-4 border border-[var(--color-accent)]/20">
          <input
            type="text"
            placeholder="Essay Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
            required
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 resize-none"
            required
          />
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create Essay'}
          </Button>
        </form>
      )}

      {message && <p className="text-sm text-[var(--color-text)]/60 mb-4">{message}</p>}

      <div className="space-y-3">
        {essays.map((essay) => (
          <div key={essay.id} className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-accent)]/20">
            <div>
              <p className="font-medium text-[var(--color-text)]">{essay.title}</p>
              <p className="text-xs text-[var(--color-text)]/50 mt-0.5">{essay.photos.length} photos</p>
            </div>
            <Toggle
              checked={essay.isVisible}
              onChange={(checked) => handleToggleVisibility(essay, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
