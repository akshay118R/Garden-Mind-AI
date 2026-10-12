import React from 'react';
import { Plant, JournalEntry } from '../../types/garden';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { formatJournalDisplayDate, parseJournalEntryTimestamp } from '../../utils/dateUtils';
import {
  Droplets,
  Sun,
  MapPin,
  Calendar,
  Trash2,
  Edit3,
  Tag,
  BookOpen,
  Plus,
  Ruler,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface PlantDetailModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (plant: Plant) => void;
  onOpenDelete: (plant: Plant) => void;
  journalEntries?: JournalEntry[];
  onAddJournalForPlant?: (plant: Plant) => void;
  onSelectJournalEntry?: (entry: JournalEntry) => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  isOpen,
  onClose,
  onOpenEdit,
  onOpenDelete,
  journalEntries = [],
  onAddJournalForPlant,
  onSelectJournalEntry,
}) => {
  if (!plant) return null;

  // Filter journal entries specifically for this plant, sorted newest first
  const plantJournalEntries = journalEntries
    .filter((e) => e.plantId === plant.id)
    .sort((a, b) => parseJournalEntryTimestamp(b.date) - parseJournalEntryTimestamp(a.date));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plant.name}
      subtitle={plant.species ? plant.species : 'Botanical specimen'}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Plant Image & Quick Status Bar */}
        <div className="relative rounded-2xl overflow-hidden h-64 border border-sage-200 bg-sage-50">
          <ImageWithFallback
            src={plant.imageUrl}
            alt={plant.name}
            fallbackTitle={plant.species || plant.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 right-3">
            <StatusBadge status={plant.careStatus} />
          </div>

          <div className="flex items-center gap-2 absolute bottom-3 left-3 flex-wrap max-w-[90%]">
            {plant.location ? (
              <div className="px-3 py-1 rounded-full bg-forest-900/80 backdrop-blur-md text-xs font-semibold text-ivory-50 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-leaf" />
                <span className="truncate max-w-[160px]">{plant.location}</span>
              </div>
            ) : null}

            {plant.category ? (
              <div className="px-2.5 py-1 rounded-full bg-forest-900/80 backdrop-blur-md text-xs font-semibold text-leaf-light flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>{plant.category}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Essential Botanical Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-sage-50/70 border border-sage-200/80">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted mb-1">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>Hydration Rhythm</span>
            </div>
            <p className="text-sm font-bold text-forest-800">
              {plant.wateringFrequencyDays
                ? `Every ${plant.wateringFrequencyDays} days`
                : 'Schedule open'}
            </p>
            {plant.nextWateringDays !== undefined ? (
              <p className="text-[11px] text-charcoal-muted mt-0.5">
                Due in {plant.nextWateringDays} {plant.nextWateringDays === 1 ? 'day' : 'days'}
              </p>
            ) : (
              <p className="text-[11px] text-charcoal-subtle mt-0.5">Pending observation</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50/70 border border-sage-200/80">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Exposure</span>
            </div>
            <p className="text-sm font-bold text-forest-800 truncate" title={plant.lightRequirement || 'Standard light'}>
              {plant.lightRequirement || 'Standard light'}
            </p>
            <p className="text-[11px] text-charcoal-muted mt-0.5">
              Photosynthesis rating
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50/70 border border-sage-200/80 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted mb-1">
              <Calendar className="w-3.5 h-3.5 text-botanical" />
              <span>Added to Garden</span>
            </div>
            <p className="text-sm font-bold text-forest-800">
              {plant.addedDate || 'Recent'}
            </p>
            {plant.acquisitionDate ? (
              <p className="text-[11px] text-charcoal-muted mt-0.5">
                Acquired: {plant.acquisitionDate}
              </p>
            ) : (
              <p className="text-[11px] text-charcoal-subtle mt-0.5">Collection specimen</p>
            )}
          </div>
        </div>

        {/* Watering Guidance (if present) */}
        {plant.wateringGuidance ? (
          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/70 text-xs text-sky-900 flex items-start gap-2.5">
            <Droplets className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-sky-950">Watering Guidance: </span>
              <span>{plant.wateringGuidance}</span>
            </div>
          </div>
        ) : null}

        {/* Botanical Notes */}
        <div className="bg-ivory-50/70 p-4 rounded-xl border border-sage-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
            Care Notes & Placement Observations
          </h4>
          {plant.notes ? (
            <p className="text-xs sm:text-sm text-charcoal leading-relaxed font-normal">
              {plant.notes}
            </p>
          ) : (
            <p className="text-xs text-charcoal-subtle italic">
              No additional notes or observations logged yet. Click "Edit Plant" to add care notes.
            </p>
          )}
        </div>

        {/* Plant-Specific Growth History Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sage-200/90 shadow-natural-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sage-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-botanical" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest-800">
                Growth History & Journal ({plantJournalEntries.length})
              </h4>
            </div>

            {onAddJournalForPlant && (
              <button
                type="button"
                onClick={() => onAddJournalForPlant(plant)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-colors shadow-natural-sm"
              >
                <Plus className="w-3.5 h-3.5 text-leaf" />
                <span>Record entry</span>
              </button>
            )}
          </div>

          {plantJournalEntries.length === 0 ? (
            <div className="p-6 text-center bg-ivory-50 rounded-xl border border-sage-200/60">
              <Sparkles className="w-6 h-6 text-charcoal-subtle mx-auto mb-2" />
              <p className="text-xs font-semibold text-forest-800">
                No observations recorded for {plant.name} yet
              </p>
              <p className="text-[11px] text-charcoal-muted mt-1 max-w-sm mx-auto">
                Log newly unfurled leaves, repotting updates, or height measurements to track progress over time.
              </p>
              {onAddJournalForPlant && (
                <button
                  type="button"
                  onClick={() => onAddJournalForPlant(plant)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-natural"
                >
                  <Plus className="w-3.5 h-3.5 text-leaf" />
                  <span>Create first entry for {plant.name}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {plantJournalEntries.map((entry) => {
                const photos = entry.photos && entry.photos.length > 0
                  ? entry.photos
                  : (entry.imageUrl ? [entry.imageUrl] : []);

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectJournalEntry && onSelectJournalEntry(entry)}
                    className="p-3 rounded-xl border border-sage-200/80 bg-sage-50/40 hover:bg-sage-50 hover:border-botanical/50 transition-all cursor-pointer flex items-start justify-between gap-3 group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && onSelectJournalEntry) onSelectJournalEntry(entry);
                    }}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-charcoal-muted">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-charcoal-subtle" />
                          <span>{formatJournalDisplayDate(entry.date)}</span>
                        </span>
                        <span className="text-charcoal-subtle">•</span>
                        <span className="capitalize font-medium text-botanical">{entry.observationType}</span>
                        {entry.mood ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sage-100 text-forest-800">
                            {entry.mood}
                          </span>
                        ) : null}
                      </div>

                      <h5 className="text-xs sm:text-sm font-bold text-forest-800 group-hover:text-botanical transition-colors truncate">
                        {entry.title}
                      </h5>

                      <p className="text-xs text-charcoal-muted line-clamp-2">
                        {entry.notes}
                      </p>

                      {entry.growthMeasurement && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-800 bg-white px-2 py-0.5 rounded border border-sage-200 mt-1">
                          <Ruler className="w-3 h-3 text-botanical" />
                          <span>{entry.growthMeasurement}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-center">
                      {photos.length > 0 && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-sage-200 bg-white">
                          <img
                            src={photos[0]}
                            alt={entry.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-charcoal-subtle group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-sage-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDelete(plant);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-terracotta hover:bg-terracotta-subtle transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Plant</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit(plant);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sage-200 hover:bg-sage-300 text-forest-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Plant</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-colors shadow-natural-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
