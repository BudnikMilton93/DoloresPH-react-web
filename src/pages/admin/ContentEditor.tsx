import { useRef, useState } from 'react';
import type { SiteContent } from '../../types';
import { patchContent } from '../../api/admin';
import { uploadPhotoToCloudinary, uploadMediaToCloudinary } from '../../api/cloudinary';
import { Button } from '../../components/ui/Button';
import { ImageCropper } from '../../components/ui/ImageCropper';

interface ContentEditorProps {
  content: SiteContent[];
  token: string;
  onUpdate: () => void;
}

type FieldType = 'text' | 'textarea' | 'url' | 'image-upload';

const CONTENT_SCHEMA: { section: string; fields: { key: string; label: string; type: FieldType }[] }[] = [
  {
    section: 'Hero',
    fields: [
      { key: 'hero_eyebrow', label: 'Eyebrow (texto sobre el título)', type: 'text' },
      { key: 'hero_headline', label: 'Headline', type: 'textarea' },
      { key: 'hero_subtext', label: 'Subtexto', type: 'textarea' },
    ],
  },
  {
    section: 'About',
    fields: [
      { key: 'about_subtitle', label: 'Subtítulo de sección', type: 'text' },
      { key: 'about_photo', label: 'Foto de perfil', type: 'image-upload' },
      { key: 'about_bio', label: 'Biografía', type: 'textarea' },
      { key: 'about_years', label: 'Años de experiencia', type: 'text' },
      { key: 'about_sessions', label: 'Sesiones completadas', type: 'text' },
      { key: 'about_awards', label: 'Fotografías capturadas', type: 'text' },
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
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropKey, setCropKey] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Abre el cropper al seleccionar archivo
  const handleFileSelected = (key: string, file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setCropKey(key);
    setCropSrc(objectUrl);
  };

  // Tras confirmar el recorte: sube a Cloudinary y actualiza values (no savedValues)
  const handleCropConfirm = async (blob: Blob) => {
    if (!cropKey) return;
    setCropSrc(null);
    setUploadingKey(cropKey);
    try {
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      const { url } = await uploadPhotoToCloudinary(file);
      // Solo actualiza values → activa el botón Guardar
      setValues((prev) => ({ ...prev, [cropKey]: url }));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setUploadingKey(null);
      setCropKey(null);
    }
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropKey(null);
  };

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
                      rows={key === 'about_bio' ? 8 : key === 'services_list' ? 5 : 3}
                      className={`${inputClass} resize-y`}
                    />
                  ) : type === 'image-upload' ? (
                    <div className="space-y-3">
                      {values[key] && (
                        <div className="relative mt-4">
                          <div className="absolute -top-3 -left-3 w-full h-full rounded-2xl border-2 border-primary/20" />
                          <img
                            src={values[key]}
                            alt="Foto de perfil"
                            className="relative z-10 rounded-2xl w-full object-cover h-96"
                          />
                        </div>
                      )}
                      <div className={`flex gap-2 items-center ${values[key] ? 'mt-6' : ''}`}>
                        <input
                          type="url"
                          value={values[key] ?? ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder="Pegar URL..."
                          className={`${inputClass} flex-1`}
                        />
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelected(key, file);
                          }}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingKey === key}
                          className="shrink-0"
                        >
                          {uploadingKey === key ? 'Subiendo...' : 'Subir'}
                        </Button>
                      </div>
                    </div>
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

      {cropSrc && cropKey && (
        <ImageCropper
          imageSrc={cropSrc}
          aspect={3 / 2}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
