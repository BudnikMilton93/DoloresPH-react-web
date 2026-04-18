import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Essay, SiteContent } from '../../types';
import { EssayCard } from '../ui/EssayCard';
import { Lightbox } from '../ui/Lightbox';
import { useLanguage } from '../../i18n/LanguageContext';
import { Brandmark } from '../ui/Brandmarks';

interface EssaysProps {
  isVisible: boolean;
  essays: Essay[];
  content?: SiteContent[];
}

export function Essays({ isVisible, essays, content = [] }: EssaysProps) {
  const { t } = useLanguage();
  const brandmarkEssays = content.find((c) => c.key === 'brandmark_essays')?.value || '';
  // Filtrar ensayos que estén visibles Y que tengan fotos
  const visibleEssays = essays.filter((e) => e.isVisible && e.photos.length > 0);

  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedEssay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedEssay]);

  const handleClose = useCallback(() => {
    setSelectedEssay(null);
    setLightboxIndex(null);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedEssay && lightboxIndex === null) handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedEssay, lightboxIndex, handleClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          id="essays"
          className="py-16 md:py-24 bg-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">{t.essays.eyebrow}</p>
              <h2 className="text-4xl md:text-5xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>{t.essays.title}</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {visibleEssays.map((essay, index) => (
                <motion.div
                  key={essay.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <EssayCard essay={essay} onClick={() => setSelectedEssay(essay)} />
                </motion.div>
              ))}
            </div>

            {brandmarkEssays && (
              <motion.div
                className="mt-12 flex justify-start"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3 }}
              >
                <Brandmark src={brandmarkEssays} size="xl" opacity={20} />
              </motion.div>
            )}
          </div>

          {/* Essay detail modal */}
          <AnimatePresence>
            {selectedEssay && (
              <motion.div
                className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
              >
                <motion.div
                  className="relative w-full max-w-5xl mx-4 my-8 bg-[var(--color-background)] rounded-2xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white text-2xl font-light hover:bg-black/60 transition-colors"
                    onClick={handleClose}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>

                  {/* Header */}
                  <div className="p-6 md:p-8 pb-4">
                    <h3 className="text-2xl md:text-3xl text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      {selectedEssay.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text)]/70 leading-relaxed max-w-2xl">
                      {selectedEssay.description}
                    </p>
                    <p className="text-xs text-[var(--color-text)]/40 mt-2">
                      {selectedEssay.photos.length} fotos
                    </p>
                  </div>

                  {/* Photo grid */}
                  <div className="px-6 md:px-8 pb-8">
                    <div className="columns-2 md:columns-3 gap-3 space-y-3">
                      {selectedEssay.photos.map((photo, idx) => (
                        <motion.div
                          key={photo.id}
                          className="break-inside-avoid cursor-pointer overflow-hidden rounded-lg group"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          onClick={() => setLightboxIndex(idx)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.alt}
                            loading="lazy"
                            className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lightbox for individual photo */}
          {selectedEssay && lightboxIndex !== null && (
            <Lightbox
              photos={selectedEssay.photos}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNext={() => setLightboxIndex((prev) => prev !== null ? (prev + 1) % selectedEssay.photos.length : 0)}
              onPrev={() => setLightboxIndex((prev) => prev !== null ? (prev - 1 + selectedEssay.photos.length) % selectedEssay.photos.length : 0)}
            />
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
