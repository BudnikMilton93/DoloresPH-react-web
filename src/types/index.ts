export interface Section {
  id: number;
  name: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface Photo {
  id: number;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  category: string;
  isVisible: boolean;
  sortOrder: number;
  essayId?: number;
}

export interface Essay {
  id: number;
  title: string;
  description: string;
  isVisible: boolean;
  sortOrder: number;
  photos: Photo[];
}

export interface SiteContent {
  key: string;
  value: string;
}

export interface ThemeConfig {
  id: number;
  primary: string;
  accent: string;
  background: string;
  textColor: string;
  surface: string;
  fontHeading: string;
  fontBody: string;
  updatedAt: string;
}

export interface Testimonial {
  id: number;
  author: string;
  handle: string;
  text: string;
  avatarUrl?: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface SiteConfig {
  sections: Section[];
  photos: Photo[];
  essays: Essay[];
  content: SiteContent[];
  theme: ThemeConfig;
  testimonials: Testimonial[];
}

export interface AuthResponse {
  token: string;
}
