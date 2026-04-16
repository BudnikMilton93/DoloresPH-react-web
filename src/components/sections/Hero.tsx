import { motion } from 'framer-motion';
import type { SiteContent } from '../../types';
import { Button } from '../ui/Button';
import { Brandmark } from '../ui/Brandmarks';
import { useLanguage } from '../../i18n/LanguageContext';

interface HeroProps {
  isVisible: boolean;
  content: SiteContent[];
}

function getContent(content: SiteContent[], key: string, fallback: string): string {
  return content.find((c) => c.key === key)?.value ?? fallback;
}

export function Hero({ isVisible, content }: HeroProps) {
  if (!isVisible) return null;

  const { t } = useLanguage();
  const headline = getContent(content, 'hero_headline', "Capturing Life's Most Beautiful Moments");
  const subtext = getContent(content, 'hero_subtext', 'Fine art photography for those who believe in the power of a single frame.');
  const eyebrow = getContent(content, 'hero_eyebrow', t.hero.eyebrow);
  const brandmarkHero = content.find((c) => c.key === 'brandmark_hero')?.value || '';

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{
        background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 50%, var(--color-accent) 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.p
          className="text-sm uppercase tracking-[0.3em] text-primary mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0 }}
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl text-text leading-tight mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          {headline}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-text/70 max-w-2xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        >
          {subtext}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.45 }}
        >
          <Button size="lg" variant="primary" onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>
            {t.hero.viewPortfolio}
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
            {t.hero.getInTouch}
          </Button>
        </motion.div>
      </div>

      {brandmarkHero && (
        <motion.div
          className="hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.2 }}
        >
          <Brandmark src={brandmarkHero} size="xl" opacity={28} />
        </motion.div>
      )}

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-11 h-11 text-primary/60"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" />
          <circle cx="12" cy="14" r="4" />
          <motion.circle
            cx="12"
            cy="14"
            r={2}
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            animate={{ r: [2, 1, 2] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </svg>
        <motion.div
          className="w-px h-4 bg-primary/40 rounded-full"
          animate={{ scaleY: [1, 0.3, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
