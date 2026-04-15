import { motion } from 'framer-motion';
import type { Essay } from '../../types';

interface EssayCardProps {
  essay: Essay;
}

export function EssayCard({ essay }: EssayCardProps) {
  return (
    <motion.div
      className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -4 }}
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
        <h3 className="text-xl text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{essay.title}</h3>
        <p className="text-sm text-[var(--color-text)]/70 leading-relaxed">{essay.description}</p>
      </div>
    </motion.div>
  );
}
