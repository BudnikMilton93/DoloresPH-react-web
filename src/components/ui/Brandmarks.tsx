interface BrandmarkProps {
  src: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  className?: string;
}

const SIZES: Record<string, string> = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-20',
  xl: 'h-28',
};

export function Brandmark({ src, size = 'md', opacity = 30, className = '' }: BrandmarkProps) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`${SIZES[size]} w-auto object-contain ${className}`}
      style={{ opacity: opacity / 100 }}
    />
  );
}
