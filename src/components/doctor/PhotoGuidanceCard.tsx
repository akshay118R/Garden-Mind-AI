import React, { useState } from 'react';
import {
  SunMedium,
  Focus,
  SplitSquareVertical,
  Palette,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

export const PhotoGuidanceCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-sage-50/70 border border-sage-200/90 rounded-natural-lg p-4 sm:p-5 shadow-natural-sm text-xs space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-botanical-subtle text-botanical flex items-center justify-center font-bold">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-editorial text-sm font-bold text-forest-800">
              Photography Guidelines for Accurate Inspection
            </h4>
            <p className="text-[11px] text-charcoal-muted">
              Optimal leaf photography substantially improves visual pattern clarity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-botanical hover:text-forest-800 flex items-center gap-1 shrink-0 py-1 px-2 rounded-lg hover:bg-sage-100 transition-colors"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide tips' : 'View tips'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-sage-200/60 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-xl border border-sage-100">
            <SunMedium className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-forest-800">Natural, diffuse light</p>
              <p className="text-charcoal-muted text-[11px] leading-relaxed mt-0.5">
                Photograph in bright indirect daylight. Avoid direct sun glare or harsh smartphone flash reflections.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-xl border border-sage-100">
            <Focus className="w-4 h-4 text-botanical shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-forest-800">Sharp, steady focus</p>
              <p className="text-charcoal-muted text-[11px] leading-relaxed mt-0.5">
                Keep the camera 6–10 inches from the lesion or leaf margin. Ensure vein structures are crisp and unblurred.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-xl border border-sage-100">
            <SplitSquareVertical className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-forest-800">Include healthy margin</p>
              <p className="text-charcoal-muted text-[11px] leading-relaxed mt-0.5">
                Frame the transition border where diseased or discolored tissue meets healthy green foliage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-xl border border-sage-100">
            <Palette className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-forest-800">No color filters</p>
              <p className="text-charcoal-muted text-[11px] leading-relaxed mt-0.5">
                Avoid camera filters or HDR saturation adjustments that alter subtle chlorosis or necrotic coloration.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Critical Scientific Caveat */}
      <div className="flex items-start gap-2 text-[11px] text-charcoal-muted bg-white/60 p-2.5 rounded-lg border border-sage-200/50">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Scientific Notice:</strong> A 2D photograph captures visible surface manifestations, but cannot inspect root health, soil pathogen ecology, or microscopic mites. Assessments are observational guides, not absolute laboratory diagnoses.
        </p>
      </div>
    </div>
  );
};
