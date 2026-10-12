import React from 'react';
import { CareTask, Plant, CareTaskType } from '../../types/garden';
import { classifyTask, formatDisplayDate } from '../../utils/dateUtils';
import {
  Droplets,
  Sun,
  Scissors,
  Sparkles,
  Wind,
  Search,
  Box,
  Leaf,
  Check,
  Edit2,
  Trash2,
  Repeat,
  Clock,
  AlertTriangle,
  MapPin,
  BookOpen,
} from 'lucide-react';

interface TaskItemProps {
  task: CareTask;
  plants: Plant[];
  onToggle: (taskId: string) => void;
  onEdit: (task: CareTask) => void;
  onDelete: (task: CareTask) => void;
  onLogJournal?: (task: CareTask) => void;
}

export const getCareTaskIcon = (type: CareTaskType) => {
  switch (type) {
    case 'watering':
      return <Droplets className="w-4 h-4 text-sky-600" />;
    case 'sunlight':
      return <Sun className="w-4 h-4 text-amber-500" />;
    case 'pruning':
      return <Scissors className="w-4 h-4 text-emerald-600" />;
    case 'fertilizing':
      return <Sparkles className="w-4 h-4 text-purple-600" />;
    case 'misting':
      return <Wind className="w-4 h-4 text-teal-600" />;
    case 'pest_inspection':
      return <Search className="w-4 h-4 text-rose-600" />;
    case 'repotting':
      return <Box className="w-4 h-4 text-amber-700" />;
    case 'general':
    default:
      return <Leaf className="w-4 h-4 text-botanical" />;
  }
};

export const getCategoryLabel = (type: CareTaskType): string => {
  switch (type) {
    case 'watering':
      return 'Watering';
    case 'sunlight':
      return 'Sunlight';
    case 'pruning':
      return 'Pruning';
    case 'fertilizing':
      return 'Fertilizing';
    case 'misting':
      return 'Misting';
    case 'pest_inspection':
      return 'Pest Inspection';
    case 'repotting':
      return 'Repotting';
    case 'general':
    default:
      return 'General Care';
  }
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  plants,
  onToggle,
  onEdit,
  onDelete,
  onLogJournal,
}) => {
  const classification = classifyTask(task.dueDate, task.completed);
  const isOverdue = classification === 'overdue';
  const isDueToday = classification === 'today';

  // Resolve associated plant safely
  const linkedPlant = task.plantId ? plants.find((p) => p.id === task.plantId) : undefined;
  const displayName = linkedPlant
    ? linkedPlant.species
      ? `${linkedPlant.name} (${linkedPlant.species})`
      : linkedPlant.name
    : task.plantName || 'General Garden Routine';

  const dateLabel = formatDisplayDate(task.dueDate, task.dueTime);

  return (
    <article
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-natural border transition-all ${
        task.completed
          ? 'bg-sage-50/60 border-sage-200/70 opacity-75'
          : isOverdue
          ? 'bg-terracotta-subtle/30 border-terracotta-border/80 shadow-natural-sm hover:border-terracotta'
          : isDueToday
          ? 'bg-white border-sage-300 shadow-natural-sm hover:border-botanical/70'
          : 'bg-white border-sage-200/80 shadow-natural-sm hover:border-botanical/50'
      }`}
    >
      {/* Left side: Checkbox + Content */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Toggle Checkbox Button */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={
            task.completed
              ? `Reopen task: ${task.title}`
              : `Mark complete: ${task.title}`
          }
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
            task.completed
              ? 'bg-botanical text-white border-botanical hover:bg-forest-800'
              : isOverdue
              ? 'border-terracotta bg-white hover:bg-terracotta-subtle text-terracotta'
              : 'border-sage-300 hover:border-botanical bg-ivory-50 text-transparent hover:text-botanical/40'
          }`}
        >
          {task.completed ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : (
            <Check className="w-3.5 h-3.5 stroke-[2] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        {/* Task Details */}
        <div className="min-w-0 space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="p-1 rounded-md bg-sage-100/80 shrink-0"
              title={getCategoryLabel(task.taskType)}
            >
              {getCareTaskIcon(task.taskType)}
            </span>

            <h4
              className={`text-xs sm:text-sm font-semibold truncate ${
                task.completed
                  ? 'line-through text-charcoal-muted'
                  : 'text-forest-800'
              }`}
            >
              {task.title}
            </h4>

            {/* Overdue Badge */}
            {isOverdue && !task.completed ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-terracotta bg-terracotta-subtle px-2 py-0.5 rounded-full border border-terracotta-border">
                <AlertTriangle className="w-3 h-3" />
                <span>Overdue</span>
              </span>
            ) : null}

            {/* High Priority Badge */}
            {task.priority === 'high' && !task.completed && !isOverdue ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-terracotta bg-terracotta-subtle px-1.5 py-0.5 rounded border border-terracotta-border">
                High Priority
              </span>
            ) : null}

            {/* Recurrence Badge */}
            {task.recurrence && task.recurrence !== 'none' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-botanical bg-botanical-subtle px-1.5 py-0.5 rounded border border-sage-200">
                <Repeat className="w-2.5 h-2.5" />
                <span className="capitalize">{task.recurrence}</span>
              </span>
            ) : null}
          </div>

          {/* Plant Name & Category */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-muted">
            <span className="font-medium text-forest-800 truncate">
              {displayName}
            </span>
            {linkedPlant?.location ? (
              <span className="text-[11px] text-charcoal-subtle flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-botanical/70" />
                <span>{linkedPlant.location}</span>
              </span>
            ) : null}
          </div>

          {/* Optional Notes */}
          {task.notes ? (
            <p className="text-[11px] text-charcoal-muted leading-relaxed line-clamp-2 pt-0.5 italic">
              "{task.notes}"
            </p>
          ) : null}
        </div>
      </div>

      {/* Right side: Timing Badge + Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-sage-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-charcoal-subtle" />
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              task.completed
                ? 'bg-sage-200/80 text-charcoal-muted'
                : isOverdue
                ? 'bg-terracotta text-white'
                : isDueToday
                ? 'bg-leaf-subtle text-forest-800 border border-leaf/30'
                : 'bg-ivory-100 text-charcoal-muted border border-sage-200'
            }`}
          >
            {task.completed ? 'Completed' : dateLabel}
          </span>
        </div>

        {/* Action Controls: Log to Journal, Edit & Delete */}
        <div className="flex items-center gap-1">
          {task.completed && onLogJournal ? (
            <button
              type="button"
              onClick={() => onLogJournal(task)}
              className="p-1.5 rounded-lg text-charcoal-muted hover:text-botanical hover:bg-sage-100 transition-colors"
              title="Record observation in Growth Journal"
              aria-label={`Record observation in Growth Journal for ${task.title}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-forest-800 hover:bg-sage-100 transition-colors"
            title="Edit task"
            aria-label={`Edit task: ${task.title}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-terracotta hover:bg-terracotta-subtle transition-colors"
            title="Delete task"
            aria-label={`Delete task: ${task.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
