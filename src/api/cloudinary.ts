const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const PRESET_PHOTOS = import.meta.env.VITE_CLOUDINARY_PRESET_PHOTOS as string;
const PRESET_MEDIA = import.meta.env.VITE_CLOUDINARY_PRESET_MEDIA as string;

// Validar que las variables de entorno estén configuradas
if (!CLOUD_NAME || !PRESET_PHOTOS || !PRESET_MEDIA) {
  console.error('Variables de entorno de Cloudinary faltantes:', {
    CLOUD_NAME: !!CLOUD_NAME,
    PRESET_PHOTOS: !!PRESET_PHOTOS,
    PRESET_MEDIA: !!PRESET_MEDIA
  });
}

const ALLOWED_PHOTO_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/tiff',
]);
const ALLOWED_MEDIA_TYPES = new Set(['image/png', 'image/svg+xml']);

const MAX_PHOTO_SIZE = 80 * 1024 * 1024; // 80 MB
const MAX_MEDIA_SIZE = 10 * 1024 * 1024;  // 10 MB

interface CloudinaryRawResponse {
  secure_url: string;
  public_id: string;
  version: number;
  error?: { message: string };
}

export interface CloudinaryPhotoResult {
  url: string;
  thumbnailUrl: string;
}

async function cloudinaryUpload(
  file: File,
  preset: string,
  resourceType: 'image' | 'auto',
): Promise<{ secureUrl: string; publicId: string; version: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  
  try {
    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    
    const data = await res.json() as CloudinaryRawResponse;

    if (!res.ok) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      let errorMessage = data.error?.message ?? 'Error al subir a Cloudinary';
      
      // Agregar información de diagnóstico para errores específicos
      if (errorMessage.includes('cloud_name') || res.status === 404) {
        errorMessage = `${errorMessage}. 
Diagnóstico${isMobile ? ' (móvil)' : ''}:
- URL: ${uploadUrl}
- Status: ${res.status}
- Cloud Name: ${CLOUD_NAME}
- Preset: ${preset}
- Tipo de archivo: ${file.type}
- Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
      }
      
      throw new Error(errorMessage);
    }

    return {
      secureUrl: data.secure_url,
      publicId: data.public_id,
      version: data.version,
    };
  } catch (error) {
    // Si es un error de red, agregar información adicional
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Error de conexión a Cloudinary. URL: ${uploadUrl}. ${error.message}`);
    }
    throw error;
  }
}

async function resizeToMaxWidth(file: File, maxPx = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width <= maxPx) {
        resolve(file);
        return;
      }
      const scale = maxPx / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxPx;
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas no disponible')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Error al redimensionar la imagen')); return; }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.92,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
    img.src = url;
  });
}

export async function uploadPhotoToCloudinary(file: File): Promise<CloudinaryPhotoResult> {
  // Verificar configuración antes de proceder
  if (!CLOUD_NAME || !PRESET_PHOTOS) {
    throw new Error('Error de configuración: Variables de entorno de Cloudinary no configuradas. Verificá que tengas un archivo .env con VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_PRESET_PHOTOS configurados.');
  }
  
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    throw new Error('Formato no permitido. Usá JPEG, PNG, WebP, AVIF o TIFF.');
  }
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error('El archivo supera el límite de 60 MB.');
  }

  const resized = await resizeToMaxWidth(file);
  const { publicId, version } = await cloudinaryUpload(resized, PRESET_PHOTOS, 'image');
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  return {
    url: `${base}/c_limit,w_1920,h_1080,q_90,f_webp/v${version}/${publicId}`,
    thumbnailUrl: `${base}/c_limit,w_600,h_600,q_80,f_webp/v${version}/${publicId}`,
  };
}

export async function uploadMediaToCloudinary(file: File): Promise<string> {
  // Verificar configuración antes de proceder
  if (!CLOUD_NAME || !PRESET_MEDIA) {
    throw new Error('Error de configuración: Variables de entorno de Cloudinary no configuradas. Verificá que tengas un archivo .env con VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_PRESET_MEDIA configurados.');
  }

  if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
    throw new Error('Solo se permiten archivos PNG o SVG.');
  }
  if (file.size > MAX_MEDIA_SIZE) {
    throw new Error('El archivo supera el límite de 5 MB.');
  }

  // SVG se sube como raw para evitar que Cloudinary intente procesarlo como imagen raster
  const resourceType = file.type === 'image/svg+xml' ? 'auto' : 'image';
  const { secureUrl } = await cloudinaryUpload(file, PRESET_MEDIA, resourceType);
  return secureUrl;
}

/* ------------------------------------------------------------------ */
/*  Cloudinary cleanup — calls Supabase Edge Function                  */
/* ------------------------------------------------------------------ */

import { supabase } from '../lib/supabase';

export interface OrphanedImage {
  publicId: string;
  url: string;
  resourceType: string;
  bytes: number;
  format: string;
  createdAt: string;
}

export interface ScanResult {
  totalCloud: number;
  totalReferenced: number;
  orphans: OrphanedImage[];
}

export async function scanOrphanedImages(): Promise<ScanResult> {
  const { data, error } = await supabase.functions.invoke('cloudinary-cleanup', {
    body: { action: 'scan' },
  });
  if (error) throw new Error(error.message);
  return data as ScanResult;
}

export async function deleteOrphanedImages(
  items: { id: string; resourceType: string }[],
): Promise<{ deleted: number; failed: number }> {
  const { data, error } = await supabase.functions.invoke('cloudinary-cleanup', {
    body: { action: 'delete', publicIds: items },
  });
  if (error) throw new Error(error.message);
  return data as { deleted: number; failed: number };
}
