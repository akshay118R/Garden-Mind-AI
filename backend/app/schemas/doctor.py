from typing import List, Optional, Literal
from pydantic import Field
from app.schemas.base import CamelModel


AffectedArea = Literal["leaves", "stems", "roots", "flowers", "whole_plant", "other"]

DiagnosticOutcome = Literal[
    "candidate_identified",
    "inconclusive",
    "unsupported_specimen",
    "low_quality_image",
]

IssueCategory = Literal[
    "foliage_disease",
    "pest_infestation",
    "environmental_stress",
    "hydration_imbalance",
    "nutrient_deficiency",
    "healthy_specimen",
    "unknown",
]

ConfidenceLevel = Literal["high", "moderate", "low", "uncertain"]

RiskLevel = Literal["low_risk", "moderate_risk"]

ActionCategory = Literal[
    "hydration",
    "sunlight",
    "isolation",
    "pruning",
    "soil",
    "monitoring",
]


class ConfidenceAssessment(CamelModel):
    score: Optional[float] = None
    level: ConfidenceLevel = "moderate"
    calibrated_explanation: str


class VisibleEvidenceItem(CamelModel):
    feature: str
    observation: str
    significance: Optional[str] = None


class RecommendedAction(CamelModel):
    id: str
    title: str
    description: str
    risk_level: RiskLevel = "low_risk"
    category: ActionCategory = "monitoring"
    suggested_care_task_type: Optional[str] = None


class PlantDoctorContext(CamelModel):
    selected_plant_id: Optional[str] = None
    plant_name: Optional[str] = None
    species: Optional[str] = None
    symptoms: Optional[str] = None
    affected_area: Optional[AffectedArea] = None
    growing_location: Optional[str] = None
    recent_care_changes: Optional[str] = None


class ModelMetadata(CamelModel):
    model_name: str
    version: str
    inference_time_ms: Optional[float] = None
    endpoint: Optional[str] = None


class AnalysisResultOut(CamelModel):
    id: str
    timestamp: str
    outcome: DiagnosticOutcome
    summary: str
    candidate_issue: Optional[str] = None
    issue_category: IssueCategory = "unknown"
    is_inconclusive: bool = False
    confidence: Optional[ConfidenceAssessment] = None
    visible_evidence: List[VisibleEvidenceItem] = Field(default_factory=list)
    alternative_explanations: List[str] = Field(default_factory=list)
    recommended_low_risk_steps: List[RecommendedAction] = Field(default_factory=list)
    additional_observations_needed: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    model_metadata: Optional[ModelMetadata] = None
    context_used: Optional[PlantDoctorContext] = None


class DoctorStatusOut(CamelModel):
    is_configured: bool
    service_name: str
    version: str
    model_name: str
    active_provider: str
    notes: str
    supported_classes_count: int
