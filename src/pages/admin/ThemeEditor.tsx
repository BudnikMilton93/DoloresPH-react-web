import { useState, useCallback } from 'react';
import type { ThemeConfig } from '../../types';
import { applyTheme } from '../../utils/theme';
import { patchTheme } from '../../api/siteConfig';
import { Button } from '../../components/ui/Button';

const PRESETS: { name: string; theme: Omit<ThemeConfig, 'id' | 'updatedAt'> }[] = [
  {
    name: 'Warm Purple',
    theme: { primary: '#7C5CBF', accent: '#B08AD9', background: '#EDE3F5', textColor: '#2D1B4E', surface: '#F5F0FA' },
  },
  {
    name: 'Cool Neutral',
    theme: { primary: '#6B7280', accent: '#9CA3AF', background: '#F9FAFB', textColor: '#111827', surface: '#FFFFFF' },
  },
  {
    name: 'Dark Editorial',
    theme: { primary: '#D1D5DB', accent: '#9CA3AF', background: '#111827', textColor: '#F9FAFB', surface: '#1F2937' },
  },
  {
    name: 'Warm Beige',
    theme: { primary: '#92400E', accent: '#D97706', background: '#FEF3C7', textColor: '#1C1917', surface: '#FFFBEB' },
  },
];

interface ThemeEditorProps {
  currentTheme: ThemeConfig;
  token: string;
  onUpdate: () => void;
}

export function ThemeEditor({ currentTheme, token, onUpdate }: ThemeEditorProps) {
  const [localTheme, setLocalTheme] = useState<ThemeConfig>(currentTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateColor = useCallback((key: keyof Omit<ThemeConfig, 'id' | 'updatedAt'>, value: string) => {
    setLocalTheme((prev) => {
      const updated = { ...prev, [key]: value };
      applyTheme(updated);
      return updated;
    });
  }, []);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const updated = { ...localTheme, ...preset.theme };
    setLocalTheme(updated);
    applyTheme(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await patchTheme(localTheme, token);
      setMessage('Theme saved!');
      onUpdate();
    } catch {
      setMessage('Failed to save. API may be unavailable.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setLocalTheme(currentTheme);
    applyTheme(currentTheme);
  };

  const colorFields: { key: keyof Omit<ThemeConfig, 'id' | 'updatedAt'>; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'accent', label: 'Accent' },
    { key: 'background', label: 'Background' },
    { key: 'textColor', label: 'Text' },
    { key: 'surface', label: 'Surface' },
  ];

  return (
    <div>
      <h2 className="text-2xl text-[var(--color-text)] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Theme Editor</h2>

      <div className="mb-8">
        <p className="text-sm text-[var(--color-text)]/60 mb-3">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-4 py-2 rounded-full border border-[var(--color-accent)]/30 text-sm text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {colorFields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <input
              type="color"
              value={localTheme[key]}
              onChange={(e) => updateColor(key, e.target.value)}
              className="w-10 h-10 rounded-lg border border-[var(--color-accent)]/30 cursor-pointer bg-transparent"
            />
            <div>
              <p className="font-medium text-[var(--color-text)] text-sm">{label}</p>
              <p className="text-xs text-[var(--color-text)]/50">{localTheme[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {message && <p className="text-sm text-[var(--color-text)]/60 mb-4">{message}</p>}

      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Theme'}
        </Button>
        <Button variant="outline" onClick={handleDiscard}>
          Discard Changes
        </Button>
      </div>
    </div>
  );
}
