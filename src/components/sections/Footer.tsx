import type { SiteContent } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface FooterProps {
  content?: SiteContent[];
}

export function Footer({ content = [] }: FooterProps) {
  const { t } = useLanguage();
  const logoUrl = content.find((c) => c.key === 'logo_url')?.value || '';
  const brandmarkFooter = content.find((c) => c.key === 'brandmark_footer')?.value || '';

  return (
    <footer className="bg-text py-10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {logoUrl ? (
          <img src={logoUrl} alt="Dolores PH" className="h-12 w-auto object-contain mx-auto mb-4 opacity-90" />
        ) : (
          <p className="text-xl text-surface mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Dolores PH</p>
        )}

        {brandmarkFooter && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="flex-1 max-w-20 h-px bg-surface/20" />
            <img src={brandmarkFooter} alt="" aria-hidden="true" className="h-8 w-auto object-contain opacity-50" />
            <span className="flex-1 max-w-20 h-px bg-surface/20" />
          </div>
        )}

        <p className="text-sm text-surface/50">
          {t.footer.copyright.replace('{year}', String(new Date().getFullYear()))}
        </p>

        <p className="mt-6 text-[11px] text-surface/20 tracking-wide">
          Lolita, esta web tiene muchas líneas de código escritas con <span className="text-red-400/40">♥</span> para impulsar tus proyectos personales y tu crecimiento profesional.
        </p>
      </div>
    </footer>
  );
}
