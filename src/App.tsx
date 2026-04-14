import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useSiteConfig } from './hooks/useSiteConfig';
import { applyTheme } from './utils/theme';
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

function MainPage() {
  const { siteConfig, loading } = useSiteConfig();

  useEffect(() => {
    if (siteConfig?.theme) {
      applyTheme(siteConfig.theme);
    }
  }, [siteConfig]);

  if (loading) return <SkeletonLoader />;

  const { sections, photos, essays, content } = siteConfig;

  function isSectionVisible(name: string): boolean {
    const section = sections.find((s) => s.name.toLowerCase() === name.toLowerCase());
    return section ? section.isVisible : true;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <Hero isVisible={isSectionVisible('Hero')} content={content} />
      <About isVisible={isSectionVisible('About')} content={content} />
      <Portfolio isVisible={isSectionVisible('Portfolio')} photos={photos} />
      <Essays isVisible={isSectionVisible('Essays')} essays={essays} />
      <Services isVisible={isSectionVisible('Services')} content={content} />
      <Contact isVisible={isSectionVisible('Contact')} content={content} />
      <Footer />
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
