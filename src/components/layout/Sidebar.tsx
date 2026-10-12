import React from 'react';
import { NavigationTab } from '../../types/garden';
import {
  LayoutDashboard,
  Sprout,
  ScanHeart,
  CalendarCheck2,
  BookOpen,
  Settings,
  Leaf,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  plantCount: number;
  attentionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  plantCount,
  attentionCount,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-garden', label: 'My Garden', icon: Sprout, badge: `${plantCount}` },
    { id: 'plant-doctor', label: 'Plant Doctor', icon: ScanHeart, badge: 'AI' },
    { id: 'care-planner', label: 'Care Planner', icon: CalendarCheck2 },
    { id: 'growth-journal', label: 'Growth Journal', icon: BookOpen },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-ivory-50 border-r border-sage-200/80 shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-sage-200/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-800 text-leaf flex items-center justify-center shadow-natural">
            <Leaf className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-editorial text-xl font-bold tracking-tight text-forest-800 leading-none">
              GardenMind <span className="text-botanical font-sans text-xs font-semibold px-1.5 py-0.5 rounded bg-sage-100 border border-sage-200 ml-0.5">AI</span>
            </h1>
            <p className="text-[11px] font-medium text-charcoal-muted tracking-wide mt-1">
              Grow smarter. Care naturally.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-subtle">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-forest-800 text-ivory-50 shadow-natural-sm'
                  : 'text-charcoal hover:bg-sage-100/70 hover:text-forest-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-leaf' : 'text-botanical'
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-forest-700 text-leaf-light border border-forest-600'
                        : 'bg-sage-200/70 text-charcoal-muted'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'text-leaf opacity-100' : 'text-charcoal-subtle'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Garden Health Mini Snapshot */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-sage-50 border border-sage-200/90 shadow-natural-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-botanical" />
            Garden Status
          </span>
          <span className="text-xs font-bold text-forest-800">{plantCount} Plants</span>
        </div>
        <div className="space-y-1.5 text-xs text-charcoal-muted">
          <div className="flex justify-between items-center">
            <span>Healthy plants</span>
            <span className="font-semibold text-alert-success">{plantCount - attentionCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Attention needed</span>
            <span className="font-semibold text-terracotta">{attentionCount}</span>
          </div>
        </div>
      </div>

      {/* User & Settings Footer */}
      <div className="p-4 border-t border-sage-200/70 bg-ivory-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-botanical/20 border border-botanical/30 flex items-center justify-center text-xs font-bold text-forest-800">
              GA
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-forest-800 truncate">Botanical Studio</p>
              <p className="text-[10px] text-charcoal-muted truncate">Local Session</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-charcoal-muted hover:text-forest-800 hover:bg-sage-100 transition-colors"
            title="Settings & Preferences"
            aria-label="Settings and Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
