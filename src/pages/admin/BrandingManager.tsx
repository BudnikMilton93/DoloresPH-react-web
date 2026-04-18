import { useRef, useState } from 'react';
import type { SiteContent } from '../../types';
import { patchContent, uploadMediaAsset } from '../../api/admin';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface BrandingManagerProps {
  content: SiteContent[];
  token: string;
  onUpdate: () => void;
}

const SLOTS = [
  { key: 'logo_url',               label: 'Logo principal',              hint: 'Aparece en el header y en el footer del sitio.' },
  { key: 'brandmark_about',        label: 'Infrasigno — About',          hint: 'Se superpone como sello en la esquina de tu foto de perfil.' },
  { key: 'brandmark_portfolio',    label: 'Infrasigno — Portfolio',      hint: 'Aparece ubicado al pie y a la derecha de la galería de fotos.' },
  { key: 'brandmark_essays',       label: 'Infrasigno — Ensayos',        hint: 'Aparece al pie y a la izquierda de la sección de ensayos fotográficos.' },
  { key: 'brandmark_services',     label: 'Infrasigno — Servicios',      hint: 'Aparece a la derecha y al pie del listado de servicios.' },
  { key: 'brandmark_testimonials', label: 'Infrasigno — Testimonios',    hint: 'Aparece a la izquierda y al pie de la sección de testimonios.' },
  { key: 'brandmark_contact',      label: 'Infrasigno — Contacto',       hint: 'Más diminuto, aparece al pie y a la derecha de la sección de contacto.' },
  { key: 'brandmark_footer',       label: 'Infrasigno — Footer',         hint: 'Aparece al final del sitio, flanqueado por lineas decorativas entre el logo y el copyright.' },
] as const;

type SlotKey = typeof SLOTS[number]['key'];

interface SlotState {
  uploading: boolean;
  error: string | null;
  urlInput: string;
  saved: boolean;
}

export function BrandingManager({ content, token, onUpdate }: BrandingManagerProps) {
  const initialUrlInputs = Object.fromEntries(
    SLOTS.map(({ key }) => [key, content.find((c) => c.key === key)?.value || ''])
  ) as Record<SlotKey, string>;

  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
    logo_url:               { uploading: false, error: null, urlInput: initialUrlInputs.logo_url, saved: false },
    brandmark_about:        { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_about, saved: false },
    brandmark_portfolio:    { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_portfolio, saved: false },
    brandmark_essays:       { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_essays, saved: false },
    brandmark_services:     { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_services, saved: false },
    brandmark_testimonials: { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_testimonials, saved: false },
    brandmark_contact:      { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_contact, saved: false },
    brandmark_footer:       { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_footer, saved: false },
  });

  const [confirmDelete, setConfirmDelete] = useState<{key: SlotKey, label: string} | null>(null);

  const refLogoUrl            = useRef<HTMLInputElement>(null);
  const refBrandmarkAbout     = useRef<HTMLInputElement>(null);
  const refBrandmarkPortfolio = useRef<HTMLInputElement>(null);
  const refBrandmarkEssays    = useRef<HTMLInputElement>(null);
  const refBrandmarkSvcs      = useRef<HTMLInputElement>(null);
  const refBrandmarkTestim    = useRef<HTMLInputElement>(null);
  const refBrandmarkCont      = useRef<HTMLInputElement>(null);
  const refBrandmarkFoot      = useRef<HTMLInputElement>(null);

  const fileRefs = {
    logo_url:               refLogoUrl,
    brandmark_about:        refBrandmarkAbout,
    brandmark_portfolio:    refBrandmarkPortfolio,
    brandmark_essays:       refBrandmarkEssays,
    brandmark_services:     refBrandmarkSvcs,
    brandmark_testimonials: refBrandmarkTestim,
    brandmark_contact:      refBrandmarkCont,
    brandmark_footer:       refBrandmarkFoot,
  };

  function setSlot(key: SlotKey, patch: Partial<SlotState>) {
    setSlots((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  async function handleFileChange(key: SlotKey, file: File | null) {
    if (!file) return;
    if (file.type !== 'image/png') {
      setSlot(key, { error: 'Solo se permiten archivos PNG.' });
      return;
    }
    setSlot(key, { uploading: true, error: null, saved: false });
    try {
      const { url } = await uploadMediaAsset(file, token);
      await patchContent(key, url, token);
      setSlot(key, { uploading: false, urlInput: url, saved: true });
      onUpdate();
      setTimeout(() => setSlot(key, { saved: false }), 3000);
    } catch (err) {
      setSlot(key, { uploading: false, error: err instanceof Error ? err.message : 'Error al subir el archivo.' });
    }
  }

  async function handleSaveUrl(key: SlotKey) {
    const url = slots[key].urlInput.trim();
    setSlot(key, { uploading: true, error: null, saved: false });
    try {
      await patchContent(key, url, token);
      setSlot(key, { uploading: false, saved: true });
      onUpdate();
      setTimeout(() => setSlot(key, { saved: false }), 3000);
    } catch {
      setSlot(key, { uploading: false, error: 'Error al guardar.' });
    }
  }

  async function handleDeleteBrandmark(key: SlotKey, label: string) {
    setConfirmDelete({ key, label });
  }

  async function confirmDeleteBrandmark() {
    if (!confirmDelete) return;
    const { key, label } = confirmDelete;
    setConfirmDelete(null);
    setSlot(key, { uploading: true, error: null, saved: false });
    try {
      await patchContent(key, '', token);
      setSlot(key, { uploading: false, urlInput: '', saved: true });
      onUpdate();
      setTimeout(() => setSlot(key, { saved: false }), 3000);
    } catch (err) {
      setSlot(key, { uploading: false, error: `Error al eliminar "${label}".` });
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
        Branding
      </h2>

      <p className="text-xs text-text/50 mt-0.5">Cada infrasigno tiene una ubicación específica en su sección correspondiente, podes como no cargarlos.</p>

      {SLOTS.map(({ key, label, hint }) => {
        const state = slots[key];
        const currentUrl = content.find((c) => c.key === key)?.value || state.urlInput;
        return (
          <div key={key} className="rounded-xl border border-accent/20 p-5 space-y-4">
            <div>
              <p className="font-semibold text-text" style={{ fontFamily: 'var(--font-heading)' }}>{label}</p>
              <p className="text-xs text-text/50 mt-0.5">{hint}</p>
            </div>

            {(currentUrl || state.urlInput) && (
              <div className="flex items-center justify-center bg-background rounded-lg p-4 h-24">
                <img
                  src={state.urlInput || currentUrl}
                  alt={label}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}

            <div className="space-y-3">
              <input
                ref={fileRefs[key]}
                type="file"
                accept="image/png"
                className="hidden"
                onChange={(e) => handleFileChange(key, e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => fileRefs[key].current?.click()}
                    disabled={state.uploading}
                    className="flex-1 sm:flex-none"
                  >
                    {state.uploading ? 'Subiendo y guardando...' : 'Cargar PNG'}
                  </Button>
                  {currentUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBrandmark(key, label)}
                      disabled={state.uploading}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <span className="text-xs text-text/40 text-center sm:text-left">Se guarda automáticamente al cargar</span>
              </div>
            </div>

            {state.saved && (
              <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <span>✓</span> Guardado exitosamente
              </p>
            )}

            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
          </div>
        );
      })}
      
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Eliminar infrasigno"
        message={`¿Estás seguro de que quieres eliminar "${confirmDelete?.label}"?\n\nEsta acción se puede deshacer cargando el infrasigno nuevamente.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeleteBrandmark}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
