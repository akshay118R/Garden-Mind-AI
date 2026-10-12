import React, { useState, useEffect } from 'react';
import { Plant, CareTask, CareTaskType, TaskPriority, TaskRecurrence } from '../../types/garden';
import { Modal } from '../common/Modal';
import { formatDisplayDate } from '../../utils/dateUtils';
import {
  Droplets,
  Sun,
  Scissors,
  Sparkles,
  Wind,
  Search,
  Box,
  Leaf,
  Save,
  AlertCircle,
  Repeat,
  Clock,
  Calendar,
} from 'lucide-react';

interface EditCareTaskModalProps {
  task: CareTask | null;
  isOpen: boolean;
  onClose: () => void;
  plants: Plant[];
  onUpdateTask: (taskId: string, updates: Partial<CareTask>) => void;
}

export const EditCareTaskModal: React.FC<EditCareTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  plants,
  onUpdateTask,
}) => {
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<CareTaskType>('watering');
  const [selectedPlantId, setSelectedPlantId] = useState('none');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setTaskType(task.taskType || 'watering');
      setSelectedPlantId(task.plantId || 'none');
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setPriority(task.priority || 'medium');
      setRecurrence(task.recurrence || 'none');
      setNotes(task.notes || '');
      setFieldErrors({});
    }
  }, [task]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      errors.title = 'Please enter a task title.';
    }

    if (!dueDate) {
      errors.dueDate = 'Due date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const associatedPlant =
      selectedPlantId && selectedPlantId !== 'none'
        ? plants.find((p) => p.id === selectedPlantId)
        : undefined;

    const updates: Partial<CareTask> = {
      title: trimmedTitle,
      taskType,
      plantId: associatedPlant?.id,
      plantName: associatedPlant
        ? associatedPlant.species
          ? `${associatedPlant.name} (${associatedPlant.species})`
          : associatedPlant.name
        : selectedPlantId === 'none'
        ? 'General Garden Routine'
        : task.plantName,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      recurrence,
      notes: notes.trim() || undefined,
      dueDescription: formatDisplayDate(dueDate, dueTime || undefined),
    };

    onUpdateTask(task.id, updates);
    onClose();
  };

  const categoryOptions: { id: CareTaskType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'watering', label: 'Watering', icon: Droplets },
    { id: 'sunlight', label: 'Sunlight', icon: Sun },
    { id: 'fertilizing', label: 'Fertilizer', icon: Sparkles },
    { id: 'pruning', label: 'Pruning', icon: Scissors },
    { id: 'pest_inspection', label: 'Pest Check', icon: Search },
    { id: 'repotting', label: 'Repotting', icon: Box },
    { id: 'misting', label: 'Misting', icon: Wind },
    { id: 'general', label: 'General', icon: Leaf },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Care Task"
      subtitle={`Modify schedule details for "${task.title}"`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <label htmlFor="edit-task-title" className="block text-xs font-semibold text-forest-800 mb-1">
            Task Title <span className="text-terracotta">*</span>
          </label>
          <input
            id="edit-task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) {
                setFieldErrors((prev) => ({ ...prev, title: '' }));
              }
            }}
            className={`w-full px-3 py-2 rounded-xl border bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20 ${
              fieldErrors.title ? 'border-terracotta ring-1 ring-terracotta/20' : 'border-sage-200'
            }`}
          />
          {fieldErrors.title ? (
            <p className="text-[11px] text-terracotta mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{fieldErrors.title}</span>
            </p>
          ) : null}
        </div>

        {/* Task Category Grid */}
        <div>
          <label className="block text-xs font-semibold text-forest-800 mb-1.5">
            Care Category <span className="text-terracotta">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {categoryOptions.map((cat) => {
              const Icon = cat.icon;
              const isSelected = taskType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTaskType(cat.id)}
                  className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-forest-800 text-ivory-50 border-forest-800 shadow-natural-sm'
                      : 'bg-white hover:bg-sage-100/60 text-charcoal border-sage-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] truncate w-full text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Associated Plant */}
        <div>
          <label htmlFor="edit-task-plant" className="block text-xs font-semibold text-forest-800 mb-1">
            Associated Plant
          </label>
          <select
            id="edit-task-plant"
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
          >
            <option value="none">— No specific plant (General Garden Routine) —</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.species ? `(${p.species})` : ''} — {p.location || 'Location unrecorded'}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Timing: Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="edit-task-due-date" className="block text-xs font-semibold text-forest-800 mb-1">
              Due Date <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <input
                id="edit-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (fieldErrors.dueDate) {
                    setFieldErrors((prev) => ({ ...prev, dueDate: '' }));
                  }
                }}
                className={`w-full px-3 py-2 rounded-xl border bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20 ${
                  fieldErrors.dueDate ? 'border-terracotta' : 'border-sage-200'
                }`}
              />
              <Calendar className="w-4 h-4 text-charcoal-subtle absolute right-3 top-2.5 pointer-events-none" />
            </div>
            {fieldErrors.dueDate ? (
              <p className="text-[11px] text-terracotta mt-1">{fieldErrors.dueDate}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="edit-task-due-time" className="block text-xs font-semibold text-forest-800 mb-1">
              Due Time (Optional)
            </label>
            <div className="relative">
              <input
                id="edit-task-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
              />
              <Clock className="w-4 h-4 text-charcoal-subtle absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Priority & Recurrence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="edit-task-priority" className="block text-xs font-semibold text-forest-800 mb-1">
              Priority Level
            </label>
            <select
              id="edit-task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium (Standard)</option>
              <option value="high">High (Urgent Attention)</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-task-recurrence" className="block text-xs font-semibold text-forest-800 mb-1">
              Repeat Schedule
            </label>
            <div className="relative">
              <select
                id="edit-task-recurrence"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
                className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
              >
                <option value="none">Does not repeat (One-time)</option>
                <option value="daily">Repeats Daily</option>
                <option value="weekly">Repeats Weekly</option>
                <option value="monthly">Repeats Monthly</option>
              </select>
              <Repeat className="w-3.5 h-3.5 text-charcoal-subtle absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label htmlFor="edit-task-notes" className="block text-xs font-semibold text-forest-800 mb-1">
            Notes & Guidance (Optional)
          </label>
          <textarea
            id="edit-task-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-sage-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal-muted hover:text-forest-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-natural transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4 text-leaf" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
