import React, { useState } from 'react';
import {
  AnalysisResult,
  RecommendedAction,
} from '../../types/analysis';
import { Plant } from '../../types/garden';
import {
  Eye,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  CalendarPlus,
  BookOpen,
  RotateCcw,
  ShieldAlert,
  Sprout,
  Cpu,
  Layers,
} from 'lucide-react';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  plant?: Plant | null;
  onAnalyzeAnother: () => void;
  onSaveToJournal: (result: AnalysisResult) => void;
  onScheduleTask: (action: RecommendedAction) => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  result,
  plant,
  onAnalyzeAnother,
  onSaveToJournal,
  onScheduleTask,
}) => {
  const [scheduledActionIds, setScheduledActionIds] = useState<Set<string>>(new Set());
  const [hasSavedToJournal, setHasSavedToJournal] = useState(false);

  const handleScheduleTaskClick = (action: RecommendedAction) => {
    onScheduleTask(action);
    setScheduledActionIds((prev) => new Set(prev).add(action.id));
  };

  const handleSaveToJournalClick = () => {
    onSaveToJournal(result);
    setHasSavedToJournal(true);
  };

  const isCandidateIdentified =
    result.outcome === 'candidate_identified' && !result.isInconclusive;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Assessment Identity Header */}
      <div className="bg-white rounded-natural-lg border border-sage-200/90 p-6 sm:p-8 shadow-natural space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-sage-200/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-subtle text-botanical text-xs font-semibold border border-sage-200">
              <Cpu className="w-3.5 h-3.5" />
              <span>Verified Computer Vision Assessment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-forest-800 tracking-tight">
              Diagnostic Assessment Report
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              Structured inspection for{' '}
              <strong className="text-forest-800">
                {plant?.name || result.contextUsed.species || 'Unlisted Specimen'}
              </strong>{' '}
              • Analyzed on {new Date(result.timestamp).toLocaleDateString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onAnalyzeAnother}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-sage-300 bg-ivory-50 text-forest-800 hover:bg-sage-100 transition-colors shadow-natural-sm shrink-0 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-botanical" />
            <span>Analyze another photo</span>
          </button>
        </div>

        {/* Primary Diagnosis / Inconclusive Card */}
        <div
          className={`p-5 rounded-2xl border ${
            isCandidateIdentified
              ? 'bg-amber-50/70 border-amber-200/80'
              : 'bg-sage-100/70 border-sage-200'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isCandidateIdentified
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-sage-200 text-forest-800'
              }`}
            >
              {isCandidateIdentified ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">
                  {isCandidateIdentified ? 'Primary Candidate Health Issue' : 'Diagnostic Status'}
                </span>
                {result.confidence ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 text-forest-800 border border-sage-200">
                    Model Confidence: {result.confidence.level.toUpperCase()}
                  </span>
                ) : null}
              </div>

              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-forest-800">
                {isCandidateIdentified ? result.candidateIssue : 'Inconclusive Assessment'}
              </h3>

              <p className="text-xs sm:text-sm text-charcoal leading-relaxed pt-1">
                {result.summary}
              </p>

              {result.confidence?.calibratedExplanation ? (
                <p className="text-[11px] text-charcoal-muted italic pt-1">
                  * Note on confidence: {result.confidence.calibratedExplanation}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* 4-Pillar Separation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Pillar 1: Visible Evidence */}
          <div className="bg-ivory-50/70 rounded-natural-lg border border-sage-200/80 p-5 space-y-3">
            <h4 className="font-editorial text-base font-bold text-forest-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-botanical" />
              <span>1. Visible Evidence in Uploaded Photo</span>
            </h4>
            <p className="text-[11px] text-charcoal-muted">
              Features physically detected in the image pixels:
            </p>
            {result.visibleEvidence.length === 0 ? (
              <p className="text-xs text-charcoal-subtle italic">
                No distinct pathognomonic visual markers isolated.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {result.visibleEvidence.map((ev, i) => (
                  <li
                    key={i}
                    className="p-3 bg-white rounded-xl border border-sage-100 text-xs space-y-1"
                  >
                    <span className="font-semibold text-forest-800 block">
                      • {ev.feature}
                    </span>
                    <span className="text-charcoal leading-relaxed block text-[11px]">
                      {ev.observation}
                    </span>
                    {ev.significance ? (
                      <span className="text-charcoal-muted italic text-[10px] block">
                        Significance: {ev.significance}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pillar 2: Model Hypothesis vs Alternative Explanations */}
          <div className="bg-ivory-50/70 rounded-natural-lg border border-sage-200/80 p-5 space-y-3">
            <h4 className="font-editorial text-base font-bold text-forest-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-botanical" />
              <span>2. Alternative Plausible Causes</span>
            </h4>
            <p className="text-[11px] text-charcoal-muted">
              Competing biotic and environmental explanations that share similar visual symptoms:
            </p>
            {result.alternativeExplanations.length === 0 ? (
              <p className="text-xs text-charcoal-subtle italic">
                No secondary hypotheses identified.
              </p>
            ) : (
              <ul className="space-y-2">
                {result.alternativeExplanations.map((alt, i) => (
                  <li
                    key={i}
                    className="p-2.5 bg-white rounded-xl border border-sage-100 text-xs text-charcoal leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-botanical font-bold shrink-0 mt-0.5">•</span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pillar 3: Uncertainty & Diagnostic Limitations */}
        <div className="p-4 rounded-xl bg-sage-50/80 border border-sage-200/70 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-forest-800">
            <ShieldAlert className="w-4 h-4 text-terracotta" />
            <span>3. Uncertainty & Assessment Limitations</span>
          </div>
          <p className="text-charcoal-muted leading-relaxed text-[11px]">
            To ensure plant safety, aggressive chemical interventions (such as systemic copper fungicides or broad-spectrum insecticides) should never be applied based solely on photographic inspection.
          </p>
          <ul className="list-disc list-inside space-y-1 text-charcoal-muted text-[11px] pt-1">
            {result.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* Pillar 4: Recommended Low-Risk Next Steps */}
        <div className="space-y-3 pt-2">
          <h4 className="font-editorial text-base font-bold text-forest-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-leaf" />
            <span>4. Recommended Low-Risk Next Steps</span>
          </h4>
          <p className="text-xs text-charcoal-muted">
            Gentle, non-destructive actions you can confirm and schedule immediately:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {result.recommendedLowRiskSteps.map((action) => {
              const isScheduled = scheduledActionIds.has(action.id);
              return (
                <div
                  key={action.id}
                  className="p-4 bg-white rounded-xl border border-sage-200/90 shadow-natural-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-forest-800">
                        {action.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-leaf-subtle text-forest-800">
                        Low Risk
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleScheduleTaskClick(action)}
                    disabled={isScheduled}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isScheduled
                        ? 'bg-sage-100 text-charcoal-muted cursor-default'
                        : 'bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-natural-sm'
                    }`}
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-leaf" />
                    <span>{isScheduled ? 'Care task added to Planner' : 'Add to Care Planner'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Observations to Distinguish Causes */}
        {result.additionalObservationsNeeded.length > 0 ? (
          <div className="p-4 rounded-xl bg-ivory-50 border border-sage-200/80 space-y-2 text-xs">
            <p className="font-semibold text-forest-800">
              Further observations that will help confirm the cause:
            </p>
            <ul className="list-disc list-inside space-y-1 text-charcoal-muted text-[11px]">
              {result.additionalObservationsNeeded.map((obs, i) => (
                <li key={i}>{obs}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Integration Actions: Growth Journal */}
        <div className="pt-4 border-t border-sage-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-charcoal-muted">
            <Sprout className="w-4 h-4 text-botanical" />
            <span>Preserve this assessment in your plant history:</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveToJournalClick}
              disabled={hasSavedToJournal}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                hasSavedToJournal
                  ? 'bg-alert-successBg text-alert-success border border-alert-successBorder cursor-default'
                  : 'bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-natural'
              }`}
            >
              <BookOpen className="w-4 h-4 text-leaf" />
              <span>
                {hasSavedToJournal ? 'Recorded in Growth Journal' : 'Record in Growth Journal'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Model & Analysis Metadata (Scientific Transparency) */}
      {result.modelMetadata ? (
        <div className="text-[11px] text-charcoal-subtle flex flex-wrap items-center justify-between gap-2 px-2">
          <span>Model: {result.modelMetadata.modelName} (v{result.modelMetadata.version})</span>
          {result.modelMetadata.inferenceTimeMs ? (
            <span>Inference latency: {result.modelMetadata.inferenceTimeMs}ms</span>
          ) : null}
          <span>Session memory (Client-side verified)</span>
        </div>
      ) : null}
    </div>
  );
};
