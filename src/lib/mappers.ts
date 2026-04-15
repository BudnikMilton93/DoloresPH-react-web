import type { Section, Photo, Essay, ThemeConfig, Testimonial } from '../types';

type Row = Record<string, unknown>;

export function mapSection(row: Row): Section {
  return {
    id: row.id as number,
    name: row.name as string,
    isVisible: row.is_visible as boolean,
    sortOrder: row.sort_order as number,
  };
}

export function mapPhoto(row: Row): Photo {
  return {
    id: row.id as number,
    url: row.url as string,
    thumbnailUrl: (row.thumbnail_url as string) ?? '',
    alt: (row.alt as string) ?? '',
    category: (row.category as string) ?? '',
    isVisible: row.is_visible as boolean,
    sortOrder: row.sort_order as number,
    essayId: (row.essay_id as number) ?? undefined,
  };
}

export function mapEssay(row: Row, allPhotos: Photo[]): Essay {
  const id = row.id as number;
  return {
    id,
    title: row.title as string,
    description: (row.description as string) ?? '',
    isVisible: row.is_visible as boolean,
    sortOrder: row.sort_order as number,
    photos: allPhotos.filter((p) => p.essayId === id),
  };
}

export function mapTheme(row: Row): ThemeConfig {
  return {
    id: row.id as number,
    primary: row.primary as string,
    accent: row.accent as string,
    background: row.background as string,
    textColor: row.text_color as string,
    surface: row.surface as string,
    fontHeading: row.font_heading as string,
    fontBody: row.font_body as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapTestimonial(row: Row): Testimonial {
  return {
    id: row.id as number,
    author: row.author as string,
    handle: (row.handle as string) ?? '',
    text: row.text as string,
    avatarUrl: (row.avatar_url as string) ?? '',
    isVisible: row.is_visible as boolean,
    sortOrder: row.sort_order as number,
  };
}
