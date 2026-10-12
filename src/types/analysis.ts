import { CareTaskType } from './garden';

export type AffectedArea = 'leaves' | 'stems' | 'roots' | 'flowers' | 'whole_plant' | 'other';

export type DiagnosticOutcome =
  | 'candidate_identified'
  | 'inconclusive'
  | 'unsupported_specimen'
  | 'low_quality_image';

export type IssueCategory =
  | 'foliage_disease'
  | 'pest_infestation'
  | 'environmental_stress'
  | 'hydration_imbalance'
  | 'nutrient_deficiency'
  | 'healthy_specimen'
  | 'unknown';

export type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'uncertain';

export interface ConfidenceAssessment {
  score?: number; // e.g. 0.82 (raw score from model if available)
  level: ConfidenceLevel;
  calibratedExplanation: string; // Transparent caveat distinguishing model score from biological certainty
}

export interface VisibleEvidenceItem {
  feature: string;
  observation: string;
  significance?: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  riskLevel: 'low_risk' | 'moderate_risk';
  category: 'hydration' | 'sunlight' | 'isolation' | 'pruning' | 'soil' | 'monitoring';
  suggestedCareTaskType?: CareTaskType;
}

export interface PlantDoctorContext {
  selectedPlantId?: string;
  plantName?: string;
  species: string;
  symptoms: string;
  affectedArea: AffectedArea;
  growingLocation: string;
  recentCareChanges: string;
}

export interface AnalysisRequest {
  imageFile: File;
  imagePreviewUrl?: string;
  context: PlantDoctorContext;
  timestamp: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  outcome: DiagnosticOutcome;
  summary: string;
  candidateIssue?: string;
  issueCategory?: IssueCategory;
  isInconclusive: boolean;
  confidence?: ConfidenceAssessment;
  visibleEvidence: VisibleEvidenceItem[];
  alternativeExplanations: string[];
  recommendedLowRiskSteps: RecommendedAction[];
  additionalObservationsNeeded: string[];
  limitations: string[];
  modelMetadata?: {
    modelName: string;
    version: string;
    inferenceTimeMs?: number;
    endpoint?: string;
  };
  contextUsed: PlantDoctorContext;
}

export interface AnalysisServiceStatus {
  isConfigured: boolean;
  endpointUrl?: string;
  serviceName: string;
  version?: string;
  notes: string;
  modelName?: string;
}

export type PlantDoctorWorkflowStatus =
  | 'idle'
  | 'image_selected'
  | 'analyzing'
  | 'service_unavailable'
  | 'success'
  | 'error';

export interface AnalysisServiceErrorDetails {
  code:
    | 'SERVICE_NOT_CONFIGURED'
    | 'NETWORK_ERROR'
    | 'INVALID_IMAGE'
    | 'TIMEOUT'
    | 'INVALID_RESPONSE'
    | 'SERVER_ERROR'
    | 'UNKNOWN';
  message: string;
  technicalDetails?: string;
}
