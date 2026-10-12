import React, { useState } from 'react';
import { CareSuggestion, Plant, CareTask } from '../../types/garden';
import { generateCareSuggestions } from '../../services/careSuggestionService';
import { getCareTaskIcon } from './TaskItem';
import { Sparkles, Plus, X, Info, Calendar } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';

interface CareSuggestionsSectionProps {
  plants: Plant[];
  existingTasks: CareTask[];
  onAddSuggestedTask: (suggestion: CareSuggestion) => void;
}

export const CareSuggestionsSection: React.FC<CareSuggestionsSectionProps> = ({
  plants,
  existingTasks,
  onAddSuggestedTask,
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const allSuggestions = generateCareSuggestions(plants, existingTasks);
  const activeSuggestions = allSuggestions.filter((s) => !dismissedIds.has(s.id));

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleAdd = (suggestion: CareSuggestion) => {
    onAddSuggestedTask(suggestion);
    handleDismiss(suggestion.id);
  };

  if (plants.length === 0) {
    return null;
  }

  return (
    <div className="bg-sage-50/70 rounded-natural-lg border border-sage-200/90 p-5 sm:p-6 shadow-natural-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-botanical-subtle text-botanical flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-editorial text-base font-bold text-forest-800">
              Personalized Care Suggestions
            </h3>
            <p className="text-[11px] text-charcoal-muted">
              Botanical rule-based recommendations derived from your plants' recorded schedules and placement.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-botanical bg-white/80 px-2.5 py-0.5 rounded-full border border-sage-200 self-start sm:self-auto">
          User-Confirmed
        </span>
      </div>

      {activeSuggestions.length === 0 ? (
        <div className="p-4 bg-white/80 rounded-xl border border-sage-200/70 text-xs text-charcoal-muted flex items-start gap-2.5">
          <Info className="w-4 h-4 text-botanical shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-forest-800">All recommendations reviewed</p>
            <p className="text-[11px] mt-0.5">
              Add more care details, light notes, or watering frequencies to your plants in My Garden to receive additional personalized suggestions.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeSuggestions.map((sugg) => (
            <div
              key={sugg.id}
              className="p-4 bg-white rounded-xl border border-sage-200/90 shadow-natural-sm space-y-3 flex flex-col justify-between hover:border-botanical/50 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="p-1 rounded bg-sage-100 shrink-0">
                      {getCareTaskIcon(sugg.taskType)}
                    </span>
                    <h4 className="text-xs font-bold text-forest-800 truncate">
                      {sugg.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDismiss(sugg.id)}
                    className="p-1 text-charcoal-muted hover:text-forest-800 rounded-lg hover:bg-sage-100 transition-colors shrink-0"
                    title="Dismiss suggestion"
                    aria-label={`Dismiss suggestion for ${sugg.plantName}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  {sugg.reason}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-charcoal-subtle pt-1">
                  <Calendar className="w-3 h-3 text-botanical" />
                  <span>Suggested for: {formatDisplayDate(sugg.suggestedDueDate)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-sage-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleAdd(sugg)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural-sm active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 text-leaf" />
                  <span>Add to schedule</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
