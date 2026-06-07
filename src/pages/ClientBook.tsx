import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { supabase } from '../lib/supabase';
import { fetchEssayByCode } from '../api/siteConfig';
import { getBrandmarkSize } from '../api/siteConfig';
import { Lightbox } from '../components/ui/Lightbox';
import { Brandmark } from '../components/ui/Brandmarks';
import type { Essay, Photo, SiteContent } from '../types';

// Build a Cloudinary URL that delivers PNG and forces browser download.
// The stored URLs use f_webp in their transformation chain — we replace it with f_png.
function toCloudinaryPng(url: string, attachment = false): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes('cloudinary.com')) {
      let result = url
        .replace(/\bf_webp\b/g, 'f_png')
        .replace(/\bf_auto\b/g, 'f_png')
        .replace(/\.(webp|avif)(\?.*)?$/i, '.png');
      if (attachment) {
        result = result.replace('/upload/', '/upload/fl_attachment/');
      }
      return result;
    }
  } catch { /* non-cloudinary — return as-is */ }
  return url;
}

async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

async function downloadSingle(photo: Photo): Promise<void> {
  const url = toCloudinaryPng(photo.url, true);
  try {
    const blob = await fetchBlob(url);
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `${photo.alt || 'foto'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank');
  }
}

async function downloadAllAsZip(photos: Photo[], essayTitle: string): Promise<void> {
  const zip = new JSZip();
  await Promise.all(
    photos.map(async (photo, i) => {
      try {
        const url = toCloudinaryPng(photo.url, false);
        const blob = await fetchBlob(url);
        const name = `${String(i + 1).padStart(2, '0')}_${photo.alt || 'foto'}.png`;
        zip.file(name, blob);
      } catch { /* skip failed photos */ }
    }),
  );
  const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const objectUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `${essayTitle || 'book'}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

function AnimatedCamera() {
  return (
    <motion.svg
      width="96"
      height="96"
      viewBox="0 0 100 105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ scale: [1, 1.04, 0.97, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6, 1] }}
    >
      {/* Camera body */}
      <rect x="8" y="32" width="84" height="60" rx="11"
        fill="var(--color-primary)" fillOpacity="0.08"
        stroke="var(--color-primary)" strokeWidth="2.5" strokeOpacity="0.5" />

      {/* Viewfinder bump */}
      <path d="M33 32V23a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v9"
        fill="var(--color-primary)" fillOpacity="0.06"
        stroke="var(--color-primary)" strokeWidth="2.5" strokeOpacity="0.5" />

      {/* Flash */}
      <rect x="13" y="40" width="15" height="10" rx="3"
        fill="var(--color-primary)" fillOpacity="0.15"
        stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Shutter button */}
      <circle cx="78" cy="23" r="5"
        fill="var(--color-primary)" fillOpacity="0.25"
        stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.5" />

      {/* Rotating aperture blades */}
      <motion.g
        style={{ transformOrigin: '50px 62px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 30, 60, 90, 120, 150].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1={50 + 13 * Math.cos(rad)} y1={62 + 13 * Math.sin(rad)}
              x2={50 - 13 * Math.cos(rad)} y2={62 - 13 * Math.sin(rad)}
              stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.3"
            />
          );
        })}
      </motion.g>

      {/* Outer lens ring */}
      <circle cx="50" cy="62" r="24"
        fill="var(--color-primary)" fillOpacity="0.06"
        stroke="var(--color-primary)" strokeWidth="2.5" strokeOpacity="0.5" />

      {/* Middle lens ring */}
      <circle cx="50" cy="62" r="15"
        fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.3" />

      {/* Lens highlight */}
      <circle cx="43" cy="55" r="3" fill="white" fillOpacity="0.3" />

      {/* Center dot */}
      <circle cx="50" cy="62" r="4"
        fill="var(--color-primary)" fillOpacity="0.35" />
    </motion.svg>
  );
}

// Polaroid-style cards that fan out and back in a loop
const POLAROID_CARDS = [
  { rotate: -14, x: -22, delay: 0 },
  { rotate: 0,   x: 0,   delay: 0.08 },
  { rotate: 14,  x: 22,  delay: 0.16 },
];

function AnimatedPhotos() {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {POLAROID_CARDS.map((card, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: 58, height: 70 }}
          initial={{ rotate: 0, x: 0, y: 0, opacity: 0 }}
          animate={{
            rotate: [0, card.rotate, card.rotate, 0],
            x:      [0, card.x,      card.x,      0],
            y:      [0, -4,          -4,           0],
            opacity:[0, 1,           1,            0.8],
          }}
          transition={{
            duration: 3.2,
            delay: card.delay,
            repeat: Infinity,
            repeatDelay: 0.4,
            ease: 'easeInOut',
            times: [0, 0.25, 0.7, 1],
          }}
        >
          {/* Polaroid frame */}
          <div
            className="w-full h-full rounded-sm shadow-md flex flex-col overflow-hidden"
            style={{
              background: 'var(--color-surface, #fff)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
            }}
          >
            {/* Photo area */}
            <div
              className="flex-1 mx-2 mt-2 rounded-sm"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
            >
              {/* tiny landscape lines */}
              <svg width="100%" height="100%" viewBox="0 0 42 38" preserveAspectRatio="none">
                <rect width="42" height="38" fill="none" />
                {/* sky */}
                <rect x="0" y="0" width="42" height="20"
                  fill="color-mix(in srgb, var(--color-primary) 8%, transparent)" />
                {/* hills */}
                <ellipse cx="12" cy="26" rx="14" ry="10"
                  fill="color-mix(in srgb, var(--color-primary) 18%, transparent)" />
                <ellipse cx="34" cy="28" rx="12" ry="9"
                  fill="color-mix(in srgb, var(--color-primary) 12%, transparent)" />
                {/* sun */}
                <circle cx="32" cy="9" r="5"
                  fill="color-mix(in srgb, var(--color-primary) 30%, transparent)" />
              </svg>
            </div>
            {/* White strip at bottom (polaroid caption area) */}
            <div className="h-4" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CyclingHeroIcon() {
  const [scene, setScene] = useState<'camera' | 'photos'>('camera');

  useEffect(() => {
    const id = setInterval(() => {
      setScene((s) => (s === 'camera' ? 'photos' : 'camera'));
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {scene === 'camera' ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotate: 6 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            <AnimatedCamera />
          </motion.div>
        ) : (
          <motion.div
            key="photos"
            initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotate: -6 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            <AnimatedPhotos />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CodeForm({ onSubmit, logoUrl, brandmarkFooter, siteContent = [] }: { onSubmit: (code: string) => void; logoUrl?: string; brandmarkFooter?: string; siteContent?: SiteContent[] }) {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length >= 4) onSubmit(trimmed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center flex flex-col gap-10">

        {/* Ícono animado (cámara / fotos) */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <CyclingHeroIcon />
        </motion.div>

        {/* Título y descripción */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-4xl text-text leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Tu book de fotos
          </h1>
          <p className="text-sm text-text/60 leading-relaxed">
            Acá podés ingresar el código compartido para acceder a tus fotos y descargarlas cuando quieras. Si tenés problemas no dudes en contactarme. ¡Espero que las disfrutes!
          </p>
        </motion.div>

        {/* Formulario */}
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: X4KM9RQA"
            maxLength={12}
            className="w-full px-4 py-4 rounded-xl border border-accent/30 bg-surface text-text text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-text/25 placeholder:text-base placeholder:font-sans placeholder:tracking-normal"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={code.trim().length < 4}
            className="w-full py-3.5 rounded-full bg-[var(--color-primary)] text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ver mis fotos
          </button>
        </motion.form>
        
      </div>
      </div>

      {/* Footer */}
      <footer className="bg-text py-6">
        <div className="max-w-sm mx-auto px-4 text-center">
          {logoUrl ? (
            <img src={logoUrl} alt="Dolores PH" className="h-7 w-auto object-contain mx-auto mb-2.5 opacity-90" />
          ) : (
            <p className="text-sm text-surface mb-2.5" style={{ fontFamily: 'var(--font-heading)' }}>Dolores PH</p>
          )}
          {brandmarkFooter && (
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span className="flex-1 max-w-12 h-px bg-surface/20" />
              <Brandmark src={brandmarkFooter} size={getBrandmarkSize(siteContent, 'brandmark_footer', 'sm') as 'sm' | 'md' | 'lg' | 'xl'} opacity={40} />
              <span className="flex-1 max-w-12 h-px bg-surface/20" />
            </div>
          )}
          <p className="text-[11px] text-surface/30">
            © {new Date().getFullYear()} Dolores M. Llorens | Fotografía  · Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface BookGalleryProps {
  essay: Essay;
  logoUrl?: string;
  brandmarkFooter?: string;
  siteContent?: SiteContent[];
}

function BookGallery({ essay, logoUrl, brandmarkFooter, siteContent = [] }: BookGalleryProps) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [zipping, setZipping] = useState(false);
  const [zipDone, setZipDone] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => setLightboxIndex((prev) => prev !== null ? (prev + 1) % essay.photos.length : 0);
  const prevPhoto = () => setLightboxIndex((prev) => prev !== null ? (prev - 1 + essay.photos.length) % essay.photos.length : 0);

  const handleDownload = async (photo: Photo) => {
    setDownloadingId(photo.id);
    await downloadSingle(photo);
    setDownloadingId(null);
  };

  const handleDownloadAll = async () => {
    setZipping(true);
    setZipDone(false);
    await downloadAllAsZip(essay.photos, essay.title);
    setZipping(false);
    setZipDone(true);
    setTimeout(() => setZipDone(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-accent/20 bg-surface/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1
              className="text-xl sm:text-2xl text-text truncate flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {essay.title}
              {essay.isPrivate && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0 text-amber-500 opacity-70">
                  <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5V4.5a2 2 0 1 0-4 0V6h4Z" clipRule="evenodd" />
                </svg>
              )}
            </h1>
            <div className="mt-0.5 space-y-0.5">
              {essay.description && (
                <p className="text-xs text-text/50 line-clamp-2 sm:line-clamp-none">{essay.description}</p>
              )}
              <span className="text-xs text-text/30">
                {essay.photos.length} foto{essay.photos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {essay.photos.length > 0 && (
            <button
              onClick={handleDownloadAll}
              disabled={zipping}
              className="shrink-0 self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {zipping ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Comprimiendo…
                </>
              ) : zipDone ? (
                <>✓ Descargado</>
              ) : (
                <>↓ Descargar todo (.zip)</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6">
        {essay.photos.length === 0 ? (
          <p className="text-center text-text/40 py-20 text-sm">
            Todavía no hay fotos en este book.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {essay.photos.map((photo, index) => {
              const isDownloading = downloadingId === photo.id;
              return (
                <motion.div
                  key={photo.id}
                  className="relative group rounded-xl overflow-hidden aspect-square bg-surface cursor-zoom-in"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Overlay — desktop hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 hidden sm:flex items-end justify-between px-3 pb-3">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-medium">
                      🔍 Ver
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(photo); }}
                      disabled={isDownloading}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white text-text text-xs font-medium px-3 py-1.5 rounded-full shadow disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                          Descargando…
                        </>
                      ) : (
                        <>↓ PNG</>
                      )}
                    </button>
                  </div>

                  {/* Mobile — always visible download button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(photo); }}
                    disabled={isDownloading}
                    className="sm:hidden absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-white/90 text-text text-[10px] font-medium px-2 py-1 rounded-full shadow disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <span className="animate-spin inline-block w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      '↓'
                    )}
                  </button>

                  {/* Alt text label */}
                  {photo.alt && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4 pointer-events-none hidden sm:group-hover:block">
                      <p className="text-white text-[10px] leading-tight line-clamp-1">{photo.alt}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-text py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          {logoUrl ? (
            <img src={logoUrl} alt="Dolores PH" className="h-8 w-auto object-contain mx-auto mb-3 opacity-90" />
          ) : (
            <p className="text-base text-surface mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Dolores PH</p>
          )}

          {brandmarkFooter && (
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="flex-1 max-w-16 h-px bg-surface/20" />
              <Brandmark src={brandmarkFooter} size={getBrandmarkSize(siteContent, 'brandmark_footer', 'sm') as 'sm' | 'md' | 'lg' | 'xl'} opacity={50} />
              <span className="flex-1 max-w-16 h-px bg-surface/20" />
            </div>
          )}

          <p className="text-xs text-surface/40">
            © {new Date().getFullYear()} Dolores M. Llorens | Fotografía · Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {lightboxIndex !== null && (
        <Lightbox
          photos={essay.photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextPhoto}
          onPrev={prevPhoto}
        />
      )}
    </div>
  );
}

export function ClientBook() {
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();

  const [essay, setEssay] = useState<Essay | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'not-found' | 'ready'>('idle');
  const [showError, setShowError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('key, value')
      .in('key', ['logo_url', 'brandmark_footer', 'brandmark_footer_size'])
      .then(({ data }) => {
        if (!data) return;
        const rows = data as SiteContent[];
        setSiteContent(rows);
        const logo = rows.find(r => r.key === 'logo_url')?.value;
        if (logo) setLogoUrl(logo);
      });
  }, []);

  // If a code comes in the URL, try it immediately
  useEffect(() => {
    if (urlCode) {
      tryCode(urlCode);
    } else {
      setStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode]);

  const tryCode = async (code: string) => {
    setStatus('loading');
    const result = await fetchEssayByCode(code);
    if (result) {
      setEssay(result);
      setStatus('ready');
      // Keep the URL in sync without reloading
      if (!urlCode || urlCode.toUpperCase() !== code.toUpperCase()) {
        navigate(`/book/${code.toUpperCase()}`, { replace: true });
      }
    } else {
      setEssay(null);
      setStatus('not-found');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const brandmarkFooter = siteContent.find(r => r.key === 'brandmark_footer')?.value;

  return (
    <>
      {/* Error banner */}
      <AnimatePresence>
        {showError && (
          <motion.div
            key="error-banner"
            className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl shadow-sm pointer-events-auto">
              Código incorrecto. Verificá que esté bien escrito.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main scene transitions */}
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            className="min-h-screen flex items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.span
              className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}

        {status === 'ready' && essay && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <BookGallery
              essay={essay}
              logoUrl={logoUrl}
              brandmarkFooter={brandmarkFooter}
              siteContent={siteContent}
            />
          </motion.div>
        )}

        {(status === 'idle' || status === 'not-found') && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <CodeForm
              onSubmit={tryCode}
              logoUrl={logoUrl}
              brandmarkFooter={brandmarkFooter}
              siteContent={siteContent}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
