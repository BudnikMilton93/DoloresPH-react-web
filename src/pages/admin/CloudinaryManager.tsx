import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import type { OrphanedImage, ScanResult } from '../../api/cloudinary';
import { scanOrphanedImages, deleteOrphanedImages } from '../../api/cloudinary';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CloudinaryManager() {
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setError('');
    setDeleteMsg('');
    setSelected(new Set());
    try {
      const data = await scanOrphanedImages();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setScanning(false);
    }
  };

  const toggleSelect = (publicId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(publicId)) next.delete(publicId);
      else next.add(publicId);
      return next;
    });
  };

  const toggleAll = () => {
    if (!result) return;
    if (selected.size === result.orphans.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(result.orphans.map((o) => o.publicId)));
    }
  };

  const handleDelete = async () => {
    if (!result || selected.size === 0) return;
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!result) return;
    setShowConfirm(false);

    const items = result.orphans
      .filter((o) => selected.has(o.publicId))
      .map((o) => ({ id: o.publicId, resourceType: o.resourceType }));

    setDeleting(true);
    setError('');
    try {
      const res = await deleteOrphanedImages(items);
      setDeleteMsg(
        `${res.deleted} imagen(es) eliminada(s)${res.failed > 0 ? `, ${res.failed} fallaron` : ''}.`,
      );
      // Re-scan to refresh
      const fresh = await scanOrphanedImages();
      setResult(fresh);
      setSelected(new Set());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const totalWaste = result?.orphans.reduce((sum, o) => sum + o.bytes, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2
            className="text-xl font-semibold text-text"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Limpieza de Cloudinary
          </h2>
          <p className="text-sm text-text/60 mt-1">
            Detectá y eliminá imágenes huérfanas que ya no se usan en el sitio.
          </p>
        </div>
        <Button variant="primary" onClick={handleScan} disabled={scanning || deleting}>
          {scanning ? 'Escaneando…' : 'Escanear'}
        </Button>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      {deleteMsg && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">{deleteMsg}</div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {([
              { label: 'En Cloudinary', value: String(result.totalCloud) },
              { label: 'Referenciadas', value: String(result.totalReferenced) },
              { label: 'Huérfanas', value: String(result.orphans.length) },
              { label: 'Espacio recuperable', value: formatBytes(totalWaste) },
            ] as const).map((stat) => (
              <div
                key={stat.label}
                className="bg-background rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-text/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {result.orphans.length === 0 ? (
            <div className="text-center py-12 text-text/50">
              ¡Todo limpio! No hay imágenes huérfanas.
            </div>
          ) : (
            <>
              {/* Actions bar */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm text-text/70 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selected.size === result.orphans.length}
                    onChange={toggleAll}
                    className="rounded border-accent/30 accent-primary"
                  />
                  Seleccionar todas ({result.orphans.length})
                </label>

                {selected.size > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-500! hover:bg-red-600!"
                  >
                    {deleting
                      ? 'Eliminando…'
                      : `Eliminar ${selected.size} imagen(es)`}
                  </Button>
                )}
              </div>

              {/* Orphan cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence>
                  {result.orphans.map((orphan: OrphanedImage) => (
                    <motion.div
                      key={orphan.publicId}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                        selected.has(orphan.publicId)
                          ? 'border-red-400 bg-red-50/10'
                          : 'border-transparent hover:border-accent/30'
                      }`}
                      onClick={() => toggleSelect(orphan.publicId)}
                    >
                      <div className="aspect-square bg-background">
                        {orphan.resourceType === 'image' ? (
                          <img
                            src={orphan.url}
                            alt={orphan.publicId}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text/30 text-xs uppercase font-mono">
                            {orphan.format}
                          </div>
                        )}
                      </div>

                      {/* Hover overlay with info */}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white px-2 py-1.5 text-[10px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="truncate">{orphan.publicId}</div>
                        <div className="text-white/70">
                          {formatBytes(orphan.bytes)} · {orphan.format}
                        </div>
                      </div>

                      {/* Selection checkmark */}
                      {selected.has(orphan.publicId) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning icon */}
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              <h3
                className="text-lg font-semibold text-text text-center mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                ¿Eliminar {selected.size} imagen{selected.size > 1 ? 'es' : ''}?
              </h3>

              <p className="text-sm text-text/60 text-center mb-6 leading-relaxed">
                Las imágenes se borrarán permanentemente de Cloudinary.
                <br />
                <span className="font-semibold text-red-500">Esta acción no se puede deshacer.</span>
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancelar
                </Button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-2.5 rounded-full text-base font-medium text-white bg-red-500 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                >
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
