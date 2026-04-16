import { motion, AnimatePresence } from 'framer-motion';
import type { Essay, SiteContent } from '../../types';
import { EssayCard } from '../ui/EssayCard';
import { useLanguage } from '../../i18n/LanguageContext';
import { Brandmark } from '../ui/Brandmarks';

interface EssaysProps {
  isVisible: boolean;
  essays: Essay[];
  content?: SiteContent[];
}

export function Essays({ isVisible, essays, content = [] }: EssaysProps) {
  const { t } = useLanguage();
  const brandmarkEssays = content.find((c) => c.key === 'brandmark_essays')?.value || '';
  const visibleEssays = essays.filter((e) => e.isVisible);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          id="essays"
          className="py-16 md:py-24 bg-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">{t.essays.eyebrow}</p>
              <h2 className="text-4xl md:text-5xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>{t.essays.title}</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {visibleEssays.map((essay, index) => (
                <motion.div
                  key={essay.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <EssayCard essay={essay} />
                </motion.div>
              ))}
            </div>

            {brandmarkEssays && (
              <motion.div
                className="mt-12 flex justify-start"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3 }}
              >
                <Brandmark src={brandmarkEssays} size="xl" opacity={20} />
              </motion.div>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
