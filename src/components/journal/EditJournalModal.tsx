import React, { useState, useEffect, useRef } from 'react';
import { Plant, JournalEntry, JournalObservationType, PlantMood } from '../../types/garden';
import { Modal } from '../common/Modal';
import {
  validatePhotoFile,
  createPhotoObjectUrl,
  revokePhotoObjectUrl,
  revokePhotoObjectUrls,
} from '../../utils/photoUtils';
import {
  Save,
  AlertCircle,
  Image as ImageIcon,
  X,
  Calendar,
  Tag as TagIcon,
  Ruler,
  Smile,
  Info,
} from 'lucide-react';

interface EditJournalModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  plants: Plant[];
  onUpdateEntry: (id: string, updates: Partial<JournalEntry>, newFiles?: File[]) => void | Promise<void>;
}

const OBSERVATION_TYPE_OPTIONS: { id: JournalObservationType; label: string }[] = [
  { id: 'general', label: 'General Observation' },
  { id: 'growth', label: 'New Growth' },
  { id: 'milestone', label: 'Milestone' },
  { id: 'flowering', label: 'Flowering' },
  { id: 'care', label: 'Care & Hydration' },
  { id: 'repotting', label: 'Repotting' },
  { id: 'issue', label: 'Health Concern' },
  { id: 'recovery', label: 'Recovery Progress' },
];

const MOOD_OPTIONS: { id: PlantMood; label: string; icon: string }[] = [
  { id: 'thriving', label: 'Thriving', icon: '🌿' },
  { id: 'steady', label: 'Steady', icon: '🌱' },
  { id: 'struggling', label: 'Struggling', icon: '🥀' },
  { id: 'dormant', label: 'Dormant', icon: '🍂' },
];

export const EditJournalModal: React.FC<EditJournalModalProps> = ({
  entry,
  isOpen,
  onClose,
  plants,
  onUpdateEntry,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [observationType, setObservationType] = useState<JournalObservationType>('growth');
  const [growthMeasurement, setGrowthMeasurement] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [mood, setMood] = useState<PlantMood | ''>('');
  
  // Photo attachments state
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newSelectedFiles, setNewSelectedFiles] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; notes?: string; date?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newlyCreatedBlobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (entry && isOpen) {
      setSelectedPlantId(entry.plantId || '');
      setDate(entry.date || '');
      setTitle(entry.title || '');
      setNotes(entry.notes || '');
      setObservationType(entry.observationType || 'growth');
      setGrowthMeasurement(entry.growthMeasurement || '');
      setTagInput(entry.tags ? entry.tags.join(', ') : '');
      setMood(entry.mood || '');
      
      const existingPhotos = entry.photos && entry.photos.length > 0
        ? [...entry.photos]
        : (entry.imageUrl ? [entry.imageUrl] : []);
      setPhotoUrls(existingPhotos);
      setNewSelectedFiles([]);
      setPhotoError(null);
      setFieldErrors({});
      setIsSubmitting(false);
      newlyCreatedBlobUrlsRef.current = [];
    }
  }, [entry, isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPhotoError(null);
    const newUrls: string[] = [];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validatePhotoFile(file);
      if (!validation.valid) {
        setPhotoError(validation.error || 'Invalid photo file.');
        continue;
      }

      const objUrl = createPhotoObjectUrl(file);
      if (objUrl) {
        newUrls.push(objUrl);
        validFiles.push(file);
        newlyCreatedBlobUrlsRef.current.push(objUrl);
      }
    }

    if (newUrls.length > 0) {
      setPhotoUrls((prev) => [...prev, ...newUrls]);
      setNewSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const targetUrl = photoUrls[indexToRemove];
    revokePhotoObjectUrl(targetUrl);
    newlyCreatedBlobUrlsRef.current = newlyCreatedBlobUrlsRef.current.filter((u) => u !== targetUrl);
    setPhotoUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClose = () => {
    // Revoke any newly created blob URLs that weren't saved
    revokePhotoObjectUrls(newlyCreatedBlobUrlsRef.current);
    newlyCreatedBlobUrlsRef.current = [];
    setNewSelectedFiles([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    const errors: { title?: string; notes?: string; date?: string } = {};
    if (!title.trim()) {
      errors.title = 'Entry title is required.';
    }
    if (!notes.trim()) {
      errors.notes = 'Observation notes are required.';
    }
    if (!date) {
      errors.date = 'Entry date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const associatedPlant = selectedPlantId
      ? plants.find((p) => p.id === selectedPlantId)
      : undefined;

    const processedTags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^[#]/, ''))
      .filter((t) => t.length > 0);

    const updates: Partial<JournalEntry> = {
      plantId: associatedPlant ? associatedPlant.id : undefined,
      plantName: associatedPlant
        ? (associatedPlant.species ? `${associatedPlant.name} (${associatedPlant.species})` : associatedPlant.name)
        : (entry.plantName || 'General Garden'),
      date: date,
      title: title.trim(),
      notes: notes.trim(),
      observationType,
      imageUrl: photoUrls.length > 0 ? photoUrls[0] : undefined,
      photos: photoUrls,
      growthMeasurement: growthMeasurement.trim() || undefined,
      tags: processedTags.length > 0 ? processedTags : undefined,
      mood: mood ? mood : undefined,
    };

    // Keep newly created URLs since we are saving
    newlyCreatedBlobUrlsRef.current = [];

    onUpdateEntry(entry.id, updates, newSelectedFiles);
    setIsSubmitting(false);
    onClose();
  };

  if (!entry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Journal Observation"
      subtitle={`Update observation details recorded for ${entry.plantName || 'Garden'}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Plant Selector & Entry Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-journal-plant-select" className="block text-xs font-semibold text-forest-800 mb-1">
              Associated Plant
            </label>
            <select
              id="edit-journal-plant-select"
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20"
            >
              <option value="">General Garden (No specific plant)</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.species ? `— ${p.species}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-journal-date-input" className="block text-xs font-semibold text-forest-800 mb-1">
              Observation Date *
            </label>
            <div className="relative">
              <input
                id="edit-journal-date-input"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={`w-full px-3 py-2 rounded-xl border bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20 ${
                  fieldErrors.date ? 'border-terracotta' : 'border-sage-200'
                }`}
              />
              <Calendar className="w-4 h-4 text-charcoal-muted absolute right-3 top-2.5 pointer-events-none" />
            </div>
            {fieldErrors.date && (
              <p className="text-[11px] text-terracotta mt-1">{fieldErrors.date}</p>
            )}
          </div>
        </div>

        {/* Observation Type Pills */}
        <div>
          <label className="block text-xs font-semibold text-forest-800 mb-1.5">
            Observation Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OBSERVATION_TYPE_OPTIONS.map((opt) => {
              const isSelected = observationType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setObservationType(opt.id)}
                  className={`py-2 px-2.5 rounded-xl text-left border text-xs transition-all ${
                    isSelected
                      ? 'bg-forest-800 text-ivory-50 border-forest-800 shadow-natural-sm font-semibold'
                      : 'bg-white hover:bg-sage-100 text-charcoal-muted border-sage-200 font-normal'
                  }`}
                >
                  <span className="block truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="edit-journal-title-input" className="block text-xs font-semibold text-forest-800 mb-1">
            Entry Title *
          </label>
          <input
            id="edit-journal-title-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
            }}
            className={`w-full px-3 py-2 rounded-xl border bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20 ${
              fieldErrors.title ? 'border-terracotta' : 'border-sage-200'
            }`}
          />
          {fieldErrors.title && (
            <p className="text-[11px] text-terracotta mt-1">{fieldErrors.title}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="edit-journal-notes-input" className="block text-xs font-semibold text-forest-800 mb-1">
            Observation Notes *
          </label>
          <textarea
            id="edit-journal-notes-input"
            rows={3}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (fieldErrors.notes) setFieldErrors((prev) => ({ ...prev, notes: undefined }));
            }}
            className={`w-full px-3 py-2 rounded-xl border bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20 ${
              fieldErrors.notes ? 'border-terracotta' : 'border-sage-200'
            }`}
          />
          {fieldErrors.notes && (
            <p className="text-[11px] text-terracotta mt-1">{fieldErrors.notes}</p>
          )}
        </div>

        {/* Growth Measurement & Vitality Mood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-journal-measurement-input" className="block text-xs font-semibold text-forest-800 mb-1">
              <span className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-botanical" />
                <span>Growth Measurement (Optional)</span>
              </span>
            </label>
            <input
              id="edit-journal-measurement-input"
              type="text"
              value={growthMeasurement}
              onChange={(e) => setGrowthMeasurement(e.target.value)}
              placeholder="e.g. +4 cm shoot, 8 leaves"
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-800 mb-1">
              <span className="flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-botanical" />
                <span>Plant Vitality / Status (Optional)</span>
              </span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(isSelected ? '' : m.id)}
                    className={`py-1.5 px-2 rounded-lg text-center border text-xs transition-all ${
                      isSelected
                        ? 'bg-sage-200 text-forest-900 border-botanical font-bold shadow-natural-sm'
                        : 'bg-white hover:bg-sage-100 text-charcoal-muted border-sage-200 font-normal'
                    }`}
                  >
                    <span className="block text-sm">{m.icon}</span>
                    <span className="text-[10px] block truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="edit-journal-tags-input" className="block text-xs font-semibold text-forest-800 mb-1">
            <span className="flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5 text-botanical" />
              <span>Tags (Optional, comma-separated)</span>
            </span>
          </label>
          <input
            id="edit-journal-tags-input"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g. new-leaf, spring-prep, pruning"
            className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/70 text-xs sm:text-sm text-forest-900 focus:ring-2 focus:ring-botanical/20"
          />
        </div>

        {/* Photo Attachments Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-forest-800 mb-1">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-botanical" />
              <span>Attached Photographs</span>
            </span>
          </label>

          <div className="space-y-2">
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-2.5 p-2.5 rounded-xl bg-sage-50 border border-sage-200">
                {photoUrls.map((url, index) => (
                  <div
                    key={url}
                    className="relative group w-20 h-20 rounded-lg overflow-hidden border border-sage-200 bg-white shadow-natural-sm"
                  >
                    <img
                      src={url}
                      alt={`Observation photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      aria-label={`Remove photo ${index + 1}`}
                      className="absolute top-1 right-1 p-1 rounded-full bg-forest-900/80 hover:bg-terracotta text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                id="edit-journal-photo-input"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-botanical/60 bg-sage-50/70 hover:bg-sage-100/90 text-xs font-semibold text-forest-800 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-botanical" />
                <span>Add additional photos</span>
              </button>
            </div>

            {photoError && (
              <p className="text-[11px] text-terracotta flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{photoError}</span>
              </p>
            )}

            <div className="flex items-start gap-1.5 text-[11px] text-charcoal-muted bg-ivory-100 p-2 rounded-lg border border-sage-200/60">
              <Info className="w-3.5 h-3.5 text-botanical shrink-0 mt-0.5" />
              <span>
                Existing photos are preserved unless removed above.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="pt-4 border-t border-sage-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal-muted hover:text-forest-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-natural disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-leaf" />
            <span>{isSubmitting ? 'Updating...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
