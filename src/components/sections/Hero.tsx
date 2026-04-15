import { motion } from 'framer-motion';
import type { SiteContent } from '../../types';
import { Button } from '../ui/Button';

interface HeroProps {
  isVisible: boolean;
  content: SiteContent[];
}

function getContent(content: SiteContent[], key: string, fallback: string): string {
  return content.find((c) => c.key === key)?.value ?? fallback;
}

export function Hero({ isVisible, content }: HeroProps) {
  if (!isVisible) return null;

  const headline = getContent(content, 'hero_headline', "Capturing Life's Most Beautiful Moments");
  const subtext = getContent(content, 'hero_subtext', 'Fine art photography for those who believe in the power of a single frame.');

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{
        background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 50%, var(--color-accent) 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--color-accent)] blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.p
          className="text-sm uppercase tracking-[0.3em] text-[var(--color-primary)] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0 }}
        >
          Photography & Visual Storytelling
        </motion.p>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl text-[var(--color-text)] leading-tight mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          {headline}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-[var(--color-text)]/70 max-w-2xl mx-auto mb-12 leading-relaxed"
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
            View Portfolio
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
            Get in Touch
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="w-6 h-10 border-2 border-[var(--color-primary)]/50 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1 h-2 bg-[var(--color-primary)] rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </div>
      </motion.div>
    </section>
  );
}
