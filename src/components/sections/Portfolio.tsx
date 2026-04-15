import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Photo } from '../../types';
import { ImageCard } from '../ui/ImageCard';
import { Lightbox } from '../ui/Lightbox';

interface PortfolioProps {
  isVisible: boolean;
  photos: Photo[];
}

export function Portfolio({ isVisible, photos }: PortfolioProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const visiblePhotos = photos.filter((p) => p.isVisible);
  const categories = ['All', ...Array.from(new Set(visiblePhotos.map((p) => p.category)))];

  const filtered = activeCategory === 'All'
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
              <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Work</p>
              <h2 className="text-4xl md:text-5xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Portfolio</h2>
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
                  {cat}
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
