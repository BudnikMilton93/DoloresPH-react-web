import { useState } from 'react';
import type { SiteContent } from '../../types';
import { patchContent } from '../../api/admin';
import { Button } from '../../components/ui/Button';

interface ContentEditorProps {
  content: SiteContent[];
  token: string;
  onUpdate: () => void;
}

type FieldType = 'text' | 'textarea' | 'url';

const CONTENT_SCHEMA: { section: string; fields: { key: string; label: string; type: FieldType }[] }[] = [
  {
    section: 'Hero',
    fields: [
      { key: 'hero_headline', label: 'Headline', type: 'textarea' },
      { key: 'hero_subtext', label: 'Subtexto', type: 'textarea' },
    ],
  },
  {
    section: 'About',
    fields: [
      { key: 'about_subtitle', label: 'Subtítulo de sección', type: 'text' },
      { key: 'about_photo', label: 'URL de foto de perfil', type: 'url' },
      { key: 'about_bio', label: 'Biografía', type: 'textarea' },
      { key: 'about_years', label: 'Años de experiencia', type: 'text' },
      { key: 'about_sessions', label: 'Sesiones completadas', type: 'text' },
      { key: 'about_awards', label: 'Premios ganados', type: 'text' },
    ],
  },
  {
    section: 'Services',
    fields: [
      { key: 'services_list', label: 'Servicios (uno por línea)', type: 'textarea' },
    ],
  },
  {
    section: 'Contact',
    fields: [
      { key: 'contact_email', label: 'Email', type: 'text' },
      { key: 'contact_instagram', label: 'Instagram', type: 'text' },
    ],
  },
];

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-sm';

export function ContentEditor({ content, token, onUpdate }: ContentEditorProps) {
  const fromProps = Object.fromEntries(content.map((c) => [c.key, c.value]));
  const [values, setValues] = useState<Record<string, string>>(fromProps);
  const [savedValues, setSavedValues] = useState<Record<string, string>>(fromProps);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const hasChanges = Object.entries(values).some(([k, v]) => v !== (savedValues[k] ?? ''));

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const changed = Object.entries(values).filter(([k, v]) => v !== (savedValues[k] ?? ''));
    try {
      await Promise.all(changed.map(([key, val]) => patchContent(key, val, token)));
      setSavedValues({ ...values });
      setMessage('Contenido guardado correctamente.');
      onUpdate();
    } catch {
      setMessage('Error al guardar. La API puede no estar disponible.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setValues({ ...savedValues });
    setMessage('');
  };

  return (
    <div>
      <h2 className="text-2xl text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Editor de Contenido
      </h2>

      <div className="space-y-10">
        {CONTENT_SCHEMA.map(({ section, fields }) => (
          <div key={section}>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4">{section}</p>
            <div className="space-y-4 border-l-2 border-[var(--color-accent)]/20 pl-4">
              {fields.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-[var(--color-text)]/70 mb-1.5">
                    {label}
                  </label>
                  {type === 'textarea' ? (
                    <textarea
                      value={values[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      rows={key === 'services_list' ? 5 : 3}
                      className={`${inputClass} resize-none`}
                    />
                  ) : (
                    <input
                      type={type}
                      value={values[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {message && (
        <p className="text-sm text-[var(--color-text)]/60 mt-6">{message}</p>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="primary" onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? 'Guardando...' : 'Guardar Contenido'}
        </Button>
        <Button variant="outline" onClick={handleDiscard} disabled={!hasChanges}>
          Descartar Cambios
        </Button>
      </div>
    </div>
  );
}
