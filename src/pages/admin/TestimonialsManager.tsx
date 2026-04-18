import { useRef, useState } from 'react';
import type { Testimonial } from '../../types';
import { createTestimonial, patchTestimonial, deleteTestimonial } from '../../api/admin';
import { uploadPhotoToCloudinary } from '../../api/cloudinary';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
  token: string;
  onUpdate: () => void;
}

const EMPTY_FORM = { author: '', handle: '', text: '', avatarUrl: '' };

export function TestimonialsManager({ testimonials, token, onUpdate }: TestimonialsManagerProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const sorted = [...testimonials].sort((a, b) => a.sortOrder - b.sortOrder);

  function startEdit(t: Testimonial) {
    setEditId(t.id);
    setForm({ author: t.author, handle: t.handle, text: t.text, avatarUrl: t.avatarUrl ?? '' });
    setError(null);
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleAvatarFile(file: File) {
    setUploadingAvatar(true);
    setError(null);
    try {
      const { url } = await uploadPhotoToCloudinary(file);
      setForm((prev) => ({ ...prev, avatarUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (!form.author.trim() || !form.text.trim()) {
      setError('El nombre y el comentario son obligatorios.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editId !== null) {
        await patchTestimonial(editId, { author: form.author, handle: form.handle, text: form.text, avatarUrl: form.avatarUrl || undefined }, token);
        setSuccess('✓ Testimonio actualizado correctamente.');
      } else {
        await createTestimonial({
          author: form.author,
          handle: form.handle,
          text: form.text,
          avatarUrl: form.avatarUrl || undefined,
          isVisible: true,
          sortOrder: testimonials.length + 1,
        }, token);
        setSuccess('✓ Testimonio creado correctamente.');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      onUpdate();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Error al guardar. La API puede no estar disponible aun.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(t: Testimonial) {
    setError(null);
    setSuccess(null);
    try {
      await patchTestimonial(t.id, { isVisible: !t.isVisible }, token);
      setSuccess(`✓ Testimonio ${!t.isVisible ? 'activado' : 'desactivado'}.`);
      onUpdate();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Error al actualizar visibilidad.');
    }
  }

  async function handleDelete(id: number) {
    setConfirmDelete(id);
  }

  async function confirmDeleteTestimonial() {
    if (!confirmDelete) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    setError(null);
    setSuccess(null);
    try {
      await deleteTestimonial(id, token);
      setSuccess('✓ Testimonio eliminado correctamente.');
      onUpdate();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Error al eliminar.');
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
        Testimonios de Instagram
      </h2>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-4 py-2 mb-4">{success}</p>}

      {/* Form */}
      <div className="rounded-xl border border-[var(--color-accent)]/20 p-5 space-y-4">
        <p className="font-semibold text-[var(--color-text)] text-sm">
          {editId !== null ? 'Editar testimonio' : 'Agregar testimonio'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nombre del cliente *"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="text-sm px-3 py-2 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
          <input
            type="text"
            placeholder="@usuario de Instagram"
            value={form.handle}
            onChange={(e) => setForm({ ...form, handle: e.target.value })}
            className="text-sm px-3 py-2 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <textarea
          placeholder="Comentario (copiado de Instagram) *"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          rows={3}
          className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] resize-none"
        />
        {/* Avatar uploader */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--color-accent)]/40 hover:border-[var(--color-primary)] transition-colors overflow-hidden flex items-center justify-center shrink-0 bg-[var(--color-background)] disabled:opacity-50"
            title="Subir foto de perfil"
          >
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : uploadingAvatar ? (
              <span className="text-[10px] text-[var(--color-primary)]">...</span>
            ) : (
              <span className="text-xl text-[var(--color-accent)]/60">+</span>
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleAvatarFile(e.target.files[0]); e.target.value = ''; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--color-text)]/60">
              {form.avatarUrl ? 'Avatar cargado. Hacé click para cambiarlo.' : 'Hacé click en el círculo para subir la foto de perfil del cliente.'}
            </p>
            {form.avatarUrl && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, avatarUrl: '' }))}
                className="text-xs text-red-400 hover:text-red-600 mt-1"
              >
                Quitar avatar
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : editId !== null ? 'Actualizar' : 'Agregar'}
          </Button>
          {editId !== null && (
            <Button variant="ghost" size="sm" onClick={cancelEdit}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-[var(--color-text)]/50 text-center py-6">
            No hay testimonios todavia. Agrega el primero arriba.
          </p>
        )}
        {sorted.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl border p-4 flex gap-4 transition-opacity ${
              t.isVisible
                ? 'border-[var(--color-accent)]/20'
                : 'border-[var(--color-accent)]/10 opacity-50'
            }`}
          >
            {t.avatarUrl ? (
              <img src={t.avatarUrl} alt={t.author} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 text-[var(--color-primary)] font-semibold">
                {t.author[0]}
              </div>
            )}
          <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-[var(--color-text)]">{t.author}</span>
                <span className="text-xs text-[var(--color-accent)]">{t.handle}</span>
              </div>
              <p className="text-xs text-[var(--color-text)]/70 mt-1 line-clamp-2">{t.text}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <button
                  onClick={() => handleToggle(t)}
                  className="text-xs px-2 py-1 rounded-lg border border-[var(--color-accent)]/30 text-[var(--color-text)]/60 hover:bg-[var(--color-background)] transition-colors"
                  title={t.isVisible ? 'Ocultar' : 'Mostrar'}
                >
                  {t.isVisible ? 'Ocultar' : 'Mostrar'}
                </button>
                <button
                  onClick={() => startEdit(t)}
                  className="text-xs px-2 py-1 rounded-lg border border-[var(--color-accent)]/30 text-[var(--color-text)]/60 hover:bg-[var(--color-background)] transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Eliminar testimonio"
        message="¿Estás seguro de que quieres eliminar este testimonio?\n\nEsta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeleteTestimonial}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
