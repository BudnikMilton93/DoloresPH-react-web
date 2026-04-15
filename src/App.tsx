import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useSiteConfig } from './hooks/useSiteConfig';
import { applyTheme, loadCustomFonts } from './utils/theme';
import { SkeletonLoader } from './components/ui/SkeletonLoader';
import { Header } from './components/sections/Header';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Portfolio } from './components/sections/Portfolio';
import { Essays } from './components/sections/Essays';
import { Services } from './components/sections/Services';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/sections/Footer';
import { AdminPage } from './pages/admin';
import { Testimonials } from './components/sections/Testimonials';

function MainPage() {
  const { siteConfig, loading } = useSiteConfig();

  useEffect(() => {
    if (siteConfig?.theme) {
      applyTheme(siteConfig.theme);
    }
    if (siteConfig?.content) {
      const customFontsCsv = siteConfig.content.find((c) => c.key === 'custom_fonts')?.value || '';
      if (customFontsCsv) loadCustomFonts(customFontsCsv);
    }
  }, [siteConfig]);

  if (loading) return <SkeletonLoader />;

  const { sections, photos, essays, content, testimonials } = siteConfig;

  function isSectionVisible(name: string): boolean {
    const section = sections.find((s) => s.name.toLowerCase() === name.toLowerCase());
    return section ? section.isVisible : true;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header content={content} />
      <Hero isVisible={isSectionVisible('Hero')} content={content} />
      <About isVisible={isSectionVisible('About')} content={content} />
      <Portfolio isVisible={isSectionVisible('Portfolio')} photos={photos} />
      <Essays isVisible={isSectionVisible('Essays')} essays={essays} />
      <Services isVisible={isSectionVisible('Services')} content={content} />
      <Testimonials isVisible={isSectionVisible('Testimonials')} testimonials={testimonials} />
      <Contact isVisible={isSectionVisible('Contact')} content={content} />
      <Footer content={content} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
