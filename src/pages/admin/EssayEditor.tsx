import { useRef, useState } from 'react';
import type { Essay } from '../../types';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { createEssay, patchEssay, deleteEssay, uploadPhoto, deletePhoto } from '../../api/admin';

interface EssayEditorProps {
  essays: Essay[];
  token: string;
  onUpdate: () => void;
}

interface UploadItem {
  file: File;
  preview: string;
  alt: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export function EssayEditor({ essays, token, onUpdate }: EssayEditorProps) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Per-essay editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Per-essay photo upload state
  const [uploadingEssayId, setUploadingEssayId] = useState<number | null>(null);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [uploadingAll, setUploadingAll] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState<number | null>(null);
  const [confirmDeleteEssay, setConfirmDeleteEssay] = useState<Essay | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenUpload = (essayId: number) => {
    setUploadingEssayId(essayId);
    setUploadItems([]);
  };

  const handleCloseUpload = () => {
    setUploadingEssayId(null);
    setUploadItems([]);
  };

  const handleDeletePhoto = async (photoId: number) => {
    setConfirmDeletePhoto(photoId);
  };

  const confirmDeletePhotoAction = async () => {
    if (!confirmDeletePhoto) return;
    const photoId = confirmDeletePhoto;
    setConfirmDeletePhoto(null);
    setDeletingPhotoId(photoId);
    try {
      await deletePhoto(photoId, token);
      onUpdate();
    } catch {
      setMessage('No se pudo eliminar la foto.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const newItems: UploadItem[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        alt: file.name.replace(/\.[^.]+$/, ''),
        status: 'pending' as const,
      }));
    setUploadItems((prev) => [...prev, ...newItems]);
  };

  const handleAltChange = (index: number, alt: string) => {
    setUploadItems((prev) => prev.map((item, i) => (i === index ? { ...item, alt } : item)));
  };

  const handleRemoveItem = (index: number) => {
    setUploadItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async (essayId: number) => {
    const pending = uploadItems.filter((i) => i.status === 'pending');
    if (!pending.length) return;
    setUploadingAll(true);

    for (let i = 0; i < uploadItems.length; i++) {
      if (uploadItems[i].status !== 'pending') continue;
      setUploadItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'uploading' } : item)),
      );
      try {
        await uploadPhoto(uploadItems[i].file, { alt: uploadItems[i].alt, category: '', essayId }, token);
        setUploadItems((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'done' } : item)),
        );
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al subir';
        setUploadItems((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'error', error } : item)),
        );
      }
    }

    setUploadingAll(false);
    onUpdate();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setMessageType('');
    try {
      await createEssay({ title: newTitle, description: newDescription, isVisible: true }, token);
      setNewTitle('');
      setNewDescription('');
      setCreating(false);
      setMessage('✓ Ensayo creado correctamente.');
      setMessageType('success');
      onUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error al crear. La API puede no estar disponible.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (essay: Essay) => {
    setEditingId(essay.id);
    setEditTitle(essay.title);
    setEditDescription(essay.description);
  };

  const handleSaveEdit = async (essayId: number) => {
    setEditSaving(true);
    setMessage('');
    setMessageType('');
    try {
      await patchEssay(essayId, { title: editTitle, description: editDescription }, token);
      setEditingId(null);
      setMessage('✓ Ensayo actualizado correctamente.');
      setMessageType('success');
      onUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error al guardar. La API puede no estar disponible.');
      setMessageType('error');
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleVisibility = async (essay: Essay, visible: boolean) => {
    setMessage('');
    try {
      await patchEssay(essay.id, { isVisible: visible }, token);
      onUpdate();
    } catch {
      setMessage(`No se pudo cambiar la visibilidad de "${essay.title}".`);
    }
  };

  const handleDelete = async (essay: Essay) => {
    setConfirmDeleteEssay(essay);
  };

  const confirmDeleteEssayAction = async () => {
    if (!confirmDeleteEssay) return;
    const essay = confirmDeleteEssay;
    setConfirmDeleteEssay(null);
    setDeletingId(essay.id);
    setMessage('');
    try {
      await deleteEssay(essay.id, token);
      onUpdate();
    } catch {
      setMessage(`No se pudo eliminar "${essay.title}". La API puede no estar disponible.`);
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-accent/30 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Ensayos Fotográficos
        </h2>
        <Button variant="primary" size="sm" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancelar' : '+ Nuevo ensayo'}
        </Button>
      </div>

      <div className="mb-6">
        <p className="text-xs text-text/50 mt-0.5">Crea/edita tus ensayos, y luego asignale las fotos que desees.</p>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="bg-background rounded-2xl p-6 mb-6 space-y-4 border border-accent/20"
        >
          <input
            type="text"
            placeholder="Título del ensayo"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className={inputClass}
            required
          />
          <textarea
            placeholder="Descripción"
            rows={3}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            required
          />
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Creando...' : 'Crear Ensayo'}
          </Button>
        </form>
      )}

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

      <div className="space-y-3">
        {essays.map((essay) => (
          <div
            key={essay.id}
            className="bg-background rounded-xl border border-accent/20 overflow-hidden"
          >
            {editingId === essay.id ? (
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={inputClass}
                  placeholder="Título"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Descripción"
                />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleSaveEdit(essay.id)} disabled={editSaving}>
                    {editSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-medium text-text truncate">{essay.title}</p>
                    <p className="text-xs text-text/50 mt-0.5">
                      {essay.photos.length} foto{essay.photos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Toggle
                      checked={essay.isVisible}
                      onChange={(checked) => handleToggleVisibility(essay, checked)}
                    />
                    <button
                      onClick={() => handleStartEdit(essay)}
                      className="text-xs text-primary hover:underline transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        uploadingEssayId === essay.id
                          ? handleCloseUpload()
                          : handleOpenUpload(essay.id)
                      }
                      className="text-xs text-accent hover:underline transition-colors"
                    >
                      {uploadingEssayId === essay.id ? 'Cerrar fotos' : '+ Fotos'}
                    </button>
                    <button
                      onClick={() => handleDelete(essay)}
                      disabled={deletingId === essay.id}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {deletingId === essay.id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>

                {/* Panel de fotos */}
                {uploadingEssayId === essay.id && (
                  <div className="border-t border-accent/20 p-4 space-y-5 bg-background/60">

                    {/* Fotos existentes */}
                    {essay.photos.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-text/40 mb-3">Fotos actuales ({essay.photos.length})</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {essay.photos.map((photo) => (
                            <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square">
                              <img
                                src={photo.thumbnailUrl ?? photo.url}
                                alt={photo.alt}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-end justify-between p-1.5 gap-1">
                                <p className="text-white text-[10px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2 flex-1">{photo.alt}</p>
                                <button
                                  onClick={() => handleDeletePhoto(photo.id)}
                                  disabled={deletingPhotoId === photo.id}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-md px-1.5 py-0.5 text-[10px] disabled:opacity-40"
                                >
                                  {deletingPhotoId === photo.id ? '…' : 'Quitar'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Zona de drop / selección */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-text/40 mb-3">Agregar fotos</p>
                      <div
                        className="border-2 border-dashed border-accent/40 hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFilesSelected(e.dataTransfer.files);
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFilesSelected(e.target.files)}
                        />
                        <p className="text-sm text-text/50">
                          Arrastrá o hacé click para elegir fotos
                        </p>
                        <p className="text-xs text-text/30 mt-1">Podés seleccionar varias a la vez</p>
                      </div>
                    </div>

                    {/* Lista de fotos seleccionadas */}
                    {uploadItems.length > 0 && (
                      <div className="space-y-2">
                        {uploadItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-surface rounded-lg p-2"
                          >
                            <img
                              src={item.preview}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                            <input
                              type="text"
                              value={item.alt}
                              onChange={(e) => handleAltChange(index, e.target.value)}
                              placeholder="Descripción..."
                              disabled={item.status !== 'pending'}
                              className="flex-1 text-sm px-2 py-1 rounded-lg border border-accent/30 bg-background text-text outline-none focus:border-primary disabled:opacity-50"
                            />
                            <span className="text-xs shrink-0 w-20 text-center">
                              {item.status === 'pending' && (
                                <button
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  Quitar
                                </button>
                              )}
                              {item.status === 'uploading' && (
                                <span className="text-primary">Subiendo…</span>
                              )}
                              {item.status === 'done' && (
                                <span className="text-green-500">✓ Lista</span>
                              )}
                              {item.status === 'error' && (
                                <span className="text-red-500" title={item.error}>Error</span>
                              )}
                            </span>
                          </div>
                        ))}

                        <Button
                          variant="primary"
                          onClick={() => handleUploadAll(essay.id)}
                          disabled={
                            uploadingAll ||
                            uploadItems.every((i) => i.status !== 'pending')
                          }
                        >
                          {uploadingAll
                            ? `Subiendo ${uploadItems.filter((i) => i.status === 'uploading').length + 1} / ${uploadItems.filter((i) => i.status === 'pending' || i.status === 'uploading').length + uploadItems.filter((i) => i.status === 'done').length}…`
                            : `Subir ${uploadItems.filter((i) => i.status === 'pending').length} foto${uploadItems.filter((i) => i.status === 'pending').length !== 1 ? 's' : ''}`}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDeletePhoto !== null}
        title="Eliminar foto"
        message="¿Estás seguro de que quieres eliminar esta foto del ensayo?\n\nEsta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeletePhotoAction}
        onCancel={() => setConfirmDeletePhoto(null)}
      />
      
      <ConfirmDialog
        isOpen={confirmDeleteEssay !== null}
        title="Eliminar ensayo"
        message={`¿Estás seguro de que quieres eliminar "${confirmDeleteEssay?.title}"?\n\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeleteEssayAction}
        onCancel={() => setConfirmDeleteEssay(null)}
      />
    </div>
  );
}

