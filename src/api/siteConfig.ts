import axios from 'axios';
import type { SiteConfig, ThemeConfig } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchSiteConfig(): Promise<SiteConfig> {
  const response = await axios.get<SiteConfig>(`${API_URL}/api/site-config`);
  return response.data;
}

export async function patchTheme(theme: Partial<ThemeConfig>, token: string): Promise<ThemeConfig> {
  const response = await axios.patch<ThemeConfig>(`${API_URL}/api/theme`, theme, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
