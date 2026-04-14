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

  const handleToggle = async (section: Section, visible: boolean) => {
    setUpdating(section.id);
    try {
      await toggleSection(section.id, { isVisible: visible }, token);
      onUpdate();
    } catch {
      // API unavailable - handle gracefully
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-[var(--color-text)] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Section Visibility</h2>
      <div className="space-y-3">
        {[...sections].sort((a, b) => a.sortOrder - b.sortOrder).map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-accent)]/20"
          >
            <span className="font-medium text-[var(--color-text)]">{section.name}</span>
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
