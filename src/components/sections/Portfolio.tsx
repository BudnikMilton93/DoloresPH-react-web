import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Photo, SiteContent } from '../../types';
import { ImageCard } from '../ui/ImageCard';
import { Lightbox } from '../ui/Lightbox';
import { useLanguage } from '../../i18n/LanguageContext';
import { Brandmark } from '../ui/Brandmarks';

interface PortfolioProps {
  isVisible: boolean;
  photos: Photo[];
  content?: SiteContent[];
}

const ALL_FILTER = '__all__';

export function Portfolio({ isVisible, photos, content = [] }: PortfolioProps) {
  const { t } = useLanguage();
  const brandmarkPortfolio = content.find((c) => c.key === 'brandmark_portfolio')?.value || '';
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_FILTER);

  const visiblePhotos = photos.filter((p) => p.isVisible);
  const categories = [ALL_FILTER, ...Array.from(new Set(visiblePhotos.map((p) => p.category).filter(Boolean)))];

  const filtered = activeCategory === ALL_FILTER
    ? visiblePhotos
    : visiblePhotos.filter((p) => p.category === activeCategory);

  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => setLightboxIndex((prev) => prev !== null ? (prev + 1) % filtered.length : 0);
  const prevPhoto = () => setLightboxIndex((prev) => prev !== null ? (prev - 1 + filtered.length) % filtered.length : 0);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          id="portfolio"
          className="py-16 md:py-24 bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">{t.portfolio.eyebrow}</p>
              <h2 className="text-4xl md:text-5xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>{t.portfolio.title}</h2>
            </motion.div>

            <div className="flex gap-3 justify-center mb-10 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text hover:bg-accent/20'
                  }`}
                >
                  {cat === ALL_FILTER ? t.portfolio.filterAll : cat}
                </button>
              ))}
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filtered.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="break-inside-avoid"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                >
                  <ImageCard photo={photo} onClick={() => setLightboxIndex(index)} />
                </motion.div>
              ))}
            </div>

            {brandmarkPortfolio && (
              <motion.div
                className="mt-12 flex justify-end"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3 }}
              >
                <Brandmark src={brandmarkPortfolio} size="xl" opacity={20} />
              </motion.div>
            )}
          </div>

          {lightboxIndex !== null && (
            <Lightbox
              photos={filtered}
              currentIndex={lightboxIndex}
              onClose={closeLightbox}
              onNext={nextPhoto}
              onPrev={prevPhoto}
            />
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
