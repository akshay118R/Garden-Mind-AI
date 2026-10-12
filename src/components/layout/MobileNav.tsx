import React from 'react';
import { NavigationTab } from '../../types/garden';
import {
  LayoutDashboard,
  Sprout,
  ScanHeart,
  CalendarCheck2,
  BookOpen,
  X,
  Leaf,
  Settings
} from 'lucide-react';

interface MobileNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  plantCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  onOpenSettings,
  plantCount,
}) => {
  const tabs: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-garden', label: 'Garden', icon: Sprout },
    { id: 'plant-doctor', label: 'Doctor', icon: ScanHeart },
    { id: 'care-planner', label: 'Care', icon: CalendarCheck2 },
    { id: 'growth-journal', label: 'Journal', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen ? (
        <div
          className="md:hidden fixed inset-0 z-50 bg-forest-900/60 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-ivory-50 p-6 flex flex-col shadow-natural-lg border-r border-sage-200 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-6 border-b border-sage-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest-800 text-leaf flex items-center justify-center">
                  <Leaf className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-forest-800">GardenMind AI</h3>
                  <p className="text-[10px] text-charcoal-muted">Grow smarter. Care naturally.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-charcoal-muted hover:text-forest-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(tab.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-forest-800 text-ivory-50 shadow-natural-sm'
                        : 'text-charcoal hover:bg-sage-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-leaf' : 'text-botanical'}`} />
                    <span>{tab.label === 'Garden' ? 'My Garden' : tab.label === 'Doctor' ? 'Plant Doctor' : tab.label}</span>
                    {tab.id === 'my-garden' ? (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-sage-200 text-charcoal-muted">
                        {plantCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-sage-200">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal hover:bg-sage-100 transition-colors"
              >
                <Settings className="w-4 h-4 text-botanical" />
                <span>Settings & Preferences</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sage-200/80 px-2 py-2 flex items-center justify-around shadow-natural-lg"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-forest-800 font-semibold' : 'text-charcoal-muted hover:text-forest-800'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-forest-800 text-leaf' : 'text-charcoal-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-forest-800 font-semibold' : 'text-charcoal-muted'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
