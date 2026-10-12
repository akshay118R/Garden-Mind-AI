import React, { useState, useRef, useEffect } from 'react';
import { Plant, PlantStatus, LightRequirement } from '../../types/garden';
import { Modal } from '../common/Modal';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  UploadCloud,
  X,
  AlertCircle,
  Plus
} from 'lucide-react';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (plantData: Omit<Plant, 'id' | 'addedDate'>) => void;
}

const PHOTO_PRESETS = [
  {
    name: 'Monstera Deliciosa',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Fiddle Leaf Fig',
    url: 'https://images.unsplash.com/photo-1597055181300-e3633a917c9c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Snake Plant',
    url: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Peace Lily',
    url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Calathea',
    url: 'https://images.unsplash.com/photo-1587334274328-64186a80aeee?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Golden Pothos',
    url: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?auto=format&fit=crop&w=800&q=80',
  },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onAddPlant,
}) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [category, setCategory] = useState('Foliage');
  const [location, setLocation] = useState('');
  // Care status defaults to 'needs_info' per Prompt 2 requirements
  const [careStatus, setCareStatus] = useState<PlantStatus>('needs_info');
  const [lightRequirement, setLightRequirement] = useState<LightRequirement>('Bright Indirect');
  const [wateringDays, setWateringDays] = useState(7);
  const [wateringGuidance, setWateringGuidance] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [notes, setNotes] = useState('');

  // Image states
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(PHOTO_PRESETS[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Form errors & submission lock
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
    };
  }, [uploadedPreviewUrl]);

  const handleFileSelect = (file: File) => {
    setImageError(null);

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('Unsupported file type. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setImageError(`File exceeds 10 MB limit (${sizeMB} MB). Please choose a smaller file.`);
      return;
    }

    // Revoke previous URL if exists
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedPreviewUrl(objectUrl);
    setCustomImageUrl('');
  };

  const handleRemoveUploadedFile = () => {
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }
    setUploadedFile(null);
    setUploadedPreviewUrl(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = 'Plant name is required.';
    }
    if (wateringDays && (wateringDays < 1 || isNaN(wateringDays))) {
      errs.wateringDays = 'Watering interval must be at least 1 day.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);

    // Resolve active image
    let finalImageUrl = selectedPresetUrl;
    if (uploadedPreviewUrl) {
      finalImageUrl = uploadedPreviewUrl;
    } else if (customImageUrl.trim()) {
      finalImageUrl = customImageUrl.trim();
    }

    const plantPayload: Omit<Plant, 'id' | 'addedDate'> = {
      name: name.trim(),
      species: species.trim() || undefined,
      category: category.trim() || undefined,
      location: location.trim() || undefined,
      careStatus,
      lightRequirement,
      wateringFrequencyDays: wateringDays || 7,
      wateringGuidance: wateringGuidance.trim() || undefined,
      acquisitionDate: acquisitionDate || undefined,
      notes: notes.trim() || undefined,
      imageUrl: finalImageUrl,
      nextWateringDays: wateringDays || 7,
    };

    onAddPlant(plantPayload);

    // Reset Form
    setName('');
    setSpecies('');
    setLocation('');
    setCategory('Foliage');
    setCareStatus('needs_info');
    setWateringDays(7);
    setWateringGuidance('');
    setAcquisitionDate('');
    setNotes('');
    setCustomImageUrl('');
    handleRemoveUploadedFile();
    setErrors({});
    setIsSubmitting(false);

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a Plant"
      subtitle="Register a botanical specimen to your garden collection"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Plant Name (Required) */}
        <div>
          <label htmlFor="add-plant-name" className="block text-xs font-semibold text-forest-800 mb-1">
            Plant Name / Nickname <span className="text-terracotta">*</span>
          </label>
          <input
            id="add-plant-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Atlas, Verdia, Bedroom Fern"
            className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20 transition-all ${
              errors.name ? 'border-terracotta bg-terracotta-subtle/30' : 'border-sage-200 bg-ivory-50/50'
            }`}
          />
          {errors.name ? (
            <p className="text-[11px] text-terracotta mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.name}</span>
            </p>
          ) : null}
        </div>

        {/* Botanical Species & Category Row (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="add-plant-species" className="block text-xs font-semibold text-forest-800 mb-1">
              Botanical Species <span className="text-charcoal-subtle font-normal">(optional)</span>
            </label>
            <input
              id="add-plant-species"
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. Monstera Deliciosa, Ficus Lyrata"
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            />
          </div>

          <div>
            <label htmlFor="add-plant-category" className="block text-xs font-semibold text-forest-800 mb-1">
              Plant Category <span className="text-charcoal-subtle font-normal">(optional)</span>
            </label>
            <select
              id="add-plant-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            >
              <option value="Foliage">Foliage Plant</option>
              <option value="Succulent">Succulent / Cacti</option>
              <option value="Flowering">Flowering Plant</option>
              <option value="Tree">Indoor Tree / Shrub</option>
              <option value="Fern">Fern</option>
              <option value="Herb & Edible">Herb & Edible</option>
              <option value="Other">Other Variety</option>
            </select>
          </div>
        </div>

        {/* Location & Acquisition Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="add-plant-location" className="block text-xs font-semibold text-forest-800 mb-1">
              Location in Home / Garden <span className="text-charcoal-subtle font-normal">(optional)</span>
            </label>
            <input
              id="add-plant-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Living Room Window, Balcony Courtyard"
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            />
          </div>

          <div>
            <label htmlFor="add-plant-acquired" className="block text-xs font-semibold text-forest-800 mb-1">
              Acquisition / Planting Date <span className="text-charcoal-subtle font-normal">(optional)</span>
            </label>
            <input
              id="add-plant-acquired"
              type="date"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20 text-charcoal"
            />
          </div>
        </div>

        {/* Care Status & Light Requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="add-plant-status" className="block text-xs font-semibold text-forest-800 mb-1">
              Initial Care Status
            </label>
            <select
              id="add-plant-status"
              value={careStatus}
              onChange={(e) => setCareStatus(e.target.value as PlantStatus)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            >
              <option value="needs_info">Care information needed (Default)</option>
              <option value="healthy">Looking healthy</option>
              <option value="attention">Needs attention</option>
            </select>
            <p className="text-[10px] text-charcoal-subtle mt-1">
              New specimens default to "Care information needed" until observed.
            </p>
          </div>

          <div>
            <label htmlFor="add-plant-light" className="block text-xs font-semibold text-forest-800 mb-1">
              Light Exposure
            </label>
            <select
              id="add-plant-light"
              value={lightRequirement}
              onChange={(e) => setLightRequirement(e.target.value as LightRequirement)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            >
              <option value="Bright Indirect">Bright Indirect Light</option>
              <option value="Direct Sun">Direct Sun / Southern Window</option>
              <option value="Partial Shade">Partial Shade / Dappled Light</option>
              <option value="Low Light">Low Light / Ambient</option>
            </select>
          </div>
        </div>

        {/* Watering Schedule & Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="add-plant-watering" className="block text-xs font-semibold text-forest-800 mb-1">
              Watering Frequency (Days)
            </label>
            <input
              id="add-plant-watering"
              type="number"
              min={1}
              max={60}
              value={wateringDays}
              onChange={(e) => setWateringDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            />
          </div>

          <div>
            <label htmlFor="add-plant-water-guidance" className="block text-xs font-semibold text-forest-800 mb-1">
              Watering Guidance <span className="text-charcoal-subtle font-normal">(optional)</span>
            </label>
            <input
              id="add-plant-water-guidance"
              type="text"
              value={wateringGuidance}
              onChange={(e) => setWateringGuidance(e.target.value)}
              placeholder="e.g. Wait until top 5 cm is dry"
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            />
          </div>
        </div>

        {/* Botanical Image Selection (File Upload / Presets / Custom URL) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-forest-800">
            Plant Image Selection
          </label>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
            id="add-plant-file-input"
          />

          {/* Uploaded File Preview or Preset Selection */}
          {uploadedPreviewUrl ? (
            <div className="p-3 bg-sage-50 rounded-xl border border-sage-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={uploadedPreviewUrl}
                  alt="Custom upload preview"
                  className="w-12 h-12 rounded-lg object-cover border border-sage-300"
                />
                <div>
                  <p className="text-xs font-semibold text-forest-800 truncate max-w-[200px]">
                    {uploadedFile?.name}
                  </p>
                  <p className="text-[11px] text-charcoal-muted">
                    Custom device photo selected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveUploadedFile}
                className="p-1.5 rounded-lg text-charcoal-muted hover:text-terracotta hover:bg-white"
                aria-label="Remove uploaded image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-charcoal-muted">
                  Choose from botanical library or upload:
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-botanical hover:underline"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload from device</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setSelectedPresetUrl(preset.url);
                      setCustomImageUrl('');
                      handleRemoveUploadedFile();
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      selectedPresetUrl === preset.url && !uploadedPreviewUrl && !customImageUrl
                        ? 'border-forest-800 ring-2 ring-forest-800/20 scale-105'
                        : 'border-sage-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value);
                  if (uploadedPreviewUrl) handleRemoveUploadedFile();
                }}
                placeholder="Or paste an image URL (optional)"
                className="w-full px-3 py-1.5 rounded-lg border border-sage-200 text-xs bg-ivory-50/50 text-charcoal-muted focus:ring-1 focus:ring-botanical"
              />
            </div>
          )}

          {imageError ? (
            <p className="text-[11px] text-terracotta flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>{imageError}</span>
            </p>
          ) : null}
        </div>

        {/* Optional Notes */}
        <div>
          <label htmlFor="add-plant-notes" className="block text-xs font-semibold text-forest-800 mb-1">
            Care Notes & Placement Observations <span className="text-charcoal-subtle font-normal">(optional)</span>
          </label>
          <textarea
            id="add-plant-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Prefers filtered water; sensitive to drafts; repotted into airy aroid mix."
            className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-sage-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-charcoal-muted hover:text-forest-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : 'active:scale-[0.98]'
            }`}
          >
            <Plus className="w-4 h-4 text-leaf" />
            <span>{isSubmitting ? 'Adding...' : 'Add to My Garden'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
