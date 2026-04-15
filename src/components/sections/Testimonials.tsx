import { motion } from 'framer-motion';
import type { Testimonial } from '../../types';

interface TestimonialsProps {
  isVisible: boolean;
  testimonials: Testimonial[];
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
  }),
};

export function Testimonials({ isVisible, testimonials }: TestimonialsProps) {
  if (!isVisible) return null;

  const visible = testimonials.filter((t) => t.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  if (visible.length === 0) return null;

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl md:text-4xl text-[var(--color-primary)] mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Lo que dicen mis clientes
          </h2>
          <p className="text-sm text-[var(--color-text)]/60 flex items-center justify-center gap-1.5">
            <InstagramIcon />
            Comentarios obtenidos de Instagram
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((t, i) => (
            <motion.div
              key={t.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-[var(--color-surface)] rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-[var(--color-accent)]/10"
            >
              <div className="flex items-center gap-3">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.author}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                      {t.author[0]}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-text)] truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                    {t.author}
                  </p>
                  <p className="text-xs text-[var(--color-accent)]">{t.handle}</p>
                </div>
                <div className="ml-auto text-[var(--color-accent)] flex-shrink-0">
                  <InstagramIcon />
                </div>
              </div>

              <p className="text-sm text-[var(--color-text)]/80 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
