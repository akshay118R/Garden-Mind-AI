import React from 'react';
import { CareTask } from '../../types/garden';
import { Modal } from '../common/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateUtils';

interface ConfirmDeleteTaskDialogProps {
  task: CareTask | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (taskId: string) => void;
}

export const ConfirmDeleteTaskDialog: React.FC<ConfirmDeleteTaskDialogProps> = ({
  task,
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete Care Task"
      subtitle="Remove this routine from your care schedule"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-terracotta-subtle border border-terracotta-border text-terracotta text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-terracotta">Permanent Task Removal</p>
            <p className="mt-0.5 text-charcoal">
              Are you sure you want to delete{' '}
              <strong className="text-forest-800">"{task.title}"</strong>?
              {task.dueDate ? (
                <> (Scheduled for {formatDisplayDate(task.dueDate, task.dueTime)}).</>
              ) : null}
            </p>
          </div>
        </div>

        <p className="text-xs text-charcoal-muted leading-relaxed">
          This will remove the task from your schedule. Any associated plant profile remains unchanged.
        </p>

        <div className="pt-3 border-t border-sage-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-sage-200 text-charcoal-muted hover:text-forest-800 hover:bg-sage-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(task.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-terracotta text-white hover:bg-terracotta/90 transition-all shadow-natural"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Task</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
