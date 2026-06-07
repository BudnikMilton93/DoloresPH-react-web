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
          <Button size="lg" variant="primary" className="min-w-[180px]" onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>
            {t.hero.viewPortfolio}
          </Button>
          <Button size="lg" variant="outline" className="min-w-[180px]" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
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
        className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <motion.svg
          width="44"
          height="44"
          viewBox="0 0 100 105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ scale: [1, 1.05, 0.96, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6, 1] }}
        >
          {/* Camera body */}
          <rect x="8" y="32" width="84" height="60" rx="11"
            fill="var(--color-primary)" fillOpacity="0.10"
            stroke="var(--color-primary)" strokeWidth="2.5" strokeOpacity="0.55" />
          {/* Viewfinder bump */}
          <path d="M33 32V23a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v9"
            fill="var(--color-primary)" fillOpacity="0.08"
            stroke="var(--color-primary)" strokeWidth="2.5" strokeOpacity="0.55" />
          {/* Flash */}
          <rect x="13" y="40" width="15" height="10" rx="3"
            fill="var(--color-primary)" fillOpacity="0.18"
            stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* Shutter button */}
          <circle cx="78" cy="23" r="5"
            fill="var(--color-primary)" fillOpacity="0.28"
            stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.55" />
          {/* Rotating aperture blades */}
          <motion.g
            style={{ transformOrigin: '50px 62px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 30, 60, 90, 120, 150].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={50 + 13 * Math.cos(rad)} y1={62 + 13 * Math.sin(rad)}
                  x2={50 - 13 * Math.cos(rad)} y2={62 - 13 * Math.sin(rad)}
                  stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.35"
                />
              );
            })}
          </motion.g>
          {/* Outer lens ring */}
          <circle cx="50" cy="62" r="24"
            fill="var(--color-primary)" fillOpacity="0.07"
            stroke="var(--color-primary)" strokeWidth="2.5" strokeOpacity="0.55" />
          {/* Middle lens ring */}
          <circle cx="50" cy="62" r="15"
            fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.3" />
          {/* Lens highlight */}
          <circle cx="43" cy="55" r="3" fill="white" fillOpacity="0.25" />
          {/* Center dot — pulses */}
          <motion.circle cx="50" cy="62" r="4"
            fill="var(--color-primary)" fillOpacity="0.4"
            animate={{ r: [4, 2.5, 4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.svg>
        <motion.div
          className="w-px h-4 bg-primary/40 rounded-full"
          animate={{ scaleY: [1, 0.3, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
