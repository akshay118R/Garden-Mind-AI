import React, { useState } from 'react';
import { Database, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';

export const BannerDemoNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { isBackendConnected, isLoading } = useGarden();

  if (dismissed) return null;

  return (
    <aside
      aria-label="Backend and storage status banner"
      className={`border-b px-4 py-2 text-xs flex items-center justify-between gap-3 transition-colors ${
        isBackendConnected
          ? 'bg-leaf-subtle/80 border-leaf-light/50 text-forest-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-center gap-2 max-w-5xl">
        <span
          className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full border shadow-natural-sm shrink-0 ${
            isBackendConnected
              ? 'bg-white text-botanical border-leaf-light/60'
              : 'bg-white text-amber-800 border-amber-200'
          }`}
        >
          {isBackendConnected ? (
            <>
              <CheckCircle className="w-3 h-3 text-leaf-dark" />
              FastAPI + SQLite Active
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Backend Offline
            </>
          )}
        </span>
        <p className="leading-tight text-xs flex items-center gap-1.5 flex-wrap">
          <Database className="w-3.5 h-3.5 shrink-0 opacity-80" />
          {isLoading ? (
            <span>Connecting to FastAPI backend at /api/v1...</span>
          ) : isBackendConnected ? (
            <span>
              Real persistent SQLite storage & local ONNX vision AI connected. Plants, care tasks, and growth journal records persist across browser reloads and server restarts.
            </span>
          ) : (
            <span>
              FastAPI server is not detected on port 8000. Running in memory mode. Run <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">uvicorn app.main:app</code> in backend to activate persistent SQLite database.
            </span>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-current opacity-60 hover:opacity-100 p-1 rounded transition-opacity shrink-0"
        aria-label="Dismiss backend notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
