import { motion, AnimatePresence } from 'framer-motion';
import type { SiteContent } from '../../types';

interface AboutProps {
  isVisible: boolean;
  content: SiteContent[];
}

function getContent(content: SiteContent[], key: string, fallback: string): string {
  return content.find((c) => c.key === key)?.value ?? fallback;
}

export function About({ isVisible, content }: AboutProps) {
  const subtitle = getContent(content, 'about_subtitle', 'An Eye for the Extraordinary');
  const photo = getContent(content, 'about_photo', 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600');
  const bio = getContent(content, 'about_bio', "Hi, I'm Dolores — a photographer based in the heart of the city.");
  const years = getContent(content, 'about_years', '8+');
  const sessions = getContent(content, 'about_sessions', '500+');
  const awards = getContent(content, 'about_awards', '12');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          id="about"
          className="py-16 md:py-24 bg-[var(--color-surface)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-primary)] mb-4">About Me</p>
                <h2 className="text-4xl md:text-5xl text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                  {subtitle}
                </h2>
                <p className="text-[var(--color-text)]/70 leading-relaxed text-lg mb-6">
                  {bio}
                </p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-3xl text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>{years}</p>
                    <p className="text-sm text-[var(--color-text)]/60">Years Experience</p>
                  </div>
                  <div>
                    <p className="text-3xl text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>{sessions}</p>
                    <p className="text-sm text-[var(--color-text)]/60">Sessions Complete</p>
                  </div>
                  <div>
                    <p className="text-3xl text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>{awards}</p>
                    <p className="text-sm text-[var(--color-text)]/60">Awards Won</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="relative mt-4 md:mt-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              >
                <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-[var(--color-primary)]/20 hidden md:block" />
                <img
                  src={photo}
                  alt="Photographer at work"
                  className="relative z-10 rounded-2xl w-full object-cover h-64 md:h-96"
                />
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
