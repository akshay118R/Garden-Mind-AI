import React, { useState } from 'react';
import { JournalEntry, Plant } from '../../types/garden';
import { formatJournalDisplayDate } from '../../utils/dateUtils';
import {
  TrendingUp,
  Image as ImageIcon,
  Ruler,
  Calendar,
  Sprout,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

interface GrowthProgressSectionProps {
  entries: JournalEntry[];
  plants: Plant[];
  onSelectEntry: (entry: JournalEntry) => void;
}

export const GrowthProgressSection: React.FC<GrowthProgressSectionProps> = ({
  entries,
  onSelectEntry,
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'measurements'>('photos');

  // Extract all photo items with their associated entry
  const photoItems: { url: string; entry: JournalEntry }[] = [];
  entries.forEach((entry) => {
    if (entry.photos && entry.photos.length > 0) {
      entry.photos.forEach((url) => {
        photoItems.push({ url, entry });
      });
    } else if (entry.imageUrl) {
      photoItems.push({ url: entry.imageUrl, entry });
    }
  });

  // Extract all entries that have recorded measurements
  const measurementEntries = entries.filter(
    (e) => e.growthMeasurement && e.growthMeasurement.trim().length > 0
  );

  return (
    <div className="bg-white rounded-natural-lg border border-sage-200/90 p-5 sm:p-6 shadow-natural-sm space-y-5">
      {/* Section Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sage-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-botanical" />
            <h3 className="text-base sm:text-lg font-editorial font-bold text-forest-800">
              Growth Progress & Visual Archive
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Verified timeline of dated photo milestones and user-recorded dimensions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-sage-50 p-1 rounded-xl border border-sage-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'photos'
                ? 'bg-forest-800 text-ivory-50 shadow-natural-sm'
                : 'text-charcoal-muted hover:text-forest-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photo Strip ({photoItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('measurements')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'measurements'
                ? 'bg-forest-800 text-ivory-50 shadow-natural-sm'
                : 'text-charcoal-muted hover:text-forest-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Recorded Metrics ({measurementEntries.length})</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Chronological Photo Strip */}
      {activeTab === 'photos' && (
        <div>
          {photoItems.length === 0 ? (
            <div className="p-8 text-center bg-ivory-50 rounded-xl border border-sage-200/60">
              <ImageIcon className="w-8 h-8 text-charcoal-subtle mx-auto mb-2" />
              <p className="text-xs font-semibold text-forest-800">No photos attached yet</p>
              <p className="text-[11px] text-charcoal-muted mt-1 max-w-sm mx-auto">
                Attach photos when creating or editing journal entries to build a chronological visual strip of your garden's development.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {photoItems.map((item, idx) => (
                <div
                  key={`${item.url}-${idx}`}
                  onClick={() => onSelectEntry(item.entry)}
                  className="group relative rounded-xl overflow-hidden border border-sage-200 bg-sage-50 aspect-square cursor-pointer shadow-natural-sm hover:shadow-natural transition-all"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelectEntry(item.entry);
                  }}
                  aria-label={`View entry: ${item.entry.title}`}
                >
                  <img
                    src={item.url}
                    alt={item.entry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-2 left-2 right-2 text-ivory-50">
                    <p className="text-[11px] font-semibold truncate leading-tight">
                      {item.entry.title}
                    </p>
                    <p className="text-[10px] text-ivory-200/90 truncate flex items-center gap-1 mt-0.5">
                      <span>{item.entry.plantName || 'General'}</span>
                      <span>•</span>
                      <span>{item.entry.date}</span>
                    </p>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-forest-900/70 text-white">
                    <Maximize2 className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: User-Recorded Measurements */}
      {activeTab === 'measurements' && (
        <div>
          {measurementEntries.length === 0 ? (
            <div className="p-8 text-center bg-ivory-50 rounded-xl border border-sage-200/60">
              <Ruler className="w-8 h-8 text-charcoal-subtle mx-auto mb-2" />
              <p className="text-xs font-semibold text-forest-800">No dimensions logged yet</p>
              <p className="text-[11px] text-charcoal-muted mt-1 max-w-sm mx-auto">
                Record honest shoot lengths, leaf counts, or ambient conditions in your journal notes to compare real numbers across dates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {measurementEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="p-3.5 rounded-xl border border-sage-200/80 bg-sage-50/50 hover:bg-sage-50 hover:border-botanical/50 cursor-pointer transition-all flex flex-col justify-between"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelectEntry(entry);
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1.5">
                      <span className="font-semibold text-botanical flex items-center gap-1 truncate max-w-[160px]">
                        <Sprout className="w-3 h-3 shrink-0" />
                        <span className="truncate">{entry.plantName || 'General'}</span>
                      </span>
                      <span className="text-[11px] text-charcoal-subtle flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        <span>{formatJournalDisplayDate(entry.date)}</span>
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-forest-900 mb-1">
                      {entry.growthMeasurement}
                    </div>

                    <p className="text-xs text-charcoal-muted truncate">
                      {entry.title}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-sage-200/60 flex items-center justify-end text-[11px] text-botanical font-semibold">
                    <span>View entry</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
