import { motion, AnimatePresence } from 'framer-motion';
import type { SiteContent } from '../../types';
import { Brandmark } from '../ui/Brandmarks';

interface ServicesProps {
  isVisible: boolean;
  content: SiteContent[];
}

function getContent(content: SiteContent[], key: string, fallback: string): string {
  return content.find((c) => c.key === key)?.value ?? fallback;
}

export function Services({ isVisible, content }: ServicesProps) {
  const servicesList = getContent(content, 'services_list', 'Portrait Sessions\nWedding Photography\nEditorial & Commercial');
  const services = servicesList.split('\n').filter(Boolean);
  const brandmarkServices = content.find((c) => c.key === 'brandmark_services')?.value || '';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          id="services"
          className="py-16 md:py-24 bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">What I Offer</p>
              <h2 className="text-4xl md:text-5xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Services</h2>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 py-5 border-b border-primary/10 last:border-0 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <span className="text-2xl text-primary/30 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl text-text group-hover:text-[var(--color-primary)] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                    {service}
                  </span>
                </motion.div>
              ))}
            </div>
            {brandmarkServices && (
              <motion.div
                className="mt-12 flex justify-start"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.4 }}
              >
                <Brandmark src={brandmarkServices} size="xl" opacity={22} />
              </motion.div>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
