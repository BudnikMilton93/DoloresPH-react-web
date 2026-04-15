import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SiteContent } from '../../types';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Essays', href: '#essays' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

interface HeaderProps {
  content?: SiteContent[];
}

export function Header({ content = [] }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoUrl = content.find((c) => c.key === 'logo_url')?.value || '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-surface shadow-md' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Dolores PH" className="h-12 w-auto object-contain" />
          ) : (
            <span className="text-xl font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Dolores PH</span>
          )}
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-text hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          className="md:hidden text-text p-2 -mr-2 rounded-lg"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-current mb-1.5 transition-all" />
          <div className="w-6 h-0.5 bg-current mb-1.5 transition-all" />
          <div className="w-6 h-0.5 bg-current transition-all" />
        </button>
      </nav>

      {menuOpen && (
        <motion.div
          className="md:hidden bg-surface border-t border-accent/20 px-4 py-4 flex flex-col gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-text hover:text-primary transition-colors py-2"
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
