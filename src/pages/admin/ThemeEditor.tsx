import { useState, useCallback } from 'react';
import type { ThemeConfig } from '../../types';
import { applyTheme } from '../../utils/theme';
import { patchTheme } from '../../api/siteConfig';
import { Button } from '../../components/ui/Button';

const PRESETS: { name: string; theme: Omit<ThemeConfig, 'id' | 'updatedAt'> }[] = [
  {
    name: 'Warm Purple',
    theme: { primary: '#7C5CBF', accent: '#B08AD9', background: '#EDE3F5', textColor: '#2D1B4E', surface: '#F5F0FA', fontHeading: 'Playfair Display', fontBody: 'DM Sans' },
  },
  {
    name: 'Cool Neutral',
    theme: { primary: '#6B7280', accent: '#9CA3AF', background: '#F9FAFB', textColor: '#111827', surface: '#FFFFFF', fontHeading: 'Josefin Sans', fontBody: 'Inter' },
  },
  {
    name: 'Dark Editorial',
    theme: { primary: '#D1D5DB', accent: '#9CA3AF', background: '#111827', textColor: '#F9FAFB', surface: '#1F2937', fontHeading: 'Raleway', fontBody: 'Lato' },
  },
  {
    name: 'Warm Beige',
    theme: { primary: '#92400E', accent: '#D97706', background: '#FEF3C7', textColor: '#1C1917', surface: '#FFFBEB', fontHeading: 'Cormorant Garamond', fontBody: 'Jost' },
  },
];

const HEADING_FONTS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Lora',
  'DM Serif Display',
  'EB Garamond',
  'Libre Baskerville',
  'Josefin Sans',
  'Raleway',
];

const BODY_FONTS = [
  'DM Sans',
  'Inter',
  'Lato',
  'Nunito',
  'Open Sans',
  'Jost',
  'Montserrat',
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

  const updateFont = useCallback((key: 'fontHeading' | 'fontBody', value: string) => {
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
      setMessage('Tema guardado correctamente.');
      onUpdate();
    } catch {
      setMessage('Error al guardar. La API puede no estar disponible.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setLocalTheme(currentTheme);
    applyTheme(currentTheme);
  };

  const colorFields: { key: keyof Omit<ThemeConfig, 'id' | 'updatedAt' | 'fontHeading' | 'fontBody'>; label: string }[] = [
    { key: 'primary', label: 'Primario' },
    { key: 'accent', label: 'Acento' },
    { key: 'background', label: 'Fondo' },
    { key: 'textColor', label: 'Texto' },
    { key: 'surface', label: 'Superficie' },
  ];

  const selectClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-sm';

  return (
    <div>
      <h2 className="text-2xl text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Editor de Tema</h2>

      {/* Presets */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] mb-3">Presets</p>
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

      {/* Colors */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4">Colores</p>
        <div className="space-y-4">
          {colorFields.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <input
                type="color"
                value={localTheme[key] as string}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-10 h-10 rounded-lg border border-[var(--color-accent)]/30 cursor-pointer bg-transparent"
              />
              <div>
                <p className="font-medium text-[var(--color-text)] text-sm">{label}</p>
                <p className="text-xs text-[var(--color-text)]/50">{localTheme[key] as string}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4">TipografÃ­a</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)]/70 mb-1.5">
              Fuente de tÃ­tulos
            </label>
            <select
              value={localTheme.fontHeading}
              onChange={(e) => updateFont('fontHeading', e.target.value)}
              className={selectClass}
              style={{ fontFamily: `'${localTheme.fontHeading}', serif` }}
            >
              {HEADING_FONTS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: `'${f}', serif` }}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)]/70 mb-1.5">
              Fuente de cuerpo
            </label>
            <select
              value={localTheme.fontBody}
              onChange={(e) => updateFont('fontBody', e.target.value)}
              className={selectClass}
              style={{ fontFamily: `'${localTheme.fontBody}', sans-serif` }}
            >
              {BODY_FONTS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message && <p className="text-sm text-[var(--color-text)]/60 mb-4">{message}</p>}

      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Tema'}
        </Button>
        <Button variant="outline" onClick={handleDiscard}>
          Descartar Cambios
        </Button>
      </div>
    </div>
  );
}


