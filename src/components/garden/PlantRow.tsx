import React from 'react';
import { Plant } from '../../types/garden';
import { StatusBadge } from '../common/StatusBadge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  Droplets,
  Sun,
  MapPin,
  Edit3,
  Trash2,
  Eye,
  Tag
} from 'lucide-react';

interface PlantRowProps {
  plant: Plant;
  onView: (plant: Plant) => void;
  onEdit: (plant: Plant) => void;
  onDelete: (plant: Plant) => void;
}

export const PlantRow: React.FC<PlantRowProps> = ({
  plant,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="group bg-white rounded-xl border border-sage-200/90 p-3 sm:p-4 shadow-natural-sm hover:shadow-natural transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Left: Thumbnail & Plant Meta */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div
          onClick={() => onView(plant)}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-sage-50 shrink-0 cursor-pointer border border-sage-200"
        >
          <ImageWithFallback
            src={plant.imageUrl}
            alt={plant.name}
            fallbackTitle={plant.species || plant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onView(plant)}
              className="font-editorial text-base sm:text-lg font-bold text-forest-800 hover:text-botanical transition-colors cursor-pointer truncate"
              title={plant.name}
            >
              {plant.name}
            </h3>

            {plant.category ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-charcoal-muted bg-sage-100 px-2 py-0.5 rounded-full border border-sage-200">
                <Tag className="w-2.5 h-2.5 text-botanical" />
                <span>{plant.category}</span>
              </span>
            ) : null}
          </div>

          <p
            className="text-xs italic text-charcoal-muted truncate mt-0.5"
            title={plant.species || 'Species unrecorded'}
          >
            {plant.species ? plant.species : <span className="not-italic text-charcoal-subtle">Species unrecorded</span>}
          </p>

          <div className="flex items-center gap-3 text-xs text-charcoal-muted mt-1.5 flex-wrap">
            {plant.location ? (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-botanical" />
                <span className="truncate max-w-[120px]">{plant.location}</span>
              </span>
            ) : null}

            {plant.wateringFrequencyDays ? (
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-sky-600" />
                <span>Every {plant.wateringFrequencyDays}d</span>
              </span>
            ) : null}

            {plant.lightRequirement ? (
              <span className="hidden md:flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-500" />
                <span>{plant.lightRequirement}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right: Status Badge & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-sage-100 shrink-0">
        <StatusBadge status={plant.careStatus} size="sm" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(plant)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-botanical hover:bg-botanical-subtle transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Details</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(plant)}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-forest-800 hover:bg-sage-100 transition-colors"
            title={`Edit ${plant.name}`}
            aria-label={`Edit ${plant.name}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(plant)}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-terracotta hover:bg-terracotta-subtle transition-colors"
            title={`Remove ${plant.name}`}
            aria-label={`Remove ${plant.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
