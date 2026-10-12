import React from 'react';
import { JournalEntry } from '../../types/garden';
import { Modal } from '../common/Modal';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteJournalDialogProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (entryId: string) => void;
}

export const ConfirmDeleteJournalDialog: React.FC<ConfirmDeleteJournalDialogProps> = ({
  entry,
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!entry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete Journal Entry?"
      subtitle="Confirm deletion of botanical observation record"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-terracotta-subtle/40 border border-terracotta/20 flex items-start gap-3 text-xs text-charcoal">
          <AlertTriangle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-terracotta mb-1">
              Are you sure you want to delete this observation?
            </p>
            <p className="text-charcoal-muted leading-relaxed">
              "{entry.title}" dated {entry.date} will be permanently removed from your growth journal timeline.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sage-200 hover:bg-sage-300 text-forest-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(entry.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-terracotta text-white hover:bg-terracotta/90 transition-colors shadow-natural-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Entry</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
