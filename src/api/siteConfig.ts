import { supabase } from '../lib/supabase';
import type { SiteConfig, ThemeConfig } from '../types';
import { mapSection, mapPhoto, mapEssay, mapTheme, mapTestimonial } from '../lib/mappers';

export async function fetchSiteConfig(): Promise<SiteConfig> {
  const [
    { data: sectionsData, error: e1 },
    { data: photosData, error: e2 },
    { data: essaysData, error: e3 },
    { data: contentData, error: e4 },
    { data: themeData, error: e5 },
    { data: testimonialsData, error: e6 },
  ] = await Promise.all([
    supabase.from('sections').select('*').order('sort_order'),
    supabase.from('photos').select('*').order('sort_order'),
    supabase.from('essays').select('*').order('sort_order'),
    supabase.from('site_content').select('*'),
    supabase.from('theme_config').select('*').eq('id', 1).single(),
    supabase.from('testimonials').select('*').order('sort_order'),
  ]);

  const firstError = e1 ?? e2 ?? e3 ?? e4 ?? e5 ?? e6;
  if (firstError) throw new Error(firstError.message);

  const photos = (photosData ?? []).map(mapPhoto);

  return {
    sections: (sectionsData ?? []).map(mapSection),
    photos,
    essays: (essaysData ?? []).map((row) => mapEssay(row, photos)),
    content: contentData ?? [],
    theme: mapTheme(themeData),
    testimonials: (testimonialsData ?? []).map(mapTestimonial),
  };
}

export async function patchTheme(theme: Partial<ThemeConfig>, _token: string): Promise<ThemeConfig> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (theme.primary !== undefined) update.primary = theme.primary;
  if (theme.accent !== undefined) update.accent = theme.accent;
  if (theme.background !== undefined) update.background = theme.background;
  if (theme.textColor !== undefined) update.text_color = theme.textColor;
  if (theme.surface !== undefined) update.surface = theme.surface;
  if (theme.fontHeading !== undefined) update.font_heading = theme.fontHeading;
  if (theme.fontBody !== undefined) update.font_body = theme.fontBody;

  const { data: row, error } = await supabase
    .from('theme_config')
    .update(update)
    .eq('id', 1)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTheme(row);
}
