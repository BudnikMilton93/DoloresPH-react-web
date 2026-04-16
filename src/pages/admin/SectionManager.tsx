import { useState, useRef } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import type { Section } from '../../types';
import { Toggle } from '../../components/ui/Toggle';
import { toggleSection } from '../../api/admin';

interface SectionManagerProps {
  sections: Section[];
  token: string;
  onUpdate: () => void;
}

function SectionItem({
  section,
  updating,
  onToggle,
}: {
  section: Section;
  updating: number | null;
  onToggle: (section: Section, visible: boolean) => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-accent)]/20 list-none"
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing touch-none select-none px-1 text-[var(--color-text)]/30 hover:text-[var(--color-primary)] transition-colors"
          aria-label="Arrastrar para reordenar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </div>
        <span className="font-medium text-[var(--color-text)]">{section.name}</span>
      </div>
      <Toggle
        checked={section.isVisible}
        onChange={(checked) => onToggle(section, checked)}
        disabled={updating === section.id}
      />
    </Reorder.Item>
  );
}

export function SectionManager({ sections, token, onUpdate }: SectionManagerProps) {
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Section[]>(() =>
    [...sections].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const prevSectionsRef = useRef(sections);

  // Sync local order when sections prop changes (after API update)
  if (prevSectionsRef.current !== sections) {
    prevSectionsRef.current = sections;
    setOrder([...sections].sort((a, b) => a.sortOrder - b.sortOrder));
  }

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

  const handleReorderEnd = async () => {
    setError('');
    // Build updates: assign new sortOrder based on position
    const updates = order.map((section, index) => ({
      id: section.id,
      newOrder: index + 1,
      oldOrder: section.sortOrder,
    })).filter((u) => u.newOrder !== u.oldOrder);

    if (updates.length === 0) return;

    setUpdating(updates[0].id);
    try {
      await Promise.all(
        updates.map((u) => toggleSection(u.id, { sortOrder: u.newOrder }, token))
      );
      onUpdate();
    } catch {
      setError('No se pudo reordenar. Intentá de nuevo.');
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
        Activá/desactivá secciones y arrastralas para cambiar su orden.
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setOrder}
        className="space-y-3"
      >
        {order.map((section) => (
          <SectionItem
            key={section.id}
            section={section}
            updating={updating}
            onToggle={handleToggle}
          />
        ))}
      </Reorder.Group>

      {/* Save button appears when order changed */}
      {order.some((s, i) => s.sortOrder !== i + 1) && (
        <button
          onClick={handleReorderEnd}
          disabled={updating !== null}
          className="mt-4 px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {updating !== null ? 'Guardando...' : 'Guardar orden'}
        </button>
      )}
    </div>
  );
}

