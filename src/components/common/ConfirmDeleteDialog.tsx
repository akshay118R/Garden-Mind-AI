import React, { useEffect, useRef } from 'react';
import { Plant } from '../../types/garden';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  plant: Plant | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (plantId: string) => void;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  plant,
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus cancel button by default for safety
      setTimeout(() => cancelButtonRef.current?.focus(), 50);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen || !plant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-natural-lg shadow-natural-lg border border-sage-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-terracotta-subtle border border-terracotta-border text-terracotta flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h3 id="delete-dialog-title" className="font-editorial text-lg font-bold text-forest-800">
                Remove {plant.name}?
              </h3>
              <p id="delete-dialog-description" className="text-xs sm:text-sm text-charcoal-muted mt-1.5 leading-relaxed">
                This will remove <strong className="text-forest-800 font-semibold">{plant.name}</strong> {plant.species ? `(${plant.species})` : ''} from your local garden collection and clean up associated scheduled care tasks.
              </p>
              <p className="text-[11px] text-charcoal-subtle mt-2 italic">
                This action cannot be undone for this session.
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="text-charcoal-muted hover:text-forest-800 p-1 rounded-lg"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-sage-100 flex items-center justify-end gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-muted hover:text-forest-800 hover:bg-sage-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(plant.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-terracotta text-white hover:bg-red-700 transition-all shadow-natural-sm active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Plant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
