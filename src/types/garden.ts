export type PlantStatus = 'healthy' | 'attention' | 'needs_info';

export type LightRequirement = 'Direct Sun' | 'Bright Indirect' | 'Partial Shade' | 'Low Light';

export interface Plant {
  id: string;
  name: string;
  species?: string;
  category?: string;
  location?: string;
  careStatus: PlantStatus;
  lastWatered?: string;
  nextWateringDays?: number;
  lightRequirement?: LightRequirement;
  wateringFrequencyDays?: number;
  wateringGuidance?: string;
  acquisitionDate?: string;
  notes?: string;
  imageUrl?: string;
  addedDate: string;
}

export type CareTaskType =
  | 'watering'
  | 'sunlight'
  | 'pruning'
  | 'fertilizing'
  | 'repotting'
  | 'pest_inspection'
  | 'general'
  | 'misting';

export type TaskPriority = 'low' | 'medium' | 'high' | 'normal';

export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CareTask {
  id: string;
  plantId?: string;
  plantName?: string;
  taskType: CareTaskType;
  title: string;
  dueDate: string;
  dueTime?: string;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  recurrence?: TaskRecurrence;
  createdAt?: string;
  dueDescription?: string;
  isToday?: boolean;
}

export interface CareSuggestion {
  id: string;
  plantId: string;
  plantName: string;
  taskType: CareTaskType;
  title: string;
  reason: string;
  suggestedDueDate: string;
  priority: TaskPriority;
}

export type JournalObservationType =
  | 'general'
  | 'growth'
  | 'milestone'
  | 'flowering'
  | 'care'
  | 'repotting'
  | 'issue'
  | 'recovery';

export type PlantMood = 'thriving' | 'steady' | 'struggling' | 'dormant';

export interface JournalEntry {
  id: string;
  plantId?: string;
  plantName?: string;
  date: string;
  title: string;
  notes: string;
  observationType: JournalObservationType;
  imageUrl?: string;
  photos?: string[];
  growthMeasurement?: string;
  tags?: string[];
  mood?: PlantMood;
  plantDoctorAssessmentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NavigationTab = 'overview' | 'my-garden' | 'plant-doctor' | 'care-planner' | 'growth-journal';

export type ViewMode = 'grid' | 'list';

export interface DoctorUploadState {
  file: File | null;
  previewUrl: string | null;
  species: string;
  symptoms: string;
  error: string | null;
  isSubmitted: boolean;
  fileSizeFormatted?: string;
}

export interface GardenMetrics {
  totalPlants: number;
  needsAttention: number;
  tasksDueToday: number;
  recentObservations: number;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}
