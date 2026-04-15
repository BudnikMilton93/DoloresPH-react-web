import type { ThemeConfig } from '../types';

const STATIC_FONTS = new Set(['Playfair Display', 'DM Sans']);

function loadGoogleFonts(heading: string, body: string) {
  const toLoad = [...new Set([heading, body])].filter((f) => !STATIC_FONTS.has(f));
  if (toLoad.length === 0) return;
  const families = toLoad.map((f) => f.replace(/ /g, '+')).join('&family=');
  const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  let link = document.getElementById('gf-dynamic') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'gf-dynamic';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = href;
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
  loadGoogleFonts(theme.fontHeading, theme.fontBody);
}
