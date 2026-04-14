import { useState } from 'react';
import type { Photo } from '../../types';

interface ImageCardProps {
  photo: Photo;
  onClick?: () => void;
}

export function ImageCard({ photo, onClick }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group"
      onClick={onClick}
    >
      {!loaded && (
        <div className="skeleton w-full h-64" />
      )}
      <img
        src={photo.url}
        alt={photo.alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${
          loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
        }`}
      />
    </div>
  );
}
