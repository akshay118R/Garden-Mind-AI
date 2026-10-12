import React, { useState, useEffect, useRef } from 'react';
import { Plant, PlantStatus, LightRequirement } from '../../types/garden';
import { Modal } from '../common/Modal';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  UploadCloud,
  X,
  AlertCircle,
  Save
} from 'lucide-react';

interface EditPlantModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlant: (id: string, updates: Partial<Plant>) => void;
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

export const EditPlantModal: React.FC<EditPlantModalProps> = ({
  plant,
  isOpen,
  onClose,
  onUpdatePlant,
}) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [careStatus, setCareStatus] = useState<PlantStatus>('needs_info');
  const [lightRequirement, setLightRequirement] = useState<LightRequirement>('Bright Indirect');
  const [wateringDays, setWateringDays] = useState(7);
  const [wateringGuidance, setWateringGuidance] = useState('');
  const [notes, setNotes] = useState('');

  // Image states
  const [activeImageUrl, setActiveImageUrl] = useState('');
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when plant prop changes
  useEffect(() => {
    if (plant) {
      setName(plant.name || '');
      setSpecies(plant.species || '');
      setCategory(plant.category || 'Foliage');
      setLocation(plant.location || '');
      setCareStatus(plant.careStatus || 'needs_info');
      setLightRequirement(plant.lightRequirement || 'Bright Indirect');
      setWateringDays(plant.wateringFrequencyDays || 7);
      setWateringGuidance(plant.wateringGuidance || '');
      setNotes(plant.notes || '');
      setActiveImageUrl(plant.imageUrl || '');
      setErrors({});
      setImageError(null);
    }
  }, [plant]);

  // Clean up object URLs on unmount or URL replacement
  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
    };
  }, [uploadedPreviewUrl]);

  if (!plant) return null;

  const handleFileSelect = (file: File) => {
    setImageError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('Unsupported file type. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setImageError(`File exceeds 10 MB limit (${sizeMB} MB). Please choose a smaller file.`);
      return;
    }

    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedPreviewUrl(objectUrl);
    setActiveImageUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
      setUploadedPreviewUrl(null);
    }
    setActiveImageUrl('');
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
    if (!validate()) return;

    onUpdatePlant(plant.id, {
      name: name.trim(),
      species: species.trim() || undefined,
      category: category.trim() || undefined,
      location: location.trim() || undefined,
      careStatus,
      lightRequirement,
      wateringFrequencyDays: wateringDays || 7,
      wateringGuidance: wateringGuidance.trim() || undefined,
      notes: notes.trim() || undefined,
      imageUrl: activeImageUrl || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${plant.name}`}
      subtitle="Modify botanical attributes, placement, and care schedules"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Plant Name (Required) */}
        <div>
          <label htmlFor="edit-plant-name" className="block text-xs font-semibold text-forest-800 mb-1">
            Plant Name / Nickname <span className="text-terracotta">*</span>
          </label>
          <input
            id="edit-plant-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
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

        {/* Species & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-plant-species" className="block text-xs font-semibold text-forest-800 mb-1">
              Botanical Species
            </label>
            <input
              id="edit-plant-species"
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. Monstera Deliciosa"
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            />
          </div>

          <div>
            <label htmlFor="edit-plant-category" className="block text-xs font-semibold text-forest-800 mb-1">
              Plant Category
            </label>
            <select
              id="edit-plant-category"
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

        {/* Location & Care Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-plant-location" className="block text-xs font-semibold text-forest-800 mb-1">
              Location in Home / Garden
            </label>
            <input
              id="edit-plant-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Balcony, Study Desk"
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            />
          </div>

          <div>
            <label htmlFor="edit-plant-status" className="block text-xs font-semibold text-forest-800 mb-1">
              Current Care Status
            </label>
            <select
              id="edit-plant-status"
              value={careStatus}
              onChange={(e) => setCareStatus(e.target.value as PlantStatus)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            >
              <option value="healthy">Looking healthy</option>
              <option value="attention">Needs attention</option>
              <option value="needs_info">Care information needed</option>
            </select>
          </div>
        </div>

        {/* Light & Watering */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-plant-light" className="block text-xs font-semibold text-forest-800 mb-1">
              Light Exposure
            </label>
            <select
              id="edit-plant-light"
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

          <div>
            <label htmlFor="edit-plant-water" className="block text-xs font-semibold text-forest-800 mb-1">
              Watering Frequency (Days)
            </label>
            <input
              id="edit-plant-water"
              type="number"
              min={1}
              max={60}
              value={wateringDays}
              onChange={(e) => setWateringDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            />
          </div>
        </div>

        {/* Watering Guidance */}
        <div>
          <label htmlFor="edit-plant-guidance" className="block text-xs font-semibold text-forest-800 mb-1">
            Watering Guidance <span className="text-charcoal-subtle font-normal">(optional)</span>
          </label>
          <input
            id="edit-plant-guidance"
            type="text"
            value={wateringGuidance}
            onChange={(e) => setWateringGuidance(e.target.value)}
            placeholder="e.g. Soak thoroughly; mist aerial roots on dry days."
            className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
          />
        </div>

        {/* Image Management */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-forest-800">
            Specimen Photo
          </label>

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
          />

          {activeImageUrl ? (
            <div className="p-3 bg-sage-50 rounded-xl border border-sage-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeImageUrl}
                  alt={name}
                  className="w-12 h-12 rounded-lg object-cover border border-sage-300"
                />
                <div>
                  <p className="text-xs font-semibold text-forest-800 truncate max-w-[200px]">
                    Current Photo
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-botanical hover:underline"
                  >
                    Replace photo
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-lg text-charcoal-muted hover:text-terracotta hover:bg-white"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-charcoal-muted">Choose from library or upload:</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-botanical hover:underline"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload device photo</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setActiveImageUrl(preset.url)}
                    className="relative rounded-xl overflow-hidden aspect-square border border-sage-200 hover:border-forest-800 opacity-80 hover:opacity-100 transition-all"
                  >
                    <ImageWithFallback
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {imageError ? (
            <p className="text-[11px] text-terracotta flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>{imageError}</span>
            </p>
          ) : null}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="edit-plant-notes" className="block text-xs font-semibold text-forest-800 mb-1">
            Care Notes & Placement Observations
          </label>
          <textarea
            id="edit-plant-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural"
          >
            <Save className="w-4 h-4 text-leaf" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
