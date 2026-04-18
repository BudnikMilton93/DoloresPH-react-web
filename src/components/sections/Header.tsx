import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SiteContent, Section } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Language } from '../../i18n/translations';

interface HeaderProps {
  content?: SiteContent[];
  sections?: Section[];
}

export function Header({ content = [], sections = [] }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();
  const logoUrl = content.find((c) => c.key === 'logo_url')?.value || '';

  const allNavLinks = [
    { label: t.nav.about, href: '#about', section: 'About' },
    { label: t.nav.portfolio, href: '#portfolio', section: 'Portfolio' },
    { label: t.nav.essays, href: '#essays', section: 'Essays' },
    { label: t.nav.services, href: '#services', section: 'Services' },
    { label: t.nav.contact, href: '#contact', section: 'Contact' },
  ];

  // Filtrar links basándose en secciones visibles
  const navLinks = allNavLinks.filter(link => {
    const section = sections.find(s => s.name.toLowerCase() === link.section.toLowerCase());
    return section ? section.isVisible : true;
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-surface/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          {logoUrl ? (
            <img src={logoUrl} alt="Dolores PH" className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="text-xl font-bold text-primary transition-opacity duration-300 group-hover:opacity-80" style={{ fontFamily: 'var(--font-heading)' }}>Dolores PH</span>
          )}
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm text-text/80 hover:text-primary transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1.5px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          className="md:hidden text-text p-2 -mr-2 rounded-lg hover:bg-accent/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : 'mb-1.5'}`} />
          <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : 'mb-1.5'}`} />
          <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {menuOpen && (
        <motion.div
          className="md:hidden bg-surface/95 backdrop-blur-md border-t border-accent/20 px-4 py-4 flex flex-col gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text/80 hover:text-primary hover:pl-2 transition-all duration-200 py-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}

