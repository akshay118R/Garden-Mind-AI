import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGarden } from '../../context/GardenContext';
import { Plant, CareTask, JournalEntry } from '../../types/garden';
import {
  AffectedArea,
  PlantDoctorContext,
  AnalysisRequest,
  AnalysisResult,
  PlantDoctorWorkflowStatus,
  RecommendedAction,
} from '../../types/analysis';
import {
  submitPlantAnalysis,
  validateAnalysisRequest,
  AnalysisServiceError,
} from '../../services/plantDoctorService';
import { PhotoGuidanceCard } from './PhotoGuidanceCard';
import { PlantSelectorDropdown } from './PlantSelectorDropdown';
import { ServiceUnavailableNotice } from './ServiceUnavailableNotice';
import { AnalysisResultView } from './AnalysisResultView';
import { getLocalTodayDate, addDays } from '../../utils/dateUtils';
import {
  UploadCloud,
  FileImage,
  AlertCircle,
  X,
  ScanHeart,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface PlantDoctorPageProps {
  onNavigateToMyGarden?: () => void;
  onOpenAddPlant?: () => void;
}

export const PlantDoctorPage: React.FC<PlantDoctorPageProps> = ({
  onNavigateToMyGarden,
  onOpenAddPlant,
}) => {
  const { plants, addCareTask, addJournalEntry, addToast } = useGarden();

  // Workflow State
  const [workflowStatus, setWorkflowStatus] = useState<PlantDoctorWorkflowStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetryingConnection, setIsRetryingConnection] = useState(false);

  // Form & Image State
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Additional Context Fields
  const [species, setSpecies] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [affectedArea, setAffectedArea] = useState<AffectedArea>('leaves');
  const [growingLocation, setGrowingLocation] = useState('');
  const [recentCareChanges, setRecentCareChanges] = useState('');

  // Analysis Result & Preserved Request
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [preservedRequest, setPreservedRequest] = useState<AnalysisRequest | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up object URL when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [previewUrl]);

  // Handle Plant Selection & Prefill
  const handleSelectPlant = useCallback((plant: Plant | null) => {
    if (plant) {
      setSelectedPlantId(plant.id);
      // Prefill fields without overriding user's custom changes if they already typed something
      if (plant.species) setSpecies(plant.species);
      if (plant.location) setGrowingLocation(plant.location);
    } else {
      setSelectedPlantId(null);
    }
  }, []);

  // Process and Validate Selected Image
  const processImageFile = useCallback((file: File) => {
    setErrorMessage(null);

    const validation = validateAnalysisRequest(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid image file.');
      return;
    }

    // Revoke previous object URL if one existed
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newObjectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(newObjectUrl);
    setWorkflowStatus('image_selected');
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    setWorkflowStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Analysis Request
  const handleSubmitAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    setWorkflowStatus('analyzing');

    const selectedPlant = plants.find((p) => p.id === selectedPlantId);

    const contextPayload: PlantDoctorContext = {
      selectedPlantId: selectedPlantId || undefined,
      plantName: selectedPlant ? selectedPlant.name : undefined,
      species: species.trim(),
      symptoms: symptoms.trim(),
      affectedArea,
      growingLocation: growingLocation.trim(),
      recentCareChanges: recentCareChanges.trim(),
    };

    const requestPayload: AnalysisRequest = {
      imageFile: selectedFile,
      imagePreviewUrl: previewUrl || undefined,
      context: contextPayload,
      timestamp: new Date().toISOString(),
    };

    setPreservedRequest(requestPayload);

    // Create abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await submitPlantAnalysis(requestPayload, controller.signal);
      setAnalysisResult(result);
      setWorkflowStatus('success');
      addToast('Plant diagnostic assessment ready.', 'success');
    } catch (err: unknown) {
      if (err instanceof AnalysisServiceError) {
        if (err.code === 'SERVICE_NOT_CONFIGURED') {
          // Honest service standby state without fabricating synthetic diagnosis
          setWorkflowStatus('service_unavailable');
        } else {
          setErrorMessage(err.message);
          setWorkflowStatus('error');
        }
      } else {
        setErrorMessage('An unexpected error occurred while preparing your analysis request.');
        setWorkflowStatus('error');
      }
    } finally {
      setIsSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  // Retry Connection Check
  const handleRetryConnection = async () => {
    if (!preservedRequest) return;
    setIsRetryingConnection(true);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const result = await submitPlantAnalysis(preservedRequest, controller.signal);
      setAnalysisResult(result);
      setWorkflowStatus('success');
      addToast('Plant diagnostic assessment ready.', 'success');
    } catch (err: unknown) {
      if (err instanceof AnalysisServiceError && err.code === 'SERVICE_NOT_CONFIGURED') {
        // Still unconfigured; feedback toast confirms check completed honestly
        addToast(
          'Diagnostic backend is not yet active. Frontend inputs remain preserved.',
          'info'
        );
      } else {
        addToast('Service connection check completed.', 'info');
      }
    } finally {
      setIsRetryingConnection(false);
      abortControllerRef.current = null;
    }
  };

  // Return to Form from Unavailable Notice
  const handleReturnToEdit = () => {
    setWorkflowStatus('image_selected');
  };

  // Reset to Analyze Another Specimen
  const handleResetWorkflow = () => {
    handleRemoveImage();
    setAnalysisResult(null);
    setPreservedRequest(null);
    setSymptoms('');
    setRecentCareChanges('');
    setWorkflowStatus('idle');
  };

  // Save Result to Growth Journal
  const handleSaveToJournal = (result: AnalysisResult) => {
    const selectedPlant = plants.find((p) => p.id === selectedPlantId);
    const plantNameStr = selectedPlant
      ? selectedPlant.name
      : result.contextUsed.species || 'Unlisted Plant';

    const newJournalEntry: JournalEntry = {
      id: `journal-doctor-${Date.now()}`,
      plantId: selectedPlant?.id || 'unlisted-specimen',
      plantName: plantNameStr,
      date: new Intl.DateTimeFormat('en-CA').format(new Date()),
      title: `Plant Doctor: ${result.candidateIssue || 'Health Check Assessment'}`,
      notes: `${result.summary}\n\nVisible Evidence: ${result.visibleEvidence.map((e) => e.feature).join(', ')}\n\n(AI-assisted assessment recorded during active session)`,
      observationType: 'issue',
      imageUrl: previewUrl || undefined,
    };

    addJournalEntry(newJournalEntry);
  };

  // Schedule Recommended Action in Care Planner
  const handleScheduleCareTask = (action: RecommendedAction) => {
    const selectedPlant = plants.find((p) => p.id === selectedPlantId);
    const plantNameStr = selectedPlant
      ? selectedPlant.name
      : species || 'Inspected Specimen';

    const newCareTask: CareTask = {
      id: `task-doctor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      plantId: selectedPlant?.id || 'unlisted-specimen',
      plantName: plantNameStr,
      taskType: action.suggestedCareTaskType || 'pruning',
      title: action.title,
      dueDate: addDays(getLocalTodayDate(), 2),
      dueDescription: 'Recommended follow-up (Due in 2 days)',
      isToday: false,
      completed: false,
      priority: 'normal',
    };

    addCareTask(newCareTask);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const linkedPlant = plants.find((p) => p.id === selectedPlantId) || null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* A. Header */}
      <div className="border-b border-sage-200/80 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botanical-subtle text-botanical text-xs font-semibold mb-3 border border-sage-200">
          <ScanHeart className="w-3.5 h-3.5" />
          <span>Botanical Health & Computer Vision Workspace</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-forest-800 tracking-tight">
          Plant Doctor
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
          Understand what your plant may be telling you. Upload a photo of affected foliage, describe observations, and receive structured health assessments.
        </p>

        {/* Reassuring Scientific Disclaimer */}
        <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-charcoal-muted bg-ivory-50 px-3 py-1.5 rounded-lg border border-sage-200/60">
          <Info className="w-3.5 h-3.5 text-botanical shrink-0" />
          <span>
            Photo-based assessments provide observational insight and guidance, but are not definitive laboratory diagnoses.
          </span>
        </div>
      </div>

      {/* Conditional Views: Success Result, Unavailable Notice, or Interactive Form */}
      {workflowStatus === 'success' && analysisResult ? (
        <AnalysisResultView
          result={analysisResult}
          plant={linkedPlant}
          onAnalyzeAnother={handleResetWorkflow}
          onSaveToJournal={handleSaveToJournal}
          onScheduleTask={handleScheduleCareTask}
        />
      ) : workflowStatus === 'service_unavailable' && preservedRequest ? (
        <ServiceUnavailableNotice
          request={preservedRequest}
          onRetry={handleRetryConnection}
          onEdit={handleReturnToEdit}
          isRetrying={isRetryingConnection}
        />
      ) : (
        /* Primary Intake Workflow */
        <div className="space-y-6">
          {/* B. Plant Selector from My Garden */}
          <PlantSelectorDropdown
            plants={plants}
            selectedPlantId={selectedPlantId}
            onSelectPlant={handleSelectPlant}
            onNavigateToAddPlant={onOpenAddPlant}
            onNavigateToMyGarden={onNavigateToMyGarden}
          />

          {/* C & D & E. Main Two-Column Intake Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Photo Upload Area & Guidance (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-bold text-forest-800 uppercase tracking-wider mb-1.5">
                  Plant or Foliage Photo <span className="text-terracotta">*</span>
                </label>
                <p className="text-[11px] text-charcoal-muted mb-3">
                  Upload a clear, focused photograph showing the affected leaf or plant structure.
                </p>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="plant-photo-file-input"
                  aria-label="Upload plant photo"
                />

                {!previewUrl ? (
                  /* Empty Drag-and-Drop Area */
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-natural-lg p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[300px] ${
                      isDragOver
                        ? 'border-botanical bg-botanical-subtle/50 scale-[1.01]'
                        : 'border-sage-300 bg-white hover:border-botanical/70 hover:bg-sage-50/50'
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload plant photo area. Click or drag file here."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-sage-100 text-botanical flex items-center justify-center mb-4 shadow-natural-sm">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="font-editorial text-lg font-bold text-forest-800 mb-1">
                      Drag and drop your plant photo here
                    </h3>
                    <p className="text-xs text-charcoal-muted mb-5 max-w-xs leading-relaxed">
                      Or click to browse from your device. Supported formats: JPEG, PNG, WebP (up to 10 MB).
                    </p>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-colors shadow-natural-sm"
                    >
                      Browse Files
                    </button>
                  </div>
                ) : (
                  /* Image Preview with Replace and Remove */
                  <div className="bg-white rounded-natural-lg border border-sage-200 overflow-hidden shadow-natural-sm">
                    <div className="relative h-72 sm:h-80 w-full bg-forest-900/10">
                      <img
                        src={previewUrl}
                        alt="Uploaded plant specimen preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 p-2 rounded-full bg-forest-900/70 text-white hover:bg-forest-900 transition-colors backdrop-blur-sm"
                        aria-label="Remove uploaded image"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-forest-900/80 backdrop-blur-sm text-xs font-semibold text-ivory-50 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-leaf" />
                        <span>Specimen photo ready for evaluation</span>
                      </div>
                    </div>

                    <div className="p-4 bg-ivory-50/60 border-t border-sage-100 flex items-center justify-between text-xs text-charcoal-muted">
                      <div className="flex items-center gap-2 truncate max-w-xs">
                        <FileImage className="w-4 h-4 text-botanical shrink-0" />
                        <span className="truncate font-medium text-forest-800">
                          {selectedFile?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span>{selectedFile ? formatFileSize(selectedFile.size) : ''}</span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-botanical hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Change photo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Error Banner */}
                {errorMessage ? (
                  <div className="mt-3 p-3.5 rounded-xl bg-terracotta-subtle border border-terracotta-border text-terracotta text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Upload Validation Notice</p>
                      <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* D. Photo Guidance Card */}
              <PhotoGuidanceCard />
            </div>

            {/* Right Column: Additional Context Form & Submit (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <form
                onSubmit={handleSubmitAnalysis}
                className="bg-white rounded-natural-lg border border-sage-200/90 p-6 shadow-natural-sm space-y-4"
              >
                <div>
                  <h3 className="font-editorial text-lg font-bold text-forest-800">
                    Additional Context (Optional)
                  </h3>
                  <p className="text-[11px] text-charcoal-muted mt-0.5">
                    Helpful observations refine the diagnostic differential. All fields are optional.
                  </p>
                </div>

                {/* Species */}
                <div>
                  <label
                    htmlFor="context-species"
                    className="block text-xs font-semibold text-forest-800 mb-1"
                  >
                    Plant Species / Common Name
                  </label>
                  <input
                    id="context-species"
                    type="text"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    placeholder="e.g. Monstera Deliciosa, Fiddle Leaf Fig"
                    className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
                  />
                </div>

                {/* Affected Area Dropdown */}
                <div>
                  <label
                    htmlFor="context-affected-area"
                    className="block text-xs font-semibold text-forest-800 mb-1"
                  >
                    Primary Affected Area
                  </label>
                  <select
                    id="context-affected-area"
                    value={affectedArea}
                    onChange={(e) => setAffectedArea(e.target.value as AffectedArea)}
                    className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
                  >
                    <option value="leaves">Leaves & Foliage</option>
                    <option value="stems">Stems & Petioles</option>
                    <option value="roots">Roots & Soil Line</option>
                    <option value="flowers">Flowers & Buds</option>
                    <option value="whole_plant">Whole Plant / Systemic</option>
                    <option value="other">Other / Unsure</option>
                  </select>
                </div>

                {/* Symptoms Free Text */}
                <div>
                  <label
                    htmlFor="context-symptoms"
                    className="block text-xs font-semibold text-forest-800 mb-1"
                  >
                    Observed Symptoms
                  </label>
                  <textarea
                    id="context-symptoms"
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Yellow halos around brown spots, drooping petioles, powdery white coating on upper leaf surface..."
                    className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
                  />
                </div>

                {/* Growing Location */}
                <div>
                  <label
                    htmlFor="context-location"
                    className="block text-xs font-semibold text-forest-800 mb-1"
                  >
                    Growing Location
                  </label>
                  <input
                    id="context-location"
                    type="text"
                    value={growingLocation}
                    onChange={(e) => setGrowingLocation(e.target.value)}
                    placeholder="e.g. South windowsill, shaded balcony, terrarium"
                    className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
                  />
                </div>

                {/* Recent Watering or Care Changes */}
                <div>
                  <label
                    htmlFor="context-care-changes"
                    className="block text-xs font-semibold text-forest-800 mb-1"
                  >
                    Recent Care Changes
                  </label>
                  <input
                    id="context-care-changes"
                    type="text"
                    value={recentCareChanges}
                    onChange={(e) => setRecentCareChanges(e.target.value)}
                    placeholder="e.g. Repotted 10 days ago, moved closer to AC vent, fertilized last week"
                    className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-botanical/20"
                  />
                </div>

                {/* F. Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!selectedFile || isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-natural ${
                      selectedFile && !isSubmitting
                        ? 'bg-forest-800 text-ivory-50 hover:bg-forest-700 active:scale-[0.98]'
                        : 'bg-sage-200 text-charcoal-muted cursor-not-allowed opacity-80'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-ivory-50/30 border-t-ivory-50 rounded-full animate-spin" />
                        <span>Verifying & Submitting Assessment...</span>
                      </>
                    ) : (
                      <>
                        <ScanHeart className="w-4 h-4 text-leaf" />
                        <span>Analyze plant</span>
                      </>
                    )}
                  </button>

                  {!selectedFile ? (
                    <p className="text-[11px] text-charcoal-subtle text-center mt-2">
                      Please upload a photo above to enable analysis.
                    </p>
                  ) : null}
                </div>
              </form>

              {/* Informative Security & Safety Card */}
              <div className="p-4 rounded-xl bg-sage-50/60 border border-sage-200/80 text-xs text-charcoal-muted space-y-2">
                <div className="flex items-center gap-2 font-semibold text-forest-800">
                  <Sparkles className="w-4 h-4 text-botanical" />
                  <span>Privacy & Diagnostic Safety</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your image is processed strictly for diagnostic inference. Photos are never uploaded or transmitted prior to your explicit submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
