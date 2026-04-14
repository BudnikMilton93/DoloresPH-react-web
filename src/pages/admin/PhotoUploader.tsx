import { useState, useRef } from 'react';
import { uploadPhoto } from '../../api/admin';
import { Button } from '../../components/ui/Button';

interface PhotoUploaderProps {
  token: string;
  onUpload: () => void;
}

export function PhotoUploader({ token, onUpload }: PhotoUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState('Portrait');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('alt', alt);
      formData.append('category', category);
      await uploadPhoto(formData, token);
      setMessage('Photo uploaded successfully!');
      setPreview(null);
      setSelectedFile(null);
      setAlt('');
      onUpload();
    } catch {
      setMessage('Upload failed. API may be unavailable.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-[var(--color-text)] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Upload Photo</h2>

      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors mb-6 ${
          dragging ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-accent)]/40 hover:border-[var(--color-primary)]'
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
            <p className="text-[var(--color-text)]/60 mb-2">Drag & drop an image here</p>
            <p className="text-sm text-[var(--color-text)]/40">or click to browse</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Alt text / description"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
        >
          {['Portrait', 'Wedding', 'Landscape', 'Editorial', 'Other'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button type="submit" variant="primary" disabled={!selectedFile || uploading}>
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        {message && <p className="text-sm text-[var(--color-text)]/60">{message}</p>}
      </form>
    </div>
  );
}
