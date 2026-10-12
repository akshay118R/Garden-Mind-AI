import React, { useState, useMemo } from 'react';
import { Plant } from '../../types/garden';
import { useGarden } from '../../context/GardenContext';
import { PlantCard } from './PlantCard';
import { PlantRow } from './PlantRow';
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  X,
  Sprout,
  HelpCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface MyGardenPageProps {
  onOpenAddPlant: () => void;
  onSelectPlant: (plant: Plant) => void;
  onOpenEditPlant: (plant: Plant) => void;
  onOpenDeletePlant: (plant: Plant) => void;
}

type FilterCategory = 'all' | 'healthy' | 'attention' | 'needs_info' | 'indoor' | 'outdoor';

export const MyGardenPage: React.FC<MyGardenPageProps> = ({
  onOpenAddPlant,
  onSelectPlant,
  onOpenEditPlant,
  onOpenDeletePlant,
}) => {
  const { plants, viewMode, setViewMode } = useGarden();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');

  // Client-side filtering across name, species, location, and notes
  const filteredPlants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return plants.filter((plant) => {
      // 1. Search Query filter (matches name, species, location, notes)
      const matchesSearch =
        !query ||
        plant.name.toLowerCase().includes(query) ||
        (plant.species && plant.species.toLowerCase().includes(query)) ||
        (plant.location && plant.location.toLowerCase().includes(query)) ||
        (plant.notes && plant.notes.toLowerCase().includes(query)) ||
        (plant.category && plant.category.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Status / Category filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'healthy') return plant.careStatus === 'healthy';
      if (selectedFilter === 'attention') return plant.careStatus === 'attention';
      if (selectedFilter === 'needs_info') return plant.careStatus === 'needs_info';
      if (selectedFilter === 'indoor') {
        const loc = (plant.location || '').toLowerCase();
        return !loc.includes('balcony') && !loc.includes('courtyard') && !loc.includes('outdoor') && !loc.includes('patio');
      }
      if (selectedFilter === 'outdoor') {
        const loc = (plant.location || '').toLowerCase();
        return loc.includes('balcony') || loc.includes('courtyard') || loc.includes('outdoor') || loc.includes('patio');
      }
      return true;
    });
  }, [plants, searchQuery, selectedFilter]);

  // Derived counts for filters
  const healthyCount = plants.filter((p) => p.careStatus === 'healthy').length;
  const attentionCount = plants.filter((p) => p.careStatus === 'attention').length;
  const infoCount = plants.filter((p) => p.careStatus === 'needs_info').length;

  const filterTabs: { id: FilterCategory; label: string; count?: number; icon?: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Plants', count: plants.length },
    { id: 'healthy', label: 'Looking healthy', count: healthyCount, icon: CheckCircle2 },
    { id: 'attention', label: 'Needs attention', count: attentionCount, icon: AlertTriangle },
    { id: 'needs_info', label: 'Care info needed', count: infoCount, icon: HelpCircle },
    { id: 'indoor', label: 'Indoor' },
    { id: 'outdoor', label: 'Outdoor' },
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sage-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-forest-800 tracking-tight">
              My Garden
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-200/80 text-forest-800 border border-sage-300">
              {plants.length} {plants.length === 1 ? 'Plant' : 'Plants'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Every plant has its own needs. Keep them thriving.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddPlant}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-leaf" />
          <span>Add a plant</span>
        </button>
      </div>

      {/* 2. Search, Status Filter Pills & Grid/List View Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, species, location, notes..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-sage-200/90 bg-white text-xs sm:text-sm text-charcoal focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-forest-800 p-0.5"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {/* Controls: Filter Pills & Grid/List Toggle Switch */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Plant category and status filters">
            <Filter className="w-3.5 h-3.5 text-charcoal-muted shrink-0 mr-1 hidden sm:inline" />
            {filterTabs.map((tab) => {
              const isActive = selectedFilter === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-forest-800 text-ivory-50 shadow-natural-sm'
                      : 'bg-white hover:bg-sage-100/70 text-charcoal-muted border border-sage-200/80'
                  }`}
                >
                  {Icon ? <Icon className="w-3 h-3" /> : null}
                  <span>{tab.label}</span>
                  {tab.count !== undefined ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-forest-700 text-leaf-light' : 'bg-sage-100 text-charcoal-muted'
                      }`}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Grid vs List View Switcher */}
          <div
            className="flex items-center bg-white p-1 rounded-xl border border-sage-200 shadow-natural-sm shrink-0"
            role="group"
            aria-label="View layout toggle"
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${
                viewMode === 'grid'
                  ? 'bg-forest-800 text-ivory-50 shadow-natural-sm'
                  : 'text-charcoal-muted hover:text-forest-800 hover:bg-sage-100/70'
              }`}
              title="Grid view (photo-rich cards)"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${
                viewMode === 'list'
                  ? 'bg-forest-800 text-ivory-50 shadow-natural-sm'
                  : 'text-charcoal-muted hover:text-forest-800 hover:bg-sage-100/70'
              }`}
              title="List view (compact management)"
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Plant Collection Display or Empty State */}
      {filteredPlants.length === 0 ? (
        /* Empty / No-Results States */
        <div className="bg-white rounded-natural-lg border border-sage-200/90 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-natural-sm my-6">
          <div className="w-14 h-14 rounded-2xl bg-sage-100 text-botanical flex items-center justify-center mx-auto mb-4 shadow-natural-sm">
            <Sprout className="w-7 h-7" />
          </div>

          <h3 className="font-editorial text-xl font-bold text-forest-800 mb-2">
            {plants.length === 0 ? 'Your garden is empty' : 'No matching plants found'}
          </h3>

          <p className="text-xs sm:text-sm text-charcoal-muted mb-6 leading-relaxed">
            {plants.length === 0
              ? 'Start building your botanical collection by adding your first houseplant or outdoor specimen.'
              : `We couldn't find any plants matching "${searchQuery || selectedFilter}". Check your spelling or reset your active filters to view all specimens.`}
          </p>

          {plants.length === 0 ? (
            <button
              type="button"
              onClick={onOpenAddPlant}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural"
            >
              <Plus className="w-4 h-4 text-leaf" />
              <span>Add your first plant</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sage-200/80 text-forest-800 hover:bg-sage-300 transition-colors"
            >
              <span>Clear filters ({plants.length} total plants)</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPlants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onView={onSelectPlant}
              onEdit={onOpenEditPlant}
              onDelete={onOpenDeletePlant}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredPlants.map((plant) => (
            <PlantRow
              key={plant.id}
              plant={plant}
              onView={onSelectPlant}
              onEdit={onOpenEditPlant}
              onDelete={onOpenDeletePlant}
            />
          ))}
        </div>
      )}
    </div>
  );
};
