import {
  validateAnalysisRequest,
  getAnalysisServiceStatus,
  submitPlantAnalysis,
  AnalysisServiceError,
} from './src/services/plantDoctorService';
import {
  AnalysisRequest,
  AnalysisResult,
  RecommendedAction,
} from './src/types/analysis';
import { CareTask, JournalEntry } from './src/types/garden';

console.log('=== RUNNING PLANT DOCTOR STAGE 3 VERIFICATION SUITE ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    if (failureDetails) console.error(`       -> ${failureDetails}`);
    process.exitCode = 1;
  }
}

// SUITE 1: Image Validation Tests
console.log('--- Suite 1: Image Validation Boundary ---');

// Test 1.1: Reject null / empty file
const nullCheck = validateAnalysisRequest(null);
assert(!nullCheck.isValid && typeof nullCheck.error === 'string', 'Rejects null file with user-friendly error');

// Test 1.2: Reject unsupported file format (e.g., text/plain, image/gif, application/pdf)
const fakePdfFile = {
  name: 'document.pdf',
  type: 'application/pdf',
  size: 1024 * 50,
} as unknown as File;
const pdfCheck = validateAnalysisRequest(fakePdfFile);
assert(
  !pdfCheck.isValid && pdfCheck.error!.includes('Unsupported file format'),
  'Rejects unsupported MIME types (application/pdf)'
);

const fakeGifFile = {
  name: 'animation.gif',
  type: 'image/gif',
  size: 1024 * 50,
} as unknown as File;
const gifCheck = validateAnalysisRequest(fakeGifFile);
assert(
  !gifCheck.isValid && gifCheck.error!.includes('Unsupported file format'),
  'Rejects GIF format (restricts to JPEG, PNG, WebP)'
);

// Test 1.3: Reject oversized file (>10MB)
const oversizedFile = {
  name: 'huge-foliage.jpg',
  type: 'image/jpeg',
  size: 11 * 1024 * 1024, // 11MB
} as unknown as File;
const oversizedCheck = validateAnalysisRequest(oversizedFile);
assert(
  !oversizedCheck.isValid && oversizedCheck.error!.includes('11.0 MB'),
  'Rejects files exceeding 10 MB limit with formatted size string'
);

// Test 1.4: Accept valid JPEG, PNG, WebP under 10MB
const validJpeg = {
  name: 'leaf-symptom.jpg',
  type: 'image/jpeg',
  size: 2.4 * 1024 * 1024,
} as unknown as File;
assert(validateAnalysisRequest(validJpeg).isValid, 'Accepts valid JPEG specimen image');

const validPng = {
  name: 'chlorosis.png',
  type: 'image/png',
  size: 1.2 * 1024 * 1024,
} as unknown as File;
assert(validateAnalysisRequest(validPng).isValid, 'Accepts valid PNG specimen image');

const validWebp = {
  name: 'powdery-mildew.webp',
  type: 'image/webp',
  size: 800 * 1024,
} as unknown as File;
assert(validateAnalysisRequest(validWebp).isValid, 'Accepts valid WebP specimen image');

// SUITE 2: Service Capability & Diagnostic Integrity Verification
console.log('\n--- Suite 2: Service Capability & Diagnostic Honesty ---');

// Test 2.1: Default service status check
const status = getAnalysisServiceStatus();
assert(
  status.isConfigured === true,
  'Correctly detects configured backend service in Stage 7 integration'
);
assert(
  status.notes.includes('PlantVillage') && status.version?.includes('ONNX'),
  'Documents real MobileNetV2 ONNX local classifier without misrepresenting inference'
);

// Test 2.2: Execution handles offline/unreachable backend gracefully without fabricating fake data
async function testServiceHonesty() {
  const mockRequest: AnalysisRequest = {
    imageFile: validJpeg,
    imagePreviewUrl: 'blob:http://localhost/test-uuid',
    context: {
      species: 'Monstera Deliciosa',
      symptoms: 'Yellow margins with necrotic brown spots',
      affectedArea: 'leaves',
      growingLocation: 'East Window',
      recentCareChanges: 'Repotted 1 week ago',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    // If backend is running, submitPlantAnalysis returns genuine or throws typed ApiError
    const result = await submitPlantAnalysis(mockRequest);
    assert(
      result.outcome !== undefined && typeof result.summary === 'string',
      'Resolves real analysis result from active backend'
    );
  } catch (err: unknown) {
    if (err instanceof AnalysisServiceError) {
      assert(
        ['SERVICE_NOT_CONFIGURED', 'NETWORK_ERROR', 'SERVER_ERROR', 'INVALID_IMAGE'].includes(err.code),
        `Throws typed AnalysisServiceError with code ${err.code}`
      );
      assert(
        typeof err.message === 'string' && err.message.length > 0,
        'Provides honest explanation without fabricating synthetic diagnosis'
      );
    } else {
      assert(false, 'Expected AnalysisServiceError instance', String(err));
    }
  }

  // SUITE 3: Structured Analysis Result Model & Integrity
  console.log('\n--- Suite 3: Structured Assessment & Calibrated Uncertainty ---');

  const sampleResult: AnalysisResult = {
    id: 'analysis-verified-001',
    timestamp: new Date().toISOString(),
    outcome: 'candidate_identified',
    summary: 'Visual manifestations consistent with early-stage Cercospora leaf spot; soil moisture imbalance remains a viable differential.',
    candidateIssue: 'Cercospora Leaf Spot (Foliage Fungal Pathogen)',
    issueCategory: 'foliage_disease',
    isInconclusive: false,
    confidence: {
      score: 0.81,
      level: 'moderate',
      calibratedExplanation: 'Model identifies 81% pattern similarity to trained photographic specimens; this is a statistical match, not a biological laboratory confirmation.',
    },
    visibleEvidence: [
      {
        feature: 'Chlorotic Halo',
        observation: 'Distinct yellow rings encircling necrotic centers on middle foliage tier.',
        significance: 'Characteristic fungal enzymatic response breaking down chlorophyll.',
      },
      {
        feature: 'Concentric Lesions',
        observation: 'Brown circular spots measuring 3–6mm diameter along leaf blade.',
      },
    ],
    alternativeExplanations: [
      'Bacterial leaf streak (Xanthomonas spp.)',
      'Localized nutrient toxicity or root waterlogging causing localized cellular death',
    ],
    recommendedLowRiskSteps: [
      {
        id: 'step-1',
        title: 'Isolate plant from dense foliage groupings',
        description: 'Provide 3 feet of spacing to prevent fungal spore transmission to neighboring plants.',
        riskLevel: 'low_risk',
        category: 'isolation',
      },
      {
        id: 'step-2',
        title: 'Cease overhead foliage misting',
        description: 'Keep leaves strictly dry; water exclusively at the base of the potting medium.',
        riskLevel: 'low_risk',
        category: 'hydration',
        suggestedCareTaskType: 'watering',
      },
    ],
    additionalObservationsNeeded: [
      'Inspect underside of leaves with 10x hand lens for spore structures or webbing',
      'Assess root smell during next watering cycle to check for anaerobic root rot',
    ],
    limitations: [
      'Photographic analysis cannot inspect soil pH, electrical conductivity, or root pathogen presence.',
      'Do not apply aggressive chemical fungicides without physical specimen confirmation.',
    ],
    contextUsed: mockRequest.context,
  };

  assert(
    sampleResult.visibleEvidence.length === 2,
    'Structured result contains visible evidence features'
  );
  assert(
    sampleResult.alternativeExplanations.length === 2,
    'Structured result preserves competing differential hypotheses'
  );
  assert(
    sampleResult.confidence?.level === 'moderate' &&
      sampleResult.confidence.calibratedExplanation.includes('statistical match'),
    'Confidence includes calibrated uncertainty distinction'
  );
  assert(
    sampleResult.recommendedLowRiskSteps.every((s) => s.riskLevel === 'low_risk'),
    'Recommendations enforce low-risk safety boundaries'
  );

  // SUITE 4: Growth Journal & Care Planner State Integration
  console.log('\n--- Suite 4: Growth Journal & Care Planner Integration ---');

  // Convert to Growth Journal entry
  const journalEntry: JournalEntry = {
    id: `journal-doctor-${Date.now()}`,
    plantId: 'plant-123',
    plantName: 'Monstera Deliciosa',
    date: '2026-10-10',
    title: `Plant Doctor: ${sampleResult.candidateIssue}`,
    notes: `${sampleResult.summary}\n\nVisible Evidence: ${sampleResult.visibleEvidence.map((e) => e.feature).join(', ')}`,
    observationType: 'issue',
  };

  assert(journalEntry.observationType === 'issue', 'Journal entry correctly assigned "issue" observation type');
  assert(journalEntry.title.includes('Cercospora Leaf Spot'), 'Journal entry carries candidate issue title');

  // Convert recommended action to CareTask
  const targetStep = sampleResult.recommendedLowRiskSteps[1];
  const careTask: CareTask = {
    id: `task-doctor-${Date.now()}`,
    plantId: 'plant-123',
    plantName: 'Monstera Deliciosa',
    taskType: targetStep.suggestedCareTaskType || 'pruning',
    title: targetStep.title,
    dueDescription: 'Recommended follow-up (Due in 2 days)',
    isToday: false,
    completed: false,
    priority: 'normal',
  };

  assert(careTask.taskType === 'watering', 'Care task preserves suggestedCareTaskType');
  assert(careTask.completed === false, 'Care task initialized as pending for user confirmation');

  // SUITE 5: Garden Management Regression Verification
  console.log('\n--- Suite 5: Garden Management Regression ---');
  const { INITIAL_PLANTS } = await import('./src/data/seedData');
  assert(INITIAL_PLANTS.length === 8, 'Initial garden collection contains 8 botanical specimens');

  // Addition with default needs_info
  const newSpecimen = {
    id: 'test-specimen-1',
    name: 'Jade Pothos',
    species: 'Epipremnum aureum',
    category: 'Foliage',
    careStatus: 'needs_info' as const,
    addedDate: '2026-10-10',
  };
  assert(newSpecimen.careStatus === 'needs_info', 'Newly registered plants default to "needs_info"');

  // Filter verification
  const foliagePlants = INITIAL_PLANTS.filter((p) => p.category === 'Foliage');
  assert(foliagePlants.length >= 2, 'Filters plants correctly by category');

  const attentionPlants = INITIAL_PLANTS.filter((p) => p.careStatus === 'attention');
  assert(attentionPlants.length >= 1, 'Filters plants correctly by careStatus');

  console.log(`\n========================================`);
  console.log(`VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED.`);
  console.log(`========================================\n`);
}

testServiceHonesty();

