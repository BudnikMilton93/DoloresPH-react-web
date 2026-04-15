import { supabase } from '../lib/supabase';
import type { Section, Photo, Essay, Testimonial } from '../types';
import { uploadPhotoToCloudinary, uploadMediaToCloudinary } from './cloudinary';
import { mapSection, mapPhoto, mapEssay, mapTestimonial } from '../lib/mappers';

export async function toggleSection(id: number, data: Partial<Section>, _token: string): Promise<Section> {
  const update: Record<string, unknown> = {};
  if (data.isVisible !== undefined) update.is_visible = data.isVisible;
  if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;

  const { data: row, error } = await supabase
    .from('sections')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapSection(row);
}

export async function uploadPhoto(
  file: File,
  meta: { alt: string; category: string; essayId?: number | null },
  _token: string,
): Promise<Photo> {
  const { url, thumbnailUrl } = await uploadPhotoToCloudinary(file);

  const { data: row, error } = await supabase
    .from('photos')
    .insert({
      url,
      thumbnail_url: thumbnailUrl,
      alt: meta.alt,
      category: meta.category,
      essay_id: meta.essayId ?? null,
      is_visible: true,
      sort_order: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapPhoto(row);
}

export async function patchPhoto(id: number, data: Partial<Photo>, _token: string): Promise<Photo> {
  const update: Record<string, unknown> = {};
  if (data.alt !== undefined) update.alt = data.alt;
  if (data.category !== undefined) update.category = data.category;
  if (data.isVisible !== undefined) update.is_visible = data.isVisible;
  if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;
  if ('essayId' in data) update.essay_id = data.essayId ?? null;

  const { data: row, error } = await supabase
    .from('photos')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapPhoto(row);
}

export async function deletePhoto(id: number, _token: string): Promise<void> {
  // El archivo original permanece en Cloudinary; eliminarlo requiere API secret server-side.
  const { error } = await supabase.from('photos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createEssay(data: Partial<Essay>, _token: string): Promise<Essay> {
  const { data: row, error } = await supabase
    .from('essays')
    .insert({
      title: data.title,
      description: data.description ?? '',
      is_visible: data.isVisible ?? true,
      sort_order: data.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapEssay(row, []);
}

export async function patchEssay(id: number, data: Partial<Essay>, _token: string): Promise<Essay> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.isVisible !== undefined) update.is_visible = data.isVisible;
  if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;

  const { data: row, error } = await supabase
    .from('essays')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const { data: photosData } = await supabase
    .from('photos')
    .select('*')
    .eq('essay_id', id)
    .order('sort_order');

  return mapEssay(row, (photosData ?? []).map(mapPhoto));
}

export async function deleteEssay(id: number, _token: string): Promise<void> {
  const { error } = await supabase.from('essays').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function patchContent(key: string, value: string, _token: string): Promise<{ key: string; value: string }> {
  if (!/^[a-z0-9_]+$/.test(key)) throw new Error('Clave inválida.');

  const { data: row, error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { key: row.key as string, value: row.value as string };
}

export async function uploadMediaAsset(file: File, _token: string): Promise<{ url: string }> {
  const url = await uploadMediaToCloudinary(file);
  return { url };
}

export async function createTestimonial(data: Omit<Testimonial, 'id'>, _token: string): Promise<Testimonial> {
  const { data: row, error } = await supabase
    .from('testimonials')
    .insert({
      author: data.author,
      handle: data.handle ?? '',
      text: data.text,
      avatar_url: data.avatarUrl ?? '',
      is_visible: data.isVisible ?? true,
      sort_order: data.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTestimonial(row);
}

export async function patchTestimonial(id: number, data: Partial<Testimonial>, _token: string): Promise<Testimonial> {
  const update: Record<string, unknown> = {};
  if (data.author !== undefined) update.author = data.author;
  if (data.handle !== undefined) update.handle = data.handle;
  if (data.text !== undefined) update.text = data.text;
  if (data.avatarUrl !== undefined) update.avatar_url = data.avatarUrl;
  if (data.isVisible !== undefined) update.is_visible = data.isVisible;
  if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;

  const { data: row, error } = await supabase
    .from('testimonials')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTestimonial(row);
}

export async function deleteTestimonial(id: number, _token: string): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
