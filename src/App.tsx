import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { useSiteConfig } from './hooks/useSiteConfig';
import { applyTheme, loadCustomFonts } from './utils/theme';
import { trackPageView } from './api/analytics';
import { SplashScreen } from './components/ui/SplashScreen';
import { Header } from './components/sections/Header';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Portfolio } from './components/sections/Portfolio';
import { Essays } from './components/sections/Essays';
import { Services } from './components/sections/Services';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/sections/Footer';
import { AdminPage } from './pages/admin';
import { ClientBook } from './pages/ClientBook';
import { Testimonials } from './components/sections/Testimonials';

let lastTrackedPath = '';

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const fullPath = `${location.pathname}${location.search}`;
    if (fullPath === lastTrackedPath) return;
    lastTrackedPath = fullPath;
    void trackPageView(fullPath);
  }, [location.pathname, location.search]);

  return null;
}

function MainPage() {
  const { siteConfig, loading } = useSiteConfig();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (siteConfig?.theme) {
      applyTheme(siteConfig.theme);
    }
    if (siteConfig?.content) {
      const customFontsCsv = siteConfig.content.find((c) => c.key === 'custom_fonts')?.value || '';
      if (customFontsCsv) loadCustomFonts(customFontsCsv);
    }
  }, [siteConfig]);

  const logoUrl = !loading
    ? siteConfig?.content?.find((c) => c.key === 'logo_url')?.value
    : undefined;

  if (loading || !splashDone) {
    return (
      <SplashScreen
        logoUrl={logoUrl}
        onFinish={() => setSplashDone(true)}
      />
    );
  }

  const { sections, photos, essays, content, testimonials } = siteConfig;

  const privateEssayIds = new Set(essays.filter((e) => e.isPrivate).map((e) => e.id));
  const publicPhotos = photos.filter((p) => !p.essayId || !privateEssayIds.has(p.essayId));

  function isSectionVisible(name: string): boolean {
    const section = sections.find((s) => s.name.toLowerCase() === name.toLowerCase());
    return section ? section.isVisible : true;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header content={content} sections={sections} essays={essays} />
      <Hero isVisible={isSectionVisible('Hero')} content={content} />
      <About isVisible={isSectionVisible('About')} content={content} />
      <Portfolio isVisible={isSectionVisible('Portfolio')} photos={publicPhotos} content={content} />
      <Essays isVisible={isSectionVisible('Essays')} essays={essays} content={content} />
      <Services isVisible={isSectionVisible('Services')} content={content} />
      <Testimonials isVisible={isSectionVisible('Testimonials')} testimonials={testimonials} content={content} />
      <Contact isVisible={isSectionVisible('Contact')} content={content} />
      <Footer content={content} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <RouteTracker />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/book" element={<ClientBook />} />
          <Route path="/book/:code" element={<ClientBook />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
