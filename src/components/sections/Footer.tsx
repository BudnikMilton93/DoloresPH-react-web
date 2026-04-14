export function Footer() {
  return (
    <footer className="bg-[var(--color-text)] py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-xl text-[var(--color-surface)] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Dolores PH</p>
        <p className="text-sm text-[var(--color-surface)]/60">
          © {new Date().getFullYear()} Dolores Photography. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
