import type { ThemeConfig } from '../types';

const STATIC_FONTS = new Set(['Playfair Display', 'DM Sans']);

function buildGoogleFontsUrl(families: string[]): string {
  const toLoad = [...new Set(families)].filter((f) => f.trim() && !STATIC_FONTS.has(f));
  if (toLoad.length === 0) return '';
  const familyParam = toLoad.map((f) => f.trim().replace(/ /g, '+')).join('&family=');
  return `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;
}

function setGoogleFontsLink(href: string) {
  if (!href) return;
  let link = document.getElementById('gf-dynamic') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'gf-dynamic';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

export function loadCustomFonts(fontsCsv: string) {
  const extra = fontsCsv.split(',').map((f) => f.trim()).filter(Boolean);
  if (extra.length === 0) return;
  const href = buildGoogleFontsUrl(extra);
  if (href) {
    let link = document.getElementById('gf-custom') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'gf-custom';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }
}

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--font-heading', `'${theme.fontHeading}', serif`);
  root.style.setProperty('--font-body', `'${theme.fontBody}', sans-serif`);
  const href = buildGoogleFontsUrl([theme.fontHeading, theme.fontBody]);
  if (href) setGoogleFontsLink(href);
}
