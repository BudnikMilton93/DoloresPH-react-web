import { motion } from 'framer-motion';
import type { Essay } from '../../types';

interface EssayCardProps {
  essay: Essay;
  onClick?: () => void;
}

export function EssayCard({ essay, onClick }: EssayCardProps) {
  return (
    <motion.div
      className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      <div className="flex gap-1 overflow-hidden h-48">
        {essay.photos.slice(0, 3).map((photo) => (
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.alt}
            loading="lazy"
            className="flex-1 object-cover min-w-0"
          />
        ))}
        {essay.photos.length === 0 && (
          <div className="w-full h-full bg-[var(--color-accent)]/20 flex items-center justify-center">
            <span className="text-[var(--color-accent)] text-sm">No photos yet</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl text-[var(--color-text)]" style={{ fontFamily: 'var(--font-heading)' }}>{essay.title}</h3>
          {essay.photos.length > 0 && (
            <span className="text-xs text-[var(--color-text)]/40">{essay.photos.length} fotos</span>
          )}
        </div>
        <p className="text-sm text-[var(--color-text)]/70 leading-relaxed">{essay.description}</p>
      </div>
    </motion.div>
  );
}
