import React from 'react';
import { Plant } from '../../types/garden';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { X, MapPin, AlertCircle, Plus } from 'lucide-react';

interface PlantSelectorDropdownProps {
  plants: Plant[];
  selectedPlantId: string | null;
  onSelectPlant: (plant: Plant | null) => void;
  onNavigateToAddPlant?: () => void;
  onNavigateToMyGarden?: () => void;
}

export const PlantSelectorDropdown: React.FC<PlantSelectorDropdownProps> = ({
  plants,
  selectedPlantId,
  onSelectPlant,
  onNavigateToAddPlant,
  onNavigateToMyGarden,
}) => {
  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || null;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plantId = e.target.value;
    if (!plantId || plantId === 'none') {
      onSelectPlant(null);
    } else {
      const match = plants.find((p) => p.id === plantId) || null;
      onSelectPlant(match);
    }
  };

  return (
    <div className="bg-white rounded-natural-lg border border-sage-200/90 p-4 sm:p-5 shadow-natural-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label
            htmlFor="plant-doctor-selector"
            className="block text-xs font-bold text-forest-800 uppercase tracking-wider"
          >
            Associate with My Garden (Optional)
          </label>
          <p className="text-[11px] text-charcoal-muted mt-0.5">
            Select a saved plant to prefill botanical details and link observations to its history.
          </p>
        </div>

        {selectedPlant ? (
          <button
            type="button"
            onClick={() => onSelectPlant(null)}
            className="text-xs font-semibold text-terracotta hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            aria-label="Unlink selected plant"
          >
            <X className="w-3.5 h-3.5" />
            <span>Unlink plant</span>
          </button>
        ) : onNavigateToMyGarden && plants.length > 0 ? (
          <button
            type="button"
            onClick={onNavigateToMyGarden}
            className="text-xs font-semibold text-botanical hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View all in My Garden</span>
          </button>
        ) : null}
      </div>

      {plants.length === 0 ? (
        <div className="p-3 bg-sage-50/80 rounded-xl border border-sage-200/80 text-xs text-charcoal-muted flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-botanical shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-forest-800">Your garden is currently empty</p>
              <p className="text-[11px] mt-0.5">
                You can proceed with photo analysis without linking a plant. Or add your first specimen to start tracking.
              </p>
            </div>
          </div>
          {onNavigateToAddPlant ? (
            <button
              type="button"
              onClick={onNavigateToAddPlant}
              className="px-2.5 py-1 rounded-lg bg-forest-800 text-ivory-50 text-[11px] font-semibold hover:bg-forest-700 transition-colors shrink-0 flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-leaf" />
              <span>Add plant</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <select
            id="plant-doctor-selector"
            value={selectedPlantId || 'none'}
            onChange={handleSelectChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50/60 text-xs sm:text-sm font-medium text-forest-800 focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition-all"
          >
            <option value="none">
              — Continue without selecting (Unlisted / General specimen) —
            </option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name} {plant.species ? `(${plant.species})` : ''} — {plant.location || 'Location unrecorded'}
              </option>
            ))}
          </select>

          {/* Selected Plant Card Preview */}
          {selectedPlant ? (
            <div className="p-3 rounded-xl bg-sage-50/60 border border-sage-200/80 flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-sage-200/80 bg-forest-900/5 shrink-0">
                  <ImageWithFallback
                    src={selectedPlant.imageUrl}
                    alt={selectedPlant.name}
                    className="w-full h-full object-cover"
                    fallbackTitle={selectedPlant.name}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-editorial font-bold text-forest-800 text-sm truncate">
                      {selectedPlant.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-botanical-subtle text-botanical border border-sage-200 shrink-0">
                      Linked
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted italic truncate">
                    {selectedPlant.species || 'Species not yet recorded'}
                  </p>
                  {selectedPlant.location ? (
                    <p className="text-[11px] text-charcoal-subtle flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-botanical/70 shrink-0" />
                      <span>{selectedPlant.location}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
