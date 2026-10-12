import React, { useState, useMemo } from 'react';
import { JournalEntry, Plant, JournalObservationType } from '../../types/garden';
import {
  parseJournalEntryTimestamp,
  isDateInCurrentMonth,
  formatJournalDisplayDate,
} from '../../utils/dateUtils';
import { resolveMediaUrl } from '../../services/apiClient';
import { GrowthProgressSection } from './GrowthProgressSection';
import {
  BookOpen,
  Plus,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  Sprout,
  Ruler,
  TrendingUp,
  X,
  Stethoscope,
  Eye,
} from 'lucide-react';

interface GrowthJournalPageProps {
  entries: JournalEntry[];
  plants: Plant[];
  onOpenAddJournal: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onOpenEditEntry?: (entry: JournalEntry) => void;
  onOpenDeleteEntry?: (entry: JournalEntry) => void;
}

export const GrowthJournalPage: React.FC<GrowthJournalPageProps> = ({
  entries,
  plants,
  onOpenAddJournal,
  onSelectEntry,
}) => {
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Dynamic Journal Overview Metrics (Derived from actual state)
  const totalEntries = entries.length;

  const plantsDocumentedCount = useMemo(() => {
    const plantIdsWithEntries = new Set<string>();
    entries.forEach((e) => {
      if (e.plantId) plantIdsWithEntries.add(e.plantId);
    });
    return plantIdsWithEntries.size;
  }, [entries]);

  const entriesThisMonthCount = useMemo(() => {
    return entries.filter((e) => isDateInCurrentMonth(e.date)).length;
  }, [entries]);

  const latestEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return [...entries].sort((a, b) => {
      return parseJournalEntryTimestamp(b.date) - parseJournalEntryTimestamp(a.date);
    })[0];
  }, [entries]);

  // Filtered & Sorted Entries
  const filteredAndSortedEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return entries
      .filter((entry) => {
        // Plant filter
        if (selectedPlantFilter !== 'all') {
          if (selectedPlantFilter === 'unlinked') {
            if (entry.plantId) return false;
          } else {
            if (entry.plantId !== selectedPlantFilter) return false;
          }
        }

        // Type filter
        if (selectedTypeFilter !== 'all') {
          if (entry.observationType !== selectedTypeFilter) return false;
        }

        // Search query
        if (q) {
          const titleMatch = entry.title.toLowerCase().includes(q);
          const notesMatch = entry.notes.toLowerCase().includes(q);
          const plantMatch = entry.plantName?.toLowerCase().includes(q) || false;
          const measurementMatch = entry.growthMeasurement?.toLowerCase().includes(q) || false;
          const tagsMatch = entry.tags?.some((t) => t.toLowerCase().includes(q)) || false;

          if (!titleMatch && !notesMatch && !plantMatch && !measurementMatch && !tagsMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = parseJournalEntryTimestamp(a.date);
        const timeB = parseJournalEntryTimestamp(b.date);
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [entries, searchQuery, selectedPlantFilter, selectedTypeFilter, sortOrder]);

  const hasActiveFilters = searchQuery !== '' || selectedPlantFilter !== 'all' || selectedTypeFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPlantFilter('all');
    setSelectedTypeFilter('all');
  };

  const getObservationBadge = (type: JournalObservationType) => {
    switch (type) {
      case 'growth':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-alert-successBg text-alert-success border border-alert-successBorder">
            New Growth
          </span>
        );
      case 'milestone':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-leaf-subtle text-forest-800 border border-leaf/40">
            Milestone
          </span>
        );
      case 'flowering':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Flowering
          </span>
        );
      case 'care':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Care & Hydration
          </span>
        );
      case 'repotting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Repotting
          </span>
        );
      case 'issue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-terracotta-subtle text-terracotta border border-terracotta/30">
            Health Check
          </span>
        );
      case 'recovery':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Recovery
          </span>
        );
      case 'general':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sage-100 text-forest-800 border border-sage-200">
            General
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Header and Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-sage-200/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-forest-800 tracking-tight">
            Growth Journal
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Capture the little changes that help your garden grow.
          </p>
          {latestEntry ? (
            <p className="text-[11px] text-charcoal-subtle mt-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-botanical" />
              <span>
                {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'} documented • Latest on{' '}
                {formatJournalDisplayDate(latestEntry.date)} ({latestEntry.plantName || 'Garden'})
              </span>
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onOpenAddJournal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural shrink-0"
        >
          <Plus className="w-4 h-4 text-leaf" />
          <span>New journal entry</span>
        </button>
      </div>

      {/* 2. Journal Overview Metrics Cards (Dynamic data derived from state) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-natural border border-sage-200/80 shadow-natural-sm">
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
            <span>Total Entries</span>
            <BookOpen className="w-3.5 h-3.5 text-botanical" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-editorial text-forest-800">
            {totalEntries}
          </p>
          <p className="text-[11px] text-charcoal-subtle mt-0.5">Historical records</p>
        </div>

        <div className="bg-white p-4 rounded-natural border border-sage-200/80 shadow-natural-sm">
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
            <span>Plants Documented</span>
            <Sprout className="w-3.5 h-3.5 text-botanical" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-editorial text-forest-800">
            {plantsDocumentedCount}
          </p>
          <p className="text-[11px] text-charcoal-subtle mt-0.5">
            of {plants.length} total specimens
          </p>
        </div>

        <div className="bg-white p-4 rounded-natural border border-sage-200/80 shadow-natural-sm">
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
            <span>This Month</span>
            <Calendar className="w-3.5 h-3.5 text-botanical" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-editorial text-forest-800">
            {entriesThisMonthCount}
          </p>
          <p className="text-[11px] text-charcoal-subtle mt-0.5">Current cycle</p>
        </div>

        <div className="bg-white p-4 rounded-natural border border-sage-200/80 shadow-natural-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
            <span>Most Recent</span>
            <TrendingUp className="w-3.5 h-3.5 text-botanical" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-forest-800 truncate" title={latestEntry ? latestEntry.title : 'No entries'}>
            {latestEntry ? latestEntry.title : 'No entries recorded'}
          </p>
          <p className="text-[11px] text-charcoal-subtle mt-0.5 truncate">
            {latestEntry ? formatJournalDisplayDate(latestEntry.date) : 'Start your journal'}
          </p>
        </div>
      </div>

      {/* 3. Visual Archive & Growth Progress Section */}
      {entries.length > 0 && (
        <GrowthProgressSection
          entries={entries}
          plants={plants}
          onSelectEntry={onSelectEntry}
        />
      )}

      {/* 4. Practical Filter & Search Controls */}
      <div className="bg-white p-4 rounded-natural-lg border border-sage-200/80 shadow-natural-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-charcoal-subtle absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries by title, notes, plant, or tags..."
              aria-label="Search journal entries"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-sage-200 bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-1 text-charcoal-muted hover:text-forest-800"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Plant */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedPlantFilter}
                onChange={(e) => setSelectedPlantFilter(e.target.value)}
                aria-label="Filter entries by plant"
                className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20"
              >
                <option value="all">All Specimens ({entries.length})</option>
                <option value="unlinked">General Garden Entries</option>
                {plants.map((p) => {
                  const countForPlant = entries.filter((e) => e.plantId === p.id).length;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({countForPlant})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Filter by Entry Type */}
          <div className="md:col-span-2">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              aria-label="Filter by observation category"
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20"
            >
              <option value="all">All Categories</option>
              <option value="growth">New Growth</option>
              <option value="milestone">Milestones</option>
              <option value="flowering">Flowering</option>
              <option value="care">Care & Hydration</option>
              <option value="repotting">Repotting</option>
              <option value="issue">Health Checks</option>
              <option value="recovery">Recovery</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/70 hover:bg-sage-100/70 text-xs font-semibold text-forest-800 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-botanical" />
              <span>{sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}</span>
            </button>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-sage-100 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-charcoal-muted font-medium flex items-center gap-1">
                <Filter className="w-3 h-3 text-botanical" />
                <span>Showing {filteredAndSortedEntries.length} of {entries.length} entries</span>
              </span>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-botanical hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Main Journal Feed (Visual Timeline) */}
      {filteredAndSortedEntries.length === 0 ? (
        entries.length === 0 ? (
          /* Empty Garden Journal State */
          <div className="bg-white rounded-natural-lg border border-sage-200 p-12 text-center max-w-md mx-auto shadow-natural-sm">
            <div className="w-14 h-14 rounded-2xl bg-sage-100 text-botanical flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-editorial text-xl font-bold text-forest-800 mb-2">
              Your garden journal is empty
            </h3>
            <p className="text-xs text-charcoal-muted mb-6 leading-relaxed">
              Start chronicling leaf development, soil flushes, and flowering milestones to build a living history of your plants.
            </p>
            <button
              type="button"
              onClick={onOpenAddJournal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-natural"
            >
              <Plus className="w-4 h-4 text-leaf" />
              <span>New journal entry</span>
            </button>
          </div>
        ) : (
          /* Search / Filter Empty State */
          <div className="bg-white rounded-natural-lg border border-sage-200 p-10 text-center max-w-md mx-auto shadow-natural-sm">
            <Filter className="w-8 h-8 text-charcoal-subtle mx-auto mb-3" />
            <h3 className="font-editorial text-lg font-bold text-forest-800 mb-1">
              No matching journal entries
            </h3>
            <p className="text-xs text-charcoal-muted mb-4 leading-relaxed">
              No observation entries match your current search criteria or category filter.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-sage-200 hover:bg-sage-300 text-forest-800 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {filteredAndSortedEntries.map((entry) => {
            const photos = entry.photos && entry.photos.length > 0
              ? entry.photos
              : (entry.imageUrl ? [entry.imageUrl] : []);

            return (
              <article
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="bg-white rounded-natural-lg border border-sage-200/90 p-5 sm:p-6 shadow-natural-sm hover:shadow-natural hover:border-botanical/40 transition-all cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectEntry(entry);
                }}
                aria-label={`Open journal entry: ${entry.title}`}
              >
                {/* Header Row: Plant, Date, Type Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold text-botanical flex items-center gap-1">
                        <Sprout className="w-3.5 h-3.5 shrink-0" />
                        <span>{entry.plantName || 'General Garden'}</span>
                      </span>
                      <span className="text-charcoal-subtle">•</span>
                      <span className="text-xs text-charcoal-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-charcoal-subtle shrink-0" />
                        <span>{formatJournalDisplayDate(entry.date)}</span>
                      </span>

                      {entry.mood ? (
                        <span className="text-xs bg-sage-50 px-2 py-0.5 rounded-md border border-sage-200/80 text-forest-800 font-medium">
                          {entry.mood}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-forest-800 group-hover:text-botanical transition-colors">
                      {entry.title}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {getObservationBadge(entry.observationType)}
                  </div>
                </div>

                {/* Observation Preview */}
                <p className="text-xs sm:text-sm text-charcoal leading-relaxed mb-4 line-clamp-3">
                  {entry.notes}
                </p>

                {/* Photo Thumbnails Preview */}
                {photos.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                    {photos.slice(0, 4).map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-sage-200 bg-sage-50 shrink-0"
                      >
                        <img
                          src={resolveMediaUrl(url)}
                          alt={`${entry.title} photo preview`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                    {photos.length > 4 && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-sage-100 border border-sage-200 flex items-center justify-center text-xs font-bold text-forest-800 shrink-0">
                        +{photos.length - 4} more
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Bar: Metrics, Tags, Link */}
                <div className="pt-3 border-t border-sage-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {entry.growthMeasurement ? (
                      <div className="flex items-center gap-1.5 font-medium text-forest-800 bg-sage-50 px-2.5 py-1 rounded-lg border border-sage-200/80">
                        <Ruler className="w-3.5 h-3.5 text-botanical" />
                        <span>Metric: {entry.growthMeasurement}</span>
                      </div>
                    ) : null}

                    {entry.tags && entry.tags.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-ivory-100 text-charcoal-muted border border-sage-200/60"
                          >
                            #{tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="text-[10px] text-charcoal-subtle">
                            +{entry.tags.length - 3}
                          </span>
                        )}
                      </div>
                    ) : null}

                    {entry.plantDoctorAssessmentId || entry.title.startsWith('Plant Doctor:') ? (
                      <span className="text-[11px] font-medium text-forest-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-emerald-700" />
                        <span>Doctor Assessment</span>
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1 text-botanical font-semibold group-hover:translate-x-0.5 transition-transform ml-auto">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View details</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
