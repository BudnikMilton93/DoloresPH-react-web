import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Photo } from '../../types';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({ photos, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
  const touchStartX = useRef<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? onNext() : onPrev();
    }
    touchStartX.current = null;
  };

  const photo = photos[currentIndex];
  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-white text-3xl font-light leading-none z-10 hover:text-[var(--color-accent)] transition-colors w-10 h-10 flex items-center justify-center"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          Ã—
        </button>

        {photos.length > 1 && (
          <>
            <button
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white text-4xl font-light z-10 hover:text-[var(--color-accent)] transition-colors w-10 h-10 flex items-center justify-center rounded-full bg-black/30"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              aria-label="Previous photo"
            >
              â€¹
            </button>
            <button
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white text-4xl font-light z-10 hover:text-[var(--color-accent)] transition-colors w-10 h-10 flex items-center justify-center rounded-full bg-black/30"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              aria-label="Next photo"
            >
              â€º
            </button>
          </>
        )}

        <motion.img
          key={photo.id}
          src={photo.url}
          alt={photo.alt}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

