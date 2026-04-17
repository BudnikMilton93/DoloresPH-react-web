import { useState } from 'react';
import type { SiteConfig } from '../../types';
import { SectionManager } from './SectionManager';
import { PhotoUploader } from './PhotoUploader';
import { EssayEditor } from './EssayEditor';
import { ThemeEditor } from './ThemeEditor';
import { ContentEditor } from './ContentEditor';
import { BrandingManager } from './BrandingManager';
import { TestimonialsManager } from './TestimonialsManager';
import { CloudinaryManager } from './CloudinaryManager';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Language } from '../../i18n/translations';

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
  { value: 'pt', label: 'PT' },
];

const TABS = ['Sections', 'Content', 'Photos', 'Essays', 'Theme', 'Branding', 'Testimonials', 'Cloudinary'] as const;
type Tab = typeof TABS[number];

interface DashboardProps {
  siteConfig: SiteConfig;
  token: string;
  onRefetch: () => void;
  onLogout: () => void;
}

export function Dashboard({ siteConfig, token, onRefetch, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Sections');
  const { language, setLanguage } = useLanguage();
  const logoUrl = siteConfig.content.find((c) => c.key === 'logo_url')?.value || '';

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-accent/20 px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Dolores PH" className="h-9 w-auto object-contain shrink-0" />
          ) : (
            <span className="text-xl text-primary truncate" style={{ fontFamily: 'var(--font-heading)' }}>Dolores PH</span>
          )}
          {/* Nombre largo: ocultar en xs, truncar en sm, mostrar completo en md+ */}
          <span className="hidden xs:inline-block max-w-28 truncate text-xs text-text/40 shrink min-w-0 sm:max-w-48 md:max-w-none md:text-sm md:whitespace-normal md:inline-block">
            Dolores Marquez Llorens
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <div className="relative group flex items-center gap-0.5 border border-accent/30 rounded-full px-1 py-0.5">
            {LANG_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLanguage(value)}
                title={`Idioma del sitio: ${label}`}
                className={`text-xs px-2 py-1 rounded-full transition-all duration-200 ${
                  language === value
                    ? 'bg-primary text-white font-semibold'
                    : 'text-text/50 hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="absolute top-full right-0 mt-2 w-56 px-3 py-2 bg-surface border border-accent/20 rounded-lg shadow-lg text-xs text-text/60 leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
              Solo cambia títulos y subtítulos del sitio. Los textos personalizados que cargues no se ven afectados.
            </div>
          </div>
          {/* Ver sitio: icono y texto mejor alineados */}
          <a href="/" className="flex items-center gap-1 text-sm text-[var(--color-text)]/60 hover:text-[var(--color-primary)] transition-colors hidden sm:flex">
            <span>Ver sitio</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a href="/" className="flex items-center gap-1 text-sm text-primary sm:hidden" aria-label="Ver sitio">
            <span aria-hidden="true">↗</span>
          </a>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <span className="hidden sm:inline">Cerrar sesión</span>
            <span className="sm:hidden">Salir</span>
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="-mx-4 px-4 overflow-x-auto mb-8 border-b border-accent/20">
          <div className="flex gap-2 pb-4 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-4 md:p-8 shadow-sm">
          {activeTab === 'Sections' && (
            <SectionManager sections={siteConfig.sections} token={token} onUpdate={onRefetch} />
          )}
          {activeTab === 'Content' && (
            <ContentEditor content={siteConfig.content} token={token} onUpdate={onRefetch} />
          )}
          {activeTab === 'Photos' && (
            <PhotoUploader token={token} photos={siteConfig.photos} onUpload={onRefetch} />
          )}
          {activeTab === 'Essays' && (
            <EssayEditor essays={siteConfig.essays} token={token} onUpdate={onRefetch} />
          )}
          {activeTab === 'Theme' && (
            <ThemeEditor currentTheme={siteConfig.theme} content={siteConfig.content} token={token} onUpdate={onRefetch} />
          )}
          {activeTab === 'Branding' && (
            <BrandingManager content={siteConfig.content} token={token} onUpdate={onRefetch} />
          )}
          {activeTab === 'Testimonials' && (
            <TestimonialsManager testimonials={siteConfig.testimonials} token={token} onUpdate={onRefetch} />
          )}
          {activeTab === 'Cloudinary' && (
            <CloudinaryManager />
          )}
        </div>
      </div>
    </div>
  );
}
