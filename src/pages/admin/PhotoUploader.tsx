import { useState, useRef } from 'react';
import type { Photo } from '../../types';
import { uploadPhoto, patchPhoto, deletePhoto } from '../../api/admin';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Lightbox } from '../../components/ui/Lightbox';

interface PhotoUploaderProps {
  token: string;
  photos: Photo[];
  onUpload: () => void;
}

const CATEGORIES = ['Portrait', 'Wedding', 'Landscape', 'Nature', 'Editorial', 'Other'];

export function PhotoUploader({ token, photos, onUpload }: PhotoUploaderProps) {
  // Upload state
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState('Portrait');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadMessageType, setUploadMessageType] = useState<'success' | 'error' | ''>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Per-photo action state
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Photo | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setUploadMessage('');
    try {
      await uploadPhoto(selectedFile, { alt, category }, token);
      setUploadMessage('Foto subida correctamente.');
      setUploadMessageType('success');
      setPreview(null);
      setSelectedFile(null);
      setAlt('');
      onUpload();
    } catch (err) {
      console.error('Error detallado al subir foto:', err);

      // Información de diagnóstico para móviles
      const isMobile = window.innerWidth < 768;
      const userAgent = navigator.userAgent;

      let errorMessage = '';
      if (err instanceof Error) {
        errorMessage = err.message;

        // Error específico de Cloudinary
        if (errorMessage.includes('cloud_name is disabled') || errorMessage.includes('cloud_name')) {
          errorMessage = `Error de configuración de Cloudinary${isMobile ? ' (móvil)' : ''}: ${errorMessage}. 
Diagnóstico:
- Cloud name: ${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'NO CONFIGURADO'}
- Preset: ${import.meta.env.VITE_CLOUDINARY_PRESET_PHOTOS || 'NO CONFIGURADO'}
- Dispositivo: ${isMobile ? 'Móvil' : 'Desktop'}
- User Agent: ${userAgent}`;
        }
      } else {
        errorMessage = 'Error desconocido al subir.';
      }

      setUploadMessage(errorMessage);
      setUploadMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisibility = async (photo: Photo, visible: boolean) => {
    setToggling(photo.id);
    setActionError('');
    try {
      await patchPhoto(photo.id, { isVisible: visible }, token);
      onUpload();
    } catch {
      setActionError(`No se pudo cambiar la visibilidad de "${photo.alt}".`);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (photo: Photo) => {
    setConfirmDelete(photo);
  };

  const confirmDeletePhoto = async () => {
    if (!confirmDelete) return;
    const photo = confirmDelete;
    setConfirmDelete(null);
    setDeleting(photo.id);
    setActionError('');
    try {
      await deletePhoto(photo.id, token);
      onUpload();
    } catch {
      setActionError(`No se pudo eliminar "${photo.alt}". La API puede no estar disponible.`);
    } finally {
      setDeleting(null);
    }
  };

  const sortedPhotos = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);

  const handlePhotoClick = (photo: Photo) => {
    const index = sortedPhotos.findIndex(p => p.id === photo.id);
    setLightboxIndex(index);
  };

  const handleLightboxNext = () => {
    setLightboxIndex(prev => prev !== null ? (prev + 1) % sortedPhotos.length : 0);
  };

  const handleLightboxPrev = () => {
    setLightboxIndex(prev => prev !== null ? (prev - 1 + sortedPhotos.length) % sortedPhotos.length : 0);
  };

  return (
    <div>
      <h2 className="text-2xl text-text mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
        Gestión de Fotos
      </h2>

      <div className="mb-6">
        <p className="text-xs text-text/50 mt-0.5">Acá ves toda la galería de tu sitio, podes subir fotos individuales sin necesidad de crear un ensayo.</p>
      </div>

      {/* --- Existing photos --- */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
          Fotos existentes ({photos.length})
        </p>

        {actionError && (
          <p className="text-sm text-red-500 mb-3">{actionError}</p>
        )}

        {sortedPhotos.length === 0 ? (
          <p className="text-sm text-text/50 py-4">No hay fotos cargadas aún.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`relative rounded-xl overflow-hidden border transition-all ${photo.isVisible
                    ? 'border-accent/30'
                    : 'border-transparent opacity-50'
                  }`}
              >
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handlePhotoClick(photo)}
                />
                <div className="p-2 bg-background">
                  <p className="text-xs text-text truncate mb-1">{photo.alt || '—'}</p>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {photo.category}
                    </span>
                    {photo.essayId ? (
                      <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full border border-accent/20">
                        Ensayo
                      </span>
                    ) : (
                      <span className="text-[10px] text-text/60 bg-surface border border-accent/20 px-1.5 py-0.5 rounded-full">
                        Galería
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Toggle
                      checked={photo.isVisible}
                      onChange={(checked) => handleToggleVisibility(photo, checked)}
                      disabled={toggling === photo.id}
                    />
                    <button
                      onClick={() => handleDelete(photo)}
                      disabled={deleting === photo.id}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {deleting === photo.id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Upload new photo --- */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Subir nueva foto</p>

        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors mb-6 ${dragging
              ? 'border-primary bg-primary/5'
              : 'border-accent/40 hover:border-primary'
            }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <div>
              <p className="text-text/60 mb-2">Arrastrá una imagen aquí</p>
              <p className="text-sm text-text/40">o hacé click para elegir</p>
            </div>
          )}
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Texto alternativo / descripción"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-accent/30 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-accent/30 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Button type="submit" variant="primary" disabled={!selectedFile || uploading}>
            {uploading ? 'Subiendo...' : 'Subir Foto'}
          </Button>
          {uploadMessage && (
            <p className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${uploadMessageType === 'success'
                ? 'text-green-600 bg-green-50'
                : uploadMessageType === 'error'
                  ? 'text-red-600 bg-red-50'
                  : 'text-text/60'
              }`}>
              {uploadMessageType === 'success' && <span>✓</span>}
              {uploadMessage}
            </p>
          )}
        </form>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Eliminar foto"
        message={`¿Estás seguro de que quieres eliminar la foto "${confirmDelete?.alt}"?Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeletePhoto}
        onCancel={() => setConfirmDelete(null)}
      />

      {lightboxIndex !== null && (
        <Lightbox
          photos={sortedPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={handleLightboxNext}
          onPrev={handleLightboxPrev}
        />
      )}
    </div>
  );
}


