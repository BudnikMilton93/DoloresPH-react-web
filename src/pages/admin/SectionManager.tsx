import { useState } from 'react';
import type { Section } from '../../types';
import { Toggle } from '../../components/ui/Toggle';
import { toggleSection } from '../../api/admin';

interface SectionManagerProps {
  sections: Section[];
  token: string;
  onUpdate: () => void;
}

export function SectionManager({ sections, token, onUpdate }: SectionManagerProps) {
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');

  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleToggle = async (section: Section, visible: boolean) => {
    setUpdating(section.id);
    setError('');
    try {
      await toggleSection(section.id, { isVisible: visible }, token);
      onUpdate();
    } catch {
      setError(`No se pudo cambiar la visibilidad de "${section.name}".`);
    } finally {
      setUpdating(null);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const a = sorted[index];
    const b = sorted[swapIndex];
    setUpdating(a.id);
    setError('');
    try {
      await Promise.all([
        toggleSection(a.id, { sortOrder: b.sortOrder }, token),
        toggleSection(b.id, { sortOrder: a.sortOrder }, token),
      ]);
      onUpdate();
    } catch {
      setError('No se pudo reordenar. La API puede no estar disponible.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
        Secciones
      </h2>
      <p className="text-sm text-[var(--color-text)]/50 mb-6">
        Activá/desactivá secciones y cambiá su orden de aparición.
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="space-y-3">
        {sorted.map((section, index) => (
          <div
            key={section.id}
            className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-accent)]/20"
          >
            <div className="flex items-center gap-3">
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0 || updating === section.id}
                  className="w-6 h-5 flex items-center justify-center rounded text-[var(--color-text)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-xs"
                  aria-label="Mover arriba"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === sorted.length - 1 || updating === section.id}
                  className="w-6 h-5 flex items-center justify-center rounded text-[var(--color-text)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-xs"
                  aria-label="Mover abajo"
                >
                  ▼
                </button>
              </div>
              <span className="font-medium text-[var(--color-text)]">{section.name}</span>
            </div>
            <Toggle
              checked={section.isVisible}
              onChange={(checked) => handleToggle(section, checked)}
              disabled={updating === section.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

