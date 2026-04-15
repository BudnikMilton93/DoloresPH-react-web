import { useState, useEffect, useCallback } from 'react';
import type { SiteConfig, ThemeConfig } from '../types';
import { fetchSiteConfig } from '../api/siteConfig';

const DEFAULT_THEME: ThemeConfig = {
  id: 1,
  primary: '#7C5CBF',
  accent: '#B08AD9',
  background: '#EDE3F5',
  textColor: '#2D1B4E',
  surface: '#F5F0FA',
  fontHeading: 'Playfair Display',
  fontBody: 'DM Sans',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_CONFIG: SiteConfig = {
  sections: [
    { id: 1, name: 'Hero', isVisible: true, sortOrder: 1 },
    { id: 2, name: 'About', isVisible: true, sortOrder: 2 },
    { id: 3, name: 'Portfolio', isVisible: true, sortOrder: 3 },
    { id: 4, name: 'Essays', isVisible: true, sortOrder: 4 },
    { id: 5, name: 'Services', isVisible: true, sortOrder: 5 },
    { id: 6, name: 'Contact', isVisible: true, sortOrder: 6 },
  ],
  photos: [
    { id: 1, url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', alt: 'Portrait 1', category: 'Portrait', isVisible: true, sortOrder: 1 },
    { id: 2, url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', alt: 'Portrait 2', category: 'Portrait', isVisible: true, sortOrder: 2 },
    { id: 3, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', alt: 'Wedding 1', category: 'Wedding', isVisible: true, sortOrder: 3 },
    { id: 4, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', alt: 'Wedding 2', category: 'Wedding', isVisible: true, sortOrder: 4 },
    { id: 5, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Landscape 1', category: 'Landscape', isVisible: true, sortOrder: 5 },
    { id: 6, url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800', alt: 'Landscape 2', category: 'Landscape', isVisible: true, sortOrder: 6 },
  ],
  essays: [
    {
      id: 1,
      title: 'Golden Hour Stories',
      description: 'Exploring the magic that happens when the sun kisses the horizon.',
      isVisible: true,
      sortOrder: 1,
      photos: [
        { id: 1, url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', alt: 'Golden 1', category: 'Essay', isVisible: true, sortOrder: 1, essayId: 1 },
        { id: 2, url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400', alt: 'Golden 2', category: 'Essay', isVisible: true, sortOrder: 2, essayId: 1 },
      ],
    },
    {
      id: 2,
      title: 'Intimate Moments',
      description: 'A collection of candid portraits that capture genuine emotion.',
      isVisible: true,
      sortOrder: 2,
      photos: [
        { id: 3, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', alt: 'Intimate 1', category: 'Essay', isVisible: true, sortOrder: 1, essayId: 2 },
        { id: 4, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400', alt: 'Intimate 2', category: 'Essay', isVisible: true, sortOrder: 2, essayId: 2 },
      ],
    },
  ],
  content: [
    { key: 'hero_headline', value: "Capturing Life's Most Beautiful Moments" },
    { key: 'hero_subtext', value: 'Fine art photography for those who believe in the power of a single frame.' },
    { key: 'about_subtitle', value: 'An Eye for the Extraordinary' },
    { key: 'about_photo', value: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600' },
    { key: 'about_bio', value: "Hi, I'm Dolores — a photographer based in the heart of the city, specializing in portraits, weddings, and editorial work. I believe every image should tell a story that transcends words." },
    { key: 'about_years', value: '8+' },
    { key: 'about_sessions', value: '500+' },
    { key: 'about_awards', value: '12' },
    { key: 'services_list', value: 'Portrait Sessions\nWedding Photography\nEditorial & Commercial\nPhoto Essays\nPrint Sales' },
    { key: 'contact_email', value: 'hello@doloresphotography.com' },
    { key: 'contact_instagram', value: '@doloresphotography' },
  ],
  theme: DEFAULT_THEME,
};

export function useSiteConfig() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSiteConfig();
      setSiteConfig(data);
    } catch {
      setError('Could not load site configuration. Showing demo content.');
      setSiteConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { siteConfig, loading, error, refetch };
}
