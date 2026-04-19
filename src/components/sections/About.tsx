import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import type { SiteContent } from '../../types';
import { Brandmark } from '../ui/Brandmarks';
import { getBrandmarkSize } from '../../api/siteConfig';
import { useLanguage } from '../../i18n/LanguageContext';

interface AboutProps {
  isVisible: boolean;
  content: SiteContent[];
}

function getContent(content: SiteContent[], key: string, fallback: string): string {
  return content.find((c) => c.key === key)?.value ?? fallback;
}

// Componente para estadísticas animadas
interface AnimatedStatisticProps {
  value: string;
  label: string;
  delay: number;
}

function AnimatedStatistic({ value, label, delay }: AnimatedStatisticProps) {
  const [startAnimation, setStartAnimation] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const [displayValue, setDisplayValue] = useState('');
  const { ref, isIntersecting } = useIntersection({ threshold: 0.3 });

  useEffect(() => {
    if (isIntersecting && !startAnimation) {
      setTimeout(() => setStartAnimation(true), delay);
    }
  }, [isIntersecting, startAnimation, delay]);

  // Parsear el valor para separar número de sufijo
  const parseValue = (val: string) => {
    const match = val.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (match) {
      return {
        number: parseFloat(match[1]),
        suffix: match[2] // "+", "K", "M", etc.
      };
    }
    return { number: 0, suffix: '' };
  };

  const { number, suffix } = parseValue(value);
  const hasDecimals = number % 1 !== 0;

  // Animación del contador personalizada
  useEffect(() => {
    if (startAnimation) {
      const duration = 2000; // 2 segundos
      const steps = 60;
      const increment = number / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
          current = number;
          clearInterval(timer);
        }

        // Mostrar decimales solo si el número final los tiene
        const displayNumber = hasDecimals ?
          Math.min(current, number).toFixed(1) :
          Math.floor(Math.min(current, number)).toString();

        setCurrentValue(current);
        setDisplayValue(displayNumber);
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [startAnimation, number, hasDecimals]);

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={startAnimation ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
        scale: { delay: 0.2 }
      }}
      className="text-center group"
    >
      <motion.div
        className="relative overflow-hidden"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {/* Efecto de brillo sutil en hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -skew-x-12 -translate-x-full"
          whileHover={{ translateX: "200%" }}
          transition={{ duration: 0.6 }}
        />

        <motion.p
          className="text-3xl md:text-4xl text-primary relative z-10 font-semibold"
          style={{ fontFamily: 'var(--font-heading)' }}
          animate={startAnimation ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          {startAnimation ? displayValue : (hasDecimals ? '0.0' : '0')}
          {suffix && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={startAnimation ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 2.2, duration: 0.4 }}
            >
              {suffix}
            </motion.span>
          )}
        </motion.p>
      </motion.div>

      <motion.p
        className="text-sm text-text/60 mt-2"
        initial={{ opacity: 0 }}
        animate={startAnimation ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {label}
      </motion.p>

      {/* Línea decorativa que aparece después de la animación */}
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mt-3 mx-auto"
        initial={{ width: 0, opacity: 0 }}
        animate={startAnimation ? { width: "80%", opacity: 1 } : {}}
        transition={{ delay: 2.5, duration: 0.8 }}
      />
    </motion.div>
  );
}

export function About({ isVisible, content }: AboutProps) {
  const { t } = useLanguage();
  const subtitle = getContent(content, 'about_subtitle', 'An Eye for the Extraordinary');
  const photo = getContent(content, 'about_photo', 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600');
  const bio = getContent(content, 'about_bio', "Hi, I'm Dolores — a photographer based in the heart of the city.");
  const years = getContent(content, 'about_years', '8+');
  const sessions = getContent(content, 'about_sessions', '500+');
  const awards = getContent(content, 'about_awards', '12');

  // Textos personalizables con fallback a las traducciones
  const yearsLabel = getContent(content, 'about_years_label', t.about.yearsLabel);
  const sessionsLabel = getContent(content, 'about_sessions_label', t.about.sessionsLabel);
  const awardsLabel = getContent(content, 'about_awards_label', t.about.awardsLabel);

  const brandmarkAbout = content.find((c) => c.key === 'brandmark_about')?.value || '';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          id="about"
          className="py-16 md:py-24 bg-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">{t.about.eyebrow}</p>
                <h2 className="text-4xl md:text-5xl text-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                  {subtitle}
                </h2>
                <p className="text-text/70 leading-relaxed text-lg mb-8 whitespace-pre-line">
                  {bio}
                </p>

                
              </motion.div>

              <motion.div
                className={`relative mt-4 md:mt-0 ${content.find((c) => c.key === 'about_photo_orientation')?.value === 'portrait'
                    ? 'flex justify-center'
                    : ''
                  }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              >
                <div className="relative">
                  <div className={`absolute -top-4 -left-4 rounded-2xl border-2 border-primary/20 hidden md:block ${content.find((c) => c.key === 'about_photo_orientation')?.value === 'portrait'
                      ? 'w-80 h-[450px] lg:w-96 lg:h-[500px]'
                      : 'w-full h-full'
                    }`} />
                  <img
                    src={photo}
                    alt="Photographer at work"
                    className={`relative z-10 rounded-2xl object-cover ${content.find((c) => c.key === 'about_photo_orientation')?.value === 'portrait'
                        ? 'w-80 h-[450px] lg:w-96 lg:h-[500px]'
                        : 'w-full h-64 md:h-96'
                      }`}
                  />
                </div>
              </motion.div>
            </div>

            {/* Estadísticas Animadas debajo de todo */}
            <motion.div
              className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            >
              <AnimatedStatistic
                value={years}
                label={yearsLabel}
                delay={200}
              />
              <AnimatedStatistic
                value={sessions}
                label={sessionsLabel}
                delay={400}
              />
              <AnimatedStatistic
                value={awards}
                label={awardsLabel}
                delay={600}
              />
            </motion.div>
          </div>

          <div className="max-w-6xl mx-auto px-4 mt-8"> 
            {/* Infrasigno debajo del texto */}
                {brandmarkAbout && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
                  >
                    <Brandmark
                      src={brandmarkAbout}
                      size={getBrandmarkSize(content, 'brandmark_about', 'lg') as 'sm' | 'md' | 'lg' | 'xl'}
                      opacity={45}
                    />
                  </motion.div>
                )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
