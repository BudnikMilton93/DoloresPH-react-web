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
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropKey, setCropKey] = useState<string | null>(null);
  const [profilePhotoOrientation, setProfilePhotoOrientation] = useState<'portrait' | 'landscape'>(
    (fromProps['about_photo_orientation'] as 'portrait' | 'landscape') || 'landscape'
  );
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
      setMessage('Foto subida con éxito.');
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
      // Guardar orientación de la foto de perfil
      await patchContent('about_photo_orientation', profilePhotoOrientation, token);
      setSavedValues({ ...values });
      setMessage('Contenido guardado correctamente.');
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
    setValues({ ...savedValues });
    setMessage('');
  };

  return (
    <div>
      <h2 className="text-2xl text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Editor de Contenido
      </h2>

      <div className="mb-6">
        <p className="text-xs text-text/50 mt-0.5">Edita el texto de cada sección a tu gusto, también podes cargar la foto de perfil en la orientación que desees.</p>
      </div>

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
                      {key === 'about_photo' && (
                        <div className="flex gap-6 mb-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="photo-orientation"
                              value="landscape"
                              checked={profilePhotoOrientation === 'landscape'}
                              onChange={() => setProfilePhotoOrientation('landscape')}
                              className="w-4 h-4 accent-[var(--color-primary)]"
                            />
                            <span className="text-sm text-[var(--color-text)]/70">Horizontal (landscape)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="photo-orientation"
                              value="portrait"
                              checked={profilePhotoOrientation === 'portrait'}
                              onChange={() => setProfilePhotoOrientation('portrait')}
                              className="w-4 h-4 accent-[var(--color-primary)]"
                            />
                            <span className="text-sm text-[var(--color-text)]/70">Vertical (portrait)</span>
                          </label>
                        </div>
                      )}
                      {values[key] && (
                        <div className={`relative mt-4 ${
                          key === 'about_photo' && profilePhotoOrientation === 'portrait'
                            ? 'flex justify-center'
                            : ''
                        }`}>
                          <div className="relative">
                            <div className={`absolute -top-3 -left-3 rounded-2xl border-2 border-primary/20 ${
                              key === 'about_photo' && profilePhotoOrientation === 'portrait'
                                ? 'w-72 h-96'
                                : 'w-full h-full'
                            }`} />
                            <img
                              src={values[key]}
                              alt="Foto de perfil"
                              className={`relative z-10 rounded-2xl object-cover ${
                                key === 'about_photo' && profilePhotoOrientation === 'portrait'
                                  ? 'w-72 h-96'
                                  : 'w-full h-96'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                      <div className={values[key] ? 'mt-6' : ''}>
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
                        >
                          {uploadingKey === key ? 'Subiendo...' : 'Subir foto'}
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
        <div className={`text-sm mt-6 px-4 py-2.5 rounded-lg flex items-center gap-2 ${
          messageType === 'success'
            ? 'bg-green-50 text-green-700'
            : messageType === 'error'
            ? 'bg-red-50 text-red-700'
            : 'text-[var(--color-text)]/60'
        }`}>
          {messageType === 'success' && <span>✓</span>}
          {messageType === 'error' && <span>✕</span>}
          {message}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="primary" onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button variant="outline" onClick={handleDiscard} disabled={!hasChanges}>
          Descartar
        </Button>
      </div>

      {cropSrc && cropKey && (
        <ImageCropper
          imageSrc={cropSrc}
          aspect={profilePhotoOrientation === 'portrait' ? 3 / 4 : 3 / 2}
          orientation={profilePhotoOrientation}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
