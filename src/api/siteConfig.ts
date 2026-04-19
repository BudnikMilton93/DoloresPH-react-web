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

export async function patchBrandmarkSize(key: string, size: string, _token: string): Promise<{ key: string; value: string }> {
  // Validar que sea una clave válida de brandmark y un tamaño válido
  const validKeys = [
    'brandmark_about_size', 'brandmark_portfolio_size', 'brandmark_essays_size',
    'brandmark_services_size', 'brandmark_testimonials_size', 'brandmark_contact_size',
    'brandmark_footer_size'
  ];
  const validSizes = ['sm', 'md', 'lg', 'xl'];
  
  if (!validKeys.includes(key)) {
    throw new Error('Clave de brandmark inválida.');
  }
  
  if (!validSizes.includes(size)) {
    throw new Error('Tamaño de brandmark inválido. Use: sm, md, lg, xl');
  }

  const { data: row, error } = await supabase
    .from('site_content')
    .upsert({ key, value: size, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { key: row.key as string, value: row.value as string };
}

export function getBrandmarkSize(content: Array<{ key: string; value: string }>, brandmarkKey: string, defaultSize: string = 'lg'): string {
  const sizeKey = `${brandmarkKey}_size`;
  const sizeConfig = content.find(item => item.key === sizeKey);
  return sizeConfig?.value ?? defaultSize;
}
