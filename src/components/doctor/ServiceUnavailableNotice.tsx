import React from 'react';
import {
  Cpu,
  ShieldCheck,
  RefreshCw,
  Edit3,
  FileImage,
  Info,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { AnalysisRequest } from '../../types/analysis';

interface ServiceUnavailableNoticeProps {
  request: AnalysisRequest;
  onRetry: () => void;
  onEdit: () => void;
  isRetrying?: boolean;
}

export const ServiceUnavailableNotice: React.FC<ServiceUnavailableNoticeProps> = ({
  request,
  onRetry,
  onEdit,
  isRetrying = false,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const areaLabelMap: Record<string, string> = {
    leaves: 'Leaves & Foliage',
    stems: 'Stems & Petioles',
    roots: 'Roots & Crown',
    flowers: 'Flowers & Blooms',
    whole_plant: 'Whole Plant Specimen',
    other: 'Other / Unspecified',
  };

  return (
    <div className="bg-white rounded-natural-lg border border-sage-200/90 p-6 sm:p-8 shadow-natural space-y-6 animate-in fade-in duration-200">
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-sage-200/80">
        <div className="w-12 h-12 rounded-2xl bg-sage-100 text-botanical flex items-center justify-center shrink-0 shadow-natural-sm">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage-100 text-botanical text-[11px] font-semibold border border-sage-200">
            <ShieldCheck className="w-3.5 h-3.5 text-leaf" />
            <span>Diagnostic Integrity Standard Active</span>
          </div>
          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-forest-800">
            AI Diagnostic Engine Offline: Backend Unreachable
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed max-w-2xl">
            Your photograph and diagnostic context have been validated and packaged cleanly. However, the FastAPI backend inference service is currently offline or unreachable on port 8000.
          </p>
        </div>
      </div>

      {/* Honest Diagnostic Standard Explanation */}
      <div className="p-4 rounded-xl bg-sage-50/80 border border-sage-200/70 text-xs text-charcoal leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-botanical shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-forest-800 mb-1">
            Why you are seeing this rather than a simulated diagnosis:
          </p>
          <p className="text-charcoal-muted">
            GardenMind AI strictly upholds scientific integrity. We never fabricate disease labels, random confidence percentages, or synthetic care advice when a real machine-learning model is unconfigured. Doing so could lead to harmful chemical treatments or improper plant care.
          </p>
        </div>
      </div>

      {/* Preserved Submission Context */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-editorial text-sm font-bold text-forest-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-leaf" />
            <span>Preserved Request Payload (No Work Lost)</span>
          </h4>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-semibold text-botanical hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit details</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-ivory-50/70 p-4 rounded-xl border border-sage-200/80 text-xs">
          {/* Image Thumbnail & Metadata */}
          <div className="md:col-span-4 flex items-center gap-3">
            {request.imagePreviewUrl ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-sage-200 bg-forest-900/10 shrink-0">
                <img
                  src={request.imagePreviewUrl}
                  alt="Uploaded specimen thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1 font-semibold text-forest-800 truncate">
                <FileImage className="w-3.5 h-3.5 text-botanical shrink-0" />
                <span className="truncate">{request.imageFile.name}</span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                {formatFileSize(request.imageFile.size)} • {request.imageFile.type}
              </p>
              <p className="text-[10px] text-leaf font-semibold">Image verified & ready</p>
            </div>
          </div>

          {/* Form Context Snapshot */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] border-t md:border-t-0 md:border-l border-sage-200/70 pt-3 md:pt-0 md:pl-4">
            <div>
              <span className="text-charcoal-subtle block font-medium">Linked Garden Plant:</span>
              <span className="font-semibold text-forest-800">
                {request.context.plantName || 'None (General analysis)'}
              </span>
            </div>
            <div>
              <span className="text-charcoal-subtle block font-medium">Species Tagged:</span>
              <span className="font-semibold text-forest-800">
                {request.context.species || 'Unspecified (Auto-detect requested)'}
              </span>
            </div>
            <div>
              <span className="text-charcoal-subtle block font-medium">Affected Area:</span>
              <span className="font-semibold text-forest-800">
                {areaLabelMap[request.context.affectedArea] || request.context.affectedArea}
              </span>
            </div>
            <div>
              <span className="text-charcoal-subtle block font-medium">Growing Location:</span>
              <span className="font-semibold text-forest-800">
                {request.context.growingLocation || 'Unrecorded'}
              </span>
            </div>
            {request.context.symptoms ? (
              <div className="sm:col-span-2">
                <span className="text-charcoal-subtle block font-medium">Reported Symptoms:</span>
                <span className="text-charcoal italic">"{request.context.symptoms}"</span>
              </div>
            ) : null}
            {request.context.recentCareChanges ? (
              <div className="sm:col-span-2">
                <span className="text-charcoal-subtle block font-medium">Recent Care Changes:</span>
                <span className="text-charcoal">{request.context.recentCareChanges}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Integration Roadmap Technical Info */}
      <div className="p-3.5 bg-forest-900/5 rounded-xl border border-forest-900/10 text-xs font-mono text-charcoal-muted space-y-1.5">
        <div className="flex items-center gap-1.5 font-sans font-semibold text-forest-800 text-xs">
          <Terminal className="w-3.5 h-3.5 text-botanical" />
          <span>Integration Boundary Status</span>
        </div>
        <p className="text-[11px]">
          • Target Endpoint: <code>POST /api/v1/plant-doctor/analyze</code> (FastAPI + ONNX Service)
        </p>
        <p className="text-[11px]">
          • Vision Engine: <strong>Local MobileNetV2 (PlantVillage ONNX, 38 Classes)</strong>
        </p>
        <p className="text-[11px]">
          • Status: Backend offline or unreachable. Run <code>uvicorn app.main:app</code> in <code>backend/</code>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onEdit}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-sage-300 bg-white text-forest-800 hover:bg-sage-50 transition-colors shadow-natural-sm flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4 text-botanical" />
          <span>Return & Edit Details</span>
        </button>

        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 active:scale-[0.98] transition-all shadow-natural flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 text-leaf ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Checking connection...' : 'Retry Connection Check'}</span>
        </button>
      </div>
    </div>
  );
};
