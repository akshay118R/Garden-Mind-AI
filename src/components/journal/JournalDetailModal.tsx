import React, { useState, useEffect } from 'react';
import { JournalEntry, Plant } from '../../types/garden';
import { Modal } from '../common/Modal';
import { formatJournalDisplayDate } from '../../utils/dateUtils';
import { resolveMediaUrl } from '../../services/apiClient';
import {
  Calendar,
  Sprout,
  Ruler,
  Tag as TagIcon,
  Edit3,
  Trash2,
  Clock,
  Maximize2,
  X,
  Stethoscope,
} from 'lucide-react';

interface JournalDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (entry: JournalEntry) => void;
  onOpenDelete: (entry: JournalEntry) => void;
  plant?: Plant | null;
  onNavigateToPlant?: (plant: Plant) => void;
}

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onOpenEdit,
  onOpenDelete,
  plant,
  onNavigateToPlant,
}) => {
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<string | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLightboxPhoto) {
        setSelectedLightboxPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLightboxPhoto]);

  if (!entry) return null;

  const photos = entry.photos && entry.photos.length > 0
    ? entry.photos
    : (entry.imageUrl ? [entry.imageUrl] : []);

  const getObservationTypeBadge = (type: JournalEntry['observationType']) => {
    switch (type) {
      case 'growth':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-alert-successBg text-alert-success border border-alert-successBorder">
            New Growth
          </span>
        );
      case 'milestone':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-leaf-subtle text-forest-800 border border-leaf/40">
            Milestone
          </span>
        );
      case 'flowering':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Flowering
          </span>
        );
      case 'care':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Care & Hydration
          </span>
        );
      case 'repotting':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Repotting
          </span>
        );
      case 'issue':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-terracotta-subtle text-terracotta border border-terracotta/30">
            Health Concern
          </span>
        );
      case 'recovery':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Recovery Progress
          </span>
        );
      case 'general':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sage-100 text-forest-800 border border-sage-200">
            General Observation
          </span>
        );
    }
  };

  const getMoodBadge = (mood?: JournalEntry['mood']) => {
    if (!mood) return null;
    const moodMap = {
      thriving: { label: 'Thriving', icon: '🌿', color: 'bg-leaf-subtle text-forest-800' },
      steady: { label: 'Steady', icon: '🌱', color: 'bg-sage-100 text-forest-800' },
      struggling: { label: 'Struggling', icon: '🥀', color: 'bg-terracotta-subtle text-terracotta' },
      dormant: { label: 'Dormant', icon: '🍂', color: 'bg-amber-50 text-amber-800' },
    };
    const m = moodMap[mood];
    if (!m) return null;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border border-current/20 flex items-center gap-1 ${m.color}`}>
        <span>{m.icon}</span>
        <span>{m.label}</span>
      </span>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={entry.title}
        subtitle={formatJournalDisplayDate(entry.date)}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Top Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-ivory-50 border border-sage-200/80">
            <div className="flex items-center gap-2 flex-wrap">
              {entry.plantId && entry.plantName ? (
                <button
                  type="button"
                  onClick={() => {
                    if (plant && onNavigateToPlant) {
                      onClose();
                      onNavigateToPlant(plant);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-forest-800 bg-sage-200/70 border border-sage-300/80 transition-colors ${
                    plant && onNavigateToPlant ? 'hover:bg-sage-300 cursor-pointer' : ''
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5 text-botanical" />
                  <span>{entry.plantName}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-charcoal-muted bg-sage-100 border border-sage-200">
                  <Sprout className="w-3.5 h-3.5 text-botanical" />
                  <span>General Garden</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-charcoal-muted">
                <Calendar className="w-3.5 h-3.5 text-charcoal-subtle" />
                <span>{entry.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getObservationTypeBadge(entry.observationType)}
              {getMoodBadge(entry.mood)}
            </div>
          </div>

          {/* Plant Doctor Linkage Badge (if recorded from Plant Doctor) */}
          {entry.plantDoctorAssessmentId || entry.title.startsWith('Plant Doctor:') ? (
            <div className="p-3 rounded-xl bg-forest-900/5 border border-forest-800/20 flex items-center gap-2 text-xs text-forest-900">
              <Stethoscope className="w-4 h-4 text-botanical shrink-0" />
              <span>
                <strong>AI Health Check Linked:</strong> Saved from an observational Plant Doctor assessment.
              </span>
            </div>
          ) : null}

          {/* Photo Gallery with Lightbox Inspection */}
          {photos.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-forest-800 uppercase tracking-wider mb-2">
                Attached Photographs ({photos.length})
              </h4>
              <div
                className={`grid gap-3 ${
                  photos.length === 1
                    ? 'grid-cols-1'
                    : photos.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
                {photos.map((photoUrl, idx) => (
                  <div
                    key={`${photoUrl}-${idx}`}
                    onClick={() => setSelectedLightboxPhoto(photoUrl)}
                    className="relative group rounded-xl overflow-hidden border border-sage-200 bg-sage-50 aspect-video sm:aspect-square cursor-pointer shadow-natural-sm hover:shadow-natural transition-all"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedLightboxPhoto(photoUrl);
                      }
                    }}
                    aria-label={`View photo ${idx + 1} full size`}
                  >
                    <img
                      src={resolveMediaUrl(photoUrl)}
                      alt={`${entry.title} - photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-forest-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-3 py-1.5 rounded-lg bg-forest-900/80 backdrop-blur-sm text-ivory-50 text-xs font-semibold flex items-center gap-1.5 shadow-natural">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect Photo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Observation Notes */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sage-200/80 shadow-natural-sm">
            <h4 className="text-xs font-bold text-forest-800 uppercase tracking-wider mb-2">
              Observation & Botanical Notes
            </h4>
            <div className="text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-line font-normal">
              {entry.notes}
            </div>
          </div>

          {/* Growth Measurement & Tags Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {entry.growthMeasurement ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage-100 border border-sage-200 text-xs text-forest-900 font-semibold">
                <Ruler className="w-3.5 h-3.5 text-botanical" />
                <span>Recorded Metric: {entry.growthMeasurement}</span>
              </div>
            ) : <div />}

            {entry.tags && entry.tags.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <TagIcon className="w-3.5 h-3.5 text-charcoal-muted shrink-0" />
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-sage-50 text-forest-800 border border-sage-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Timestamps info */}
          <div className="pt-2 text-[11px] text-charcoal-muted flex items-center justify-between gap-2 border-t border-sage-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-charcoal-subtle" />
              <span>Session record (Client-side memory)</span>
            </span>
            {entry.updatedAt ? (
              <span>Last edited: {new Date(entry.updatedAt).toLocaleDateString()}</span>
            ) : null}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-sage-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDelete(entry);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-terracotta hover:bg-terracotta-subtle transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Entry</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEdit(entry);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sage-200 hover:bg-sage-300 text-forest-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Entry</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-colors shadow-natural-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Photo Lightbox Modal */}
      {selectedLightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full size photo inspection"
          className="fixed inset-0 z-50 bg-forest-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setSelectedLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedLightboxPhoto(null)}
              aria-label="Close photo preview"
              className="absolute -top-12 right-0 p-2 rounded-full bg-forest-900/80 hover:bg-forest-800 text-ivory-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={resolveMediaUrl(selectedLightboxPhoto)}
              alt="Full size botanical view"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-sage-200/20"
            />
            <p className="text-xs text-ivory-200 mt-3 text-center">
              Press Escape or click outside to dismiss
            </p>
          </div>
        </div>
      )}
    </>
  );
};
