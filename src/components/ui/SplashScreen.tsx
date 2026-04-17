import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  logoUrl?: string;
  onFinish: () => void;
}

export function SplashScreen({ logoUrl, onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    if (!logoUrl) return;
    setLogoReady(false);
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => setLogoReady(true);
    img.onerror = () => setLogoReady(true);
  }, [logoUrl]);

  useEffect(() => {
    // Don't start timer until we have the URL and it's preloaded
    if (logoUrl === undefined) return;
    if (logoUrl && !logoReady) return;
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [logoUrl, logoReady]);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-background"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Logo — only renders after image is fully preloaded */}
            {logoUrl && logoReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src={logoUrl}
                  alt=""
                  className="h-20 md:h-28 w-auto object-contain"
                />
              </motion.div>
            )}

            {/* Animated line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-px w-32 md:w-48 origin-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />

            {/* Dots loader */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
