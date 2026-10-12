import React from 'react';
import { NavigationTab } from '../../types/garden';
import { Menu, Plus, Sparkles, ScanHeart } from 'lucide-react';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onOpenAddPlant: () => void;
  onNavigateToDoctor: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenAddPlant,
  onNavigateToDoctor,
  onOpenSettings,
}) => {
  const getPageTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'overview':
        return 'Garden Overview';
      case 'my-garden':
        return 'My Plant Collection';
      case 'plant-doctor':
        return 'Plant Doctor AI';
      case 'care-planner':
        return 'Care Planner';
      case 'growth-journal':
        return 'Growth Journal';
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-ivory-100/90 backdrop-blur-md border-b border-sage-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu button + Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-charcoal hover:bg-sage-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-editorial font-bold text-forest-800 tracking-tight">
              {getPageTitle(activeTab)}
            </h2>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-botanical/40" />
            <span className="hidden sm:inline-block text-xs font-medium text-charcoal-muted">
              {todayFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onNavigateToDoctor}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-botanical hover:bg-botanical-subtle border border-botanical/20 transition-all shadow-natural-sm hover:border-botanical/40"
        >
          <ScanHeart className="w-3.5 h-3.5" />
          <span>Diagnose Photo</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddPlant}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-leaf" />
          <span>Add Plant</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-sage-200/80 hover:bg-sage-300 text-forest-800 flex items-center justify-center font-bold text-xs transition-colors border border-sage-300/50"
          title="Account Settings"
          aria-label="Account Settings"
        >
          <Sparkles className="w-3.5 h-3.5 text-botanical" />
        </button>
      </div>
    </header>
  );
};
