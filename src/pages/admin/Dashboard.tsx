import { useState } from 'react';
import type { SiteConfig } from '../../types';
import { SectionManager } from './SectionManager';
import { PhotoUploader } from './PhotoUploader';
import { EssayEditor } from './EssayEditor';
import { ThemeEditor } from './ThemeEditor';
import { Button } from '../../components/ui/Button';

const TABS = ['Sections', 'Photos', 'Essays', 'Theme'] as const;
type Tab = typeof TABS[number];

interface DashboardProps {
  siteConfig: SiteConfig;
  token: string;
  onRefetch: () => void;
  onLogout: () => void;
}

export function Dashboard({ siteConfig, token, onRefetch, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Sections');

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-accent)]/20 px-6 h-16 flex items-center justify-between">
        <span className="text-xl text-[var(--color-primary)]" style={{ fontFamily: 'Playfair Display, serif' }}>Dolores PH — Admin</span>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-[var(--color-text)]/60 hover:text-[var(--color-primary)] transition-colors">
            View Site
          </a>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 border-b border-[var(--color-accent)]/20 pb-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl p-8 shadow-sm">
          {activeTab === 'Sections' && (
            <SectionManager sections={siteConfig.sections} token={token} onUpdate={onRefetch} />
          )}
          {activeTab === 'Photos' && (
            <PhotoUploader token={token} onUpload={onRefetch} />
          )}
          {activeTab === 'Essays' && (
            <EssayEditor essays={siteConfig.essays} token={token} onUpdate={onRefetch} />
          )}
          {activeTab === 'Theme' && (
            <ThemeEditor currentTheme={siteConfig.theme} token={token} onUpdate={onRefetch} />
          )}
        </div>
      </div>
    </div>
  );
}
