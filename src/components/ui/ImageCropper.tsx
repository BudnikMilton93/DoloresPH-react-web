import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Button } from './Button';

interface ImageCropperProps {
  imageSrc: string;
  aspect?: number;       // default 3/2 (igual que el About)
  orientation?: 'portrait' | 'landscape';
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Error al generar el recorte.'));
    }, 'image/jpeg', 0.92);
  });
}

export function ImageCropper({ imageSrc, aspect = 3 / 2, orientation, onConfirm, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        <div className="p-4 border-b border-accent/20">
          <p className="font-semibold text-text" style={{ fontFamily: 'var(--font-heading)' }}>
            Ajustar foto de perfil
          </p>
          <p className="text-xs text-text/50 mt-0.5">
            {orientation === 'portrait' ? '📐 Vertical (portrait)' : '📐 Horizontal (landscape)'} · Arrastrá para encuadrar · Usá el scroll para hacer zoom
          </p>
        </div>

        {/* Área del cropper */}
        <div className="relative w-full" style={{ height: 340 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0, background: '#000' },
              cropAreaStyle: { borderColor: 'var(--color-primary)' },
            }}
          />
        </div>

        {/* Slider de zoom */}
        <div className="px-6 py-3 flex items-center gap-3">
          <span className="text-xs text-text/40">−</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-xs text-text/40">+</span>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-accent/20">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={processing}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} disabled={processing}>
            {processing ? 'Procesando...' : 'Confirmar recorte'}
          </Button>
        </div>
      </div>
    </div>
  );
}
