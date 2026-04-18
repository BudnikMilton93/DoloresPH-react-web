import { useState, useCallback } from 'react';
import type { ThemeConfig, SiteContent } from '../../types';
import { applyTheme, loadCustomFonts } from '../../utils/theme';
import { patchTheme } from '../../api/siteConfig';
import { patchContent } from '../../api/admin';
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
  content: SiteContent[];
  token: string;
  onUpdate: () => void;
}

export function ThemeEditor({ currentTheme, content, token, onUpdate }: ThemeEditorProps) {
  const [localTheme, setLocalTheme] = useState<ThemeConfig>(currentTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // ── Custom font library ──────────────────────────────────────────────────
  const parseCustomFonts = (c: SiteContent[]) =>
    (c.find((x) => x.key === 'custom_fonts')?.value || '')
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

  const [customFonts, setCustomFonts] = useState<string[]>(() => parseCustomFonts(content));
  const [fontInput, setFontInput] = useState('');
  const [fontMsg, setFontMsg] = useState('');
  const [savingFont, setSavingFont] = useState(false);

  const MAX_FONTS = 10;

  async function handleAddFont() {
    const name = fontInput.trim();
    if (!name) return;
    if (customFonts.map((f) => f.toLowerCase()).includes(name.toLowerCase())) {
      setFontMsg('Esa fuente ya está en tu biblioteca.');
      return;
    }
    if (customFonts.length >= MAX_FONTS) {
      setFontMsg(`Máximo ${MAX_FONTS} fuentes. Eliminá una para agregar otra.`);
      return;
    }
    setSavingFont(true);
    setFontMsg('');
    const next = [...customFonts, name];
    try {
      await patchContent('custom_fonts', next.join(','), token);
      loadCustomFonts(next.join(','));
      setCustomFonts(next);
      setFontInput('');
      setFontMsg(`"${name}" agregada.`);
      onUpdate();
    } catch {
      // sin API: guardar localmente igual
      loadCustomFonts(next.join(','));
      setCustomFonts(next);
      setFontInput('');
      setFontMsg(`"${name}" cargada (sin servidor).`);
    } finally {
      setSavingFont(false);
    }
  }

  async function handleRemoveFont(font: string) {
    const next = customFonts.filter((f) => f !== font);
    try {
      await patchContent('custom_fonts', next.join(','), token);
      onUpdate();
    } catch { /* sin API */ }
    setCustomFonts(next);
    // si era la fuente activa, revertir a default
    const updated = { ...localTheme };
    if (localTheme.fontHeading === font) updated.fontHeading = 'Playfair Display';
    if (localTheme.fontBody === font) updated.fontBody = 'DM Sans';
    if (updated.fontHeading !== localTheme.fontHeading || updated.fontBody !== localTheme.fontBody) {
      setLocalTheme(updated);
      applyTheme(updated);
    }
  }

  // Merged font lists: built-in + custom (deduplicated)
  const allHeadingFonts = [...new Set([...HEADING_FONTS, ...customFonts])];
  const allBodyFonts = [...new Set([...BODY_FONTS, ...customFonts])];

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
    setMessageType('');
    try {
      await patchTheme(localTheme, token);
      setMessage('Tema guardado correctamente.');
      setMessageType('success');
      onUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error al guardar. La API puede no estar disponible.');
      setMessageType('error');
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
    'w-full px-4 py-3 rounded-xl border border-accent/30 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm';

  return (
    <div>
      <h2 className="text-2xl text-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Editor de Tema</h2>

      <div className="mb-6">
        <p className="text-xs text-text/50 mt-0.5">Edita la paleta de colores a tu gusto y personaliza la tipografía de tu sitio.</p>
      </div>


      {/* Presets */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-4 py-2 rounded-full border border-accent/30 text-sm text-text hover:border-primary hover:text-primary transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Colores</p>
        <div className="space-y-4">
          {colorFields.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <input
                type="color"
                value={localTheme[key] as string}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-10 h-10 rounded-lg border border-accent/30 cursor-pointer bg-transparent"
              />
              <div>
                <p className="font-medium text-text text-sm">{label}</p>
                <p className="text-xs text-text/50">{localTheme[key] as string}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Tipografía</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text/70 mb-1.5">
              Fuente de títulos
            </label>
            <select
              value={localTheme.fontHeading}
              onChange={(e) => updateFont('fontHeading', e.target.value)}
              className={selectClass}
              style={{ fontFamily: `'${localTheme.fontHeading}', serif` }}
            >
              {allHeadingFonts.map((f) => (
                <option key={f} value={f} style={{ fontFamily: `'${f}', serif` }}>{f}{customFonts.includes(f) ? ' ★' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text/70 mb-1.5">
              Fuente de cuerpo
            </label>
            <select
              value={localTheme.fontBody}
              onChange={(e) => updateFont('fontBody', e.target.value)}
              className={selectClass}
              style={{ fontFamily: `'${localTheme.fontBody}', sans-serif` }}
            >
              {allBodyFonts.map((f) => (
                <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}{customFonts.includes(f) ? ' ★' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Font Library */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">Mis Fuentes</p>
        <p className="text-xs text-text/50 mb-4">
          Agregá hasta {MAX_FONTS} fuentes de{' '}
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Google Fonts
          </a>
          . Copiá el nombre exacto y pegalo abajo. Las fuentes marcadas con ★ son tuyas.
        </p>

        {/* Input row */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="text"
            value={fontInput}
            onChange={(e) => setFontInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFont()}
            placeholder="Ej: Bodoni Moda, Abril Fatface..."
            className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-accent/30 bg-background text-text outline-none focus:border-accent"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddFont}
            disabled={savingFont || customFonts.length >= MAX_FONTS}
            className="flex-shrink-0"
          >
            {savingFont ? '...' : `Agregar (${customFonts.length}/${MAX_FONTS})`}
          </Button>
        </div>

        {fontMsg && (
          <p className="text-xs text-primary mb-3">{fontMsg}</p>
        )}

        {/* Font list */}
        {customFonts.length > 0 && (
          <div className="space-y-2">
            {customFonts.map((font) => (
              <div
                key={font}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-background border border-accent/20"
              >
                <div className="min-w-0">
                  <p className="text-base truncate" style={{ fontFamily: `'${font}', serif` }}>
                    {font}
                  </p>
                  <p className="text-xs text-text/40" style={{ fontFamily: `'${font}', serif` }}>
                    Abcdefg 123 — The quick brown fox
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFont(font)}
                  className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {customFonts.length === 0 && (
          <p className="text-xs text-text/40 italic">
            No hay fuentes personalizadas todavia.
          </p>
        )}
      </div>

      {message && (
        <p className={`text-sm px-4 py-2 rounded-lg mb-4 flex items-center gap-1.5 ${
          messageType === 'success'
            ? 'text-green-600 bg-green-50'
            : messageType === 'error'
            ? 'text-red-600 bg-red-50'
            : 'text-text/60'
        }`}>
          {messageType === 'success' && <span>✓</span>}
          {message}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button variant="outline" onClick={handleDiscard}>
          Descartar
        </Button>
      </div>
    </div>
  );
}


