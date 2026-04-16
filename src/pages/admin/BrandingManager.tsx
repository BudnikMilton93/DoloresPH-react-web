import { useRef, useState } from 'react';
import type { SiteContent } from '../../types';
import { patchContent, uploadMediaAsset } from '../../api/admin';
import { Button } from '../../components/ui/Button';

interface BrandingManagerProps {
  content: SiteContent[];
  token: string;
  onUpdate: () => void;
}

const SLOTS = [
  { key: 'logo_url',               label: 'Logo principal',              hint: 'Aparece en el header y en el footer del sitio.' },
  { key: 'brandmark_about',        label: 'Infrasigno — About',          hint: 'Se superpone como sello en la esquina de tu foto de perfil.' },
  { key: 'brandmark_portfolio',    label: 'Infrasigno — Portfolio',      hint: 'Aparece sutil al pie de la galería de fotos.' },
  { key: 'brandmark_essays',       label: 'Infrasigno — Ensayos',        hint: 'Aparece al pie de la sección de ensayos fotográficos.' },
  { key: 'brandmark_services',     label: 'Infrasigno — Servicios',      hint: 'Aparece centrado al pie del listado de servicios.' },
  { key: 'brandmark_testimonials', label: 'Infrasigno — Testimonios',    hint: 'Aparece al pie de la sección de testimonios.' },
  { key: 'brandmark_contact',      label: 'Infrasigno — Contacto',       hint: 'Aparece centrado al pie de la seccion de contacto.' },
  { key: 'brandmark_footer',       label: 'Infrasigno — Footer',         hint: 'Flanqueado por lineas decorativas entre el logo y el copyright.' },
] as const;

type SlotKey = typeof SLOTS[number]['key'];

interface SlotState {
  uploading: boolean;
  error: string | null;
  urlInput: string;
}

export function BrandingManager({ content, token, onUpdate }: BrandingManagerProps) {
  const initialUrlInputs = Object.fromEntries(
    SLOTS.map(({ key }) => [key, content.find((c) => c.key === key)?.value || ''])
  ) as Record<SlotKey, string>;

  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
    logo_url:               { uploading: false, error: null, urlInput: initialUrlInputs.logo_url },
    brandmark_about:        { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_about },
    brandmark_portfolio:    { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_portfolio },
    brandmark_essays:       { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_essays },
    brandmark_services:     { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_services },
    brandmark_testimonials: { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_testimonials },
    brandmark_contact:      { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_contact },
    brandmark_footer:       { uploading: false, error: null, urlInput: initialUrlInputs.brandmark_footer },
  });
  const [saved, setSaved] = useState(false);

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
    setSlot(key, { uploading: true, error: null });
    try {
      const { url } = await uploadMediaAsset(file, token);
      await patchContent(key, url, token);
      setSlot(key, { uploading: false, urlInput: url });
      onUpdate();
    } catch (err) {
      setSlot(key, { uploading: false, error: err instanceof Error ? err.message : 'Error al subir el archivo.' });
    }
  }

  async function handleSaveUrl(key: SlotKey) {
    const url = slots[key].urlInput.trim();
    setSlot(key, { uploading: true, error: null });
    try {
      await patchContent(key, url, token);
      setSlot(key, { uploading: false });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate();
    } catch {
      setSlot(key, { uploading: false, error: 'Error al guardar.' });
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
        Branding
      </h2>
      {saved && (
        <p className="text-sm text-green-600 bg-green-50 rounded-lg px-4 py-2">Guardado exitosamente.</p>
      )}

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

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={state.urlInput}
                placeholder="Pegar URL de imagen PNG..."
                onChange={(e) => setSlot(key, { urlInput: e.target.value })}
                className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-accent/30 bg-background text-text outline-none focus:border-accent"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSaveUrl(key)}
                disabled={state.uploading}
                className="shrink-0"
              >
                {state.uploading ? '...' : 'Guardar'}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileRefs[key]}
                type="file"
                accept="image/png"
                className="hidden"
                onChange={(e) => handleFileChange(key, e.target.files?.[0] ?? null)}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => fileRefs[key].current?.click()}
                disabled={state.uploading}
              >
                {state.uploading ? 'Subiendo...' : 'Cargar PNG'}
              </Button>
              <span className="text-xs text-text/40">Solo archivos .png</span>
            </div>

            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
