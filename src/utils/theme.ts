import type { ThemeConfig } from '../types';

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--color-surface', theme.surface);
}
