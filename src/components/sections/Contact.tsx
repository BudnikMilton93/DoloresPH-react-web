import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SiteContent } from '../../types';
import { Button } from '../ui/Button';
import { Brandmark } from '../ui/Brandmarks';

interface ContactProps {
  isVisible: boolean;
  content: SiteContent[];
}

function getContent(content: SiteContent[], key: string, fallback: string): string {
  return content.find((c) => c.key === key)?.value ?? fallback;
}

export function Contact({ isVisible, content }: ContactProps) {
  const email = getContent(content, 'contact_email', 'hello@doloresphotography.com');
  const instagram = getContent(content, 'contact_instagram', '@doloresphotography');
  const brandmarkContact = content.find((c) => c.key === 'brandmark_contact')?.value || '';
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          id="contact"
          className="py-16 md:py-24 bg-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-8 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Let's Connect</p>
              <h2 className="text-4xl md:text-5xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Get in Touch</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-text/70 leading-relaxed mb-8">
                  I'd love to hear about your project. Whether it's a wedding, portrait session, or creative collaboration — let's create something beautiful together.
                </p>
                <div className="space-y-4">
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-text hover:text-primary transition-colors"
                  >
                    <span className="text-primary">✉</span> {email}
                  </a>
                  <p className="flex items-center gap-3 text-text">
                    <span className="text-primary">📸</span> {instagram}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {submitted ? (
                  <div className="text-center py-12">
                    <p className="text-2xl text-primary mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Thank you!</p>
                    <p className="text-text/70">I'll be in touch soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-accent/30 bg-background text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-accent/30 bg-background text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-accent/30 bg-background text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      required
                    />
                    <Button type="submit" variant="primary" size="lg" className="w-full">
                      Send Message
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>
            {brandmarkContact && (
              <motion.div
                className="mt-12 flex justify-end"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
              >
                <Brandmark src={brandmarkContact} size="md" opacity={28} />
              </motion.div>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
