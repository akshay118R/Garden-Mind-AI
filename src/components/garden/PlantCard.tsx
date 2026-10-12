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

interface PlantCardProps {
  plant: Plant;
  onView: (plant: Plant) => void;
  onEdit: (plant: Plant) => void;
  onDelete: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="group bg-white rounded-natural border border-sage-200/90 overflow-hidden shadow-natural-sm hover:shadow-natural-md transition-all duration-200 flex flex-col justify-between">
      {/* Card Header & Image */}
      <div className="relative h-48 w-full overflow-hidden bg-sage-50">
        <ImageWithFallback
          src={plant.imageUrl}
          alt={plant.name}
          fallbackTitle={plant.species || plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={plant.careStatus} size="sm" />
        </div>

        {plant.category ? (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-forest-900/80 backdrop-blur-sm text-[10px] font-semibold text-ivory-50 flex items-center gap-1">
            <Tag className="w-2.5 h-2.5 text-leaf" />
            <span>{plant.category}</span>
          </div>
        ) : null}

        {/* Location Badge (bottom overlay) */}
        {plant.location ? (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-forest-900/75 backdrop-blur-sm text-[11px] font-medium text-ivory-100 flex items-center gap-1 max-w-[85%]">
            <MapPin className="w-3 h-3 text-leaf shrink-0" />
            <span className="truncate">{plant.location}</span>
          </div>
        ) : null}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onView(plant)}
            className="font-editorial text-lg font-bold text-forest-800 hover:text-botanical transition-colors cursor-pointer truncate"
            title={plant.name}
          >
            {plant.name}
          </h3>

          <p
            className="text-xs italic text-charcoal-muted mb-2 truncate"
            title={plant.species || 'Species unrecorded'}
          >
            {plant.species ? plant.species : <span className="not-italic text-charcoal-subtle">Species unrecorded</span>}
          </p>

          {plant.notes ? (
            <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed mb-3">
              {plant.notes}
            </p>
          ) : (
            <p className="text-xs text-charcoal-subtle italic mb-3">
              No notes recorded yet.
            </p>
          )}
        </div>

        {/* Care Attributes & Actions */}
        <div className="pt-3 border-t border-sage-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-charcoal-muted">
            {plant.wateringFrequencyDays ? (
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Every {plant.wateringFrequencyDays}d</span>
              </span>
            ) : (
              <span className="text-[11px] text-charcoal-subtle">Schedule open</span>
            )}

            {plant.lightRequirement ? (
              <span className="flex items-center gap-1 truncate max-w-[130px]" title={plant.lightRequirement}>
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{plant.lightRequirement}</span>
              </span>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-sage-50">
            <button
              type="button"
              onClick={() => onView(plant)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-botanical hover:text-forest-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(plant)}
                className="p-1.5 rounded-lg text-charcoal-muted hover:text-forest-800 hover:bg-sage-100 transition-colors"
                title={`Edit ${plant.name}`}
                aria-label={`Edit ${plant.name}`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(plant)}
                className="p-1.5 rounded-lg text-charcoal-muted hover:text-terracotta hover:bg-terracotta-subtle transition-colors"
                title={`Remove ${plant.name}`}
                aria-label={`Remove ${plant.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
