import React from 'react';
import { useGarden } from '../../context/GardenContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useGarden();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-natural-lg shadow-natural-lg border transition-all animate-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'bg-forest-800 text-ivory-50 border-forest-700'
                : isError
                ? 'bg-terracotta text-white border-red-700'
                : 'bg-white text-forest-800 border-sage-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-leaf" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 text-white" />
              ) : (
                <Info className="w-4 h-4 text-botanical" />
              )}
            </div>

            <p className="text-xs font-medium leading-relaxed flex-1">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className={`p-1 rounded-md shrink-0 transition-colors ${
                isSuccess
                  ? 'text-ivory-200 hover:text-white hover:bg-forest-700'
                  : isError
                  ? 'text-white/80 hover:text-white hover:bg-red-800'
                  : 'text-charcoal-muted hover:text-forest-800 hover:bg-sage-100'
              }`}
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
