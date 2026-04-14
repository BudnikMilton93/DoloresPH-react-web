interface SkeletonLoaderProps {
  count?: number;
}

export function SkeletonLoader({ count = 6 }: SkeletonLoaderProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="h-16 skeleton" />
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-4">
          <div className="skeleton h-12 w-2/3 mx-auto rounded" />
          <div className="skeleton h-6 w-1/2 mx-auto rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton rounded-lg h-64" />
          ))}
        </div>
      </div>
    </div>
  );
}
