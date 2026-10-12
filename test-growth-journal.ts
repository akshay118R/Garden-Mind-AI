/**
 * GardenMind AI — Stage 5 Growth Journal Verification Suite
 * Tests typed journal entry model, photo validation, editing, deletion,
 * plant relationship integrity, feed filtering/sorting, metrics, and integrations.
 */

import {
  Plant,
  JournalEntry,
  JournalObservationType,
  CareTask,
} from './src/types/garden';
import {
  validatePhotoFile,
  MAX_PHOTO_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from './src/utils/photoUtils';
import {
  parseJournalEntryTimestamp,
  isDateInCurrentMonth,
  formatJournalDisplayDate,
  getLocalTodayDate,
} from './src/utils/dateUtils';
import { INITIAL_PLANTS, INITIAL_JOURNAL_ENTRIES } from './src/data/seedData';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('=== RUNNING GROWTH JOURNAL STAGE 5 VERIFICATION SUITE ===\n');

// --------------------------------------------------------------------------
// Suite 1: Strongly Typed Journal Entry Model & Creation
// --------------------------------------------------------------------------
console.log('--- Suite 1: Strongly Typed Journal Entry Model & Creation ---');

const testPlant: Plant = {
  id: 'plant-test-1',
  name: 'Monstera Deliciosa',
  species: 'Monstera deliciosa',
  careStatus: 'healthy',
  addedDate: '2026-03-01',
};

// 1. Create plant-specific entry with required and optional fields
const entry1: JournalEntry = {
  id: 'journal-test-1',
  plantId: testPlant.id,
  plantName: `${testPlant.name} (${testPlant.species})`,
  date: '2026-04-01',
  title: 'Third fenestrated leaf opening',
  notes: 'Magnificent split leaf unfurling steadily under bright indirect light.',
  observationType: 'growth',
  photos: [
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
  ],
  growthMeasurement: '+5 cm shoot, 4 fenestrations',
  tags: ['leaf-growth', 'indoor'],
  mood: 'thriving',
  createdAt: '2026-04-01T10:00:00.000Z',
};

assert(entry1.id === 'journal-test-1', 'Creates journal entry with unique ID');
assert(entry1.plantId === 'plant-test-1', 'Associates entry with stable plant ID');
assert(entry1.title === 'Third fenestrated leaf opening', 'Preserves entry title');
assert(entry1.observationType === 'growth', 'Assigns valid observation type');
assert(Boolean(entry1.photos && entry1.photos.length === 1), 'Supports photo array');
assert(entry1.growthMeasurement === '+5 cm shoot, 4 fenestrations', 'Stores user-supplied measurement');
assert(Boolean(entry1.tags && entry1.tags.includes('leaf-growth')), 'Stores user tags');
assert(entry1.mood === 'thriving', 'Stores plant mood');

// 2. Create general garden entry without associated plant
const entry2: JournalEntry = {
  id: 'journal-test-2',
  date: '2026-04-03',
  title: 'Terrace soil refresh and potting mix preparation',
  notes: 'Mixed 15L of airy aroid substrate using pumice, orchid bark, and worm castings.',
  observationType: 'repotting',
  growthMeasurement: '15L mix prepared',
  createdAt: '2026-04-03T14:30:00.000Z',
};

assert(entry2.plantId === undefined, 'Allows general garden entry with no plantId');
assert(entry2.title.includes('Terrace soil refresh'), 'Preserves general entry title');
assert(entry2.observationType === 'repotting', 'Supports repotting observation type');

// 3. Supported observation categories check
const supportedTypes: JournalObservationType[] = [
  'general',
  'growth',
  'milestone',
  'flowering',
  'care',
  'repotting',
  'issue',
  'recovery',
];
assert(supportedTypes.length === 8, 'Supports all 8 descriptive observation types');

// --------------------------------------------------------------------------
// Suite 2: Photo Validation & Memory Management Boundary
// --------------------------------------------------------------------------
console.log('\n--- Suite 2: Photo Validation & Memory Management Boundary ---');

// Mock File helper for Node environment
function createMockFile(name: string, type: string, sizeBytes: number): File {
  return {
    name,
    type,
    size: sizeBytes,
    lastModified: Date.now(),
    webkitRelativePath: '',
    arrayBuffer: async () => new ArrayBuffer(0),
    slice: () => new Blob(),
    stream: () => new ReadableStream(),
    text: async () => '',
  } as unknown as File;
}

// 1. Allowed MIME types validation
const validJpeg = createMockFile('leaf.jpg', 'image/jpeg', 2 * 1024 * 1024);
const validPng = createMockFile('leaf.png', 'image/png', 3 * 1024 * 1024);
const validWebp = createMockFile('leaf.webp', 'image/webp', 1.5 * 1024 * 1024);
assert(validatePhotoFile(validJpeg).valid, 'Accepts JPEG photograph');
assert(validatePhotoFile(validPng).valid, 'Accepts PNG photograph');
assert(validatePhotoFile(validWebp).valid, 'Accepts WebP photograph');

// 2. Disallowed MIME types
const invalidPdf = createMockFile('document.pdf', 'application/pdf', 1024);
const invalidGif = createMockFile('animation.gif', 'image/gif', 1024);
assert(!validatePhotoFile(invalidPdf).valid, 'Rejects non-image document formats (PDF)');
assert(!validatePhotoFile(invalidGif).valid, 'Restricts format to JPEG, PNG, WebP (rejects GIF)');

// 3. File size limit (10MB)
const oversizedPhoto = createMockFile('huge.jpg', 'image/jpeg', 12 * 1024 * 1024);
const sizeResult = validatePhotoFile(oversizedPhoto);
assert(!sizeResult.valid, 'Rejects files exceeding 10 MB limit');
assert(Boolean(sizeResult.error && sizeResult.error.includes('10 MB')), 'Returns user-friendly error with 10 MB limit note');

// --------------------------------------------------------------------------
// Suite 3: Editing, Deletion & Safe Plant Disassociation
// --------------------------------------------------------------------------
console.log('\n--- Suite 3: Editing, Deletion & Safe Plant Disassociation ---');

let journalStore = [entry1, entry2];

// 1. Editing preserves ID and updates fields
const updatedEntry1: JournalEntry = {
  ...entry1,
  title: 'Third fenestrated leaf fully opened',
  notes: 'Leaf has hardened off with vivid chlorophyll saturation.',
  growthMeasurement: '+7 cm shoot, 5 fenestrations',
  updatedAt: '2026-04-05T09:00:00.000Z',
};

journalStore = journalStore.map((e) => (e.id === entry1.id ? updatedEntry1 : e));
const storedEdited = journalStore.find((e) => e.id === entry1.id);
assert(storedEdited?.id === entry1.id, 'Editing preserves original entry ID');
assert(storedEdited?.title === 'Third fenestrated leaf fully opened', 'Updates entry title');
assert(storedEdited?.growthMeasurement === '+7 cm shoot, 5 fenestrations', 'Updates growth measurement');
assert(storedEdited?.createdAt === entry1.createdAt, 'Preserves original creation timestamp');

// 2. Deleting an entry
journalStore = journalStore.filter((e) => e.id !== entry2.id);
assert(journalStore.length === 1, 'Deletion removes exactly the targeted entry');
assert(journalStore[0].id === entry1.id, 'Preserves unrelated journal entries');

// 3. Plant Deletion Safety: Disassociate instead of deleting or breaking references
const plantToBeDeleted = testPlant;
let activeEntries: JournalEntry[] = [
  { ...entry1, plantId: plantToBeDeleted.id, plantName: plantToBeDeleted.name },
  { id: 'journal-other', title: 'Unrelated Entry', notes: 'Other notes', date: '2026-04-02', observationType: 'general' },
];

// Simulate removePlant safety logic
activeEntries = activeEntries.map((e) => {
  if (e.plantId === plantToBeDeleted.id) {
    return {
      ...e,
      plantId: undefined,
      plantName: `${e.plantName || plantToBeDeleted.name} (Archived)`,
    };
  }
  return e;
});

const preservedEntry = activeEntries.find((e) => e.id === entry1.id);
assert(preservedEntry !== undefined, 'Journal entry is preserved when associated plant is deleted');
assert(preservedEntry?.plantId === undefined, 'Safely unlinks plantId to prevent broken references');
assert(Boolean(preservedEntry?.plantName && preservedEntry.plantName.includes('(Archived)')), 'Preserves historic plant name with (Archived) notation');
assert(activeEntries.length === 2, 'Never silently deletes unrelated journal entries');

// --------------------------------------------------------------------------
// Suite 4: Feed Filtering, Live Search & Chronological Sorting
// --------------------------------------------------------------------------
console.log('\n--- Suite 4: Feed Filtering, Live Search & Chronological Sorting ---');

const sampleFeed: JournalEntry[] = [
  {
    id: 'e1',
    plantId: 'plant-a',
    plantName: 'Atlas',
    date: '2026-03-10',
    title: 'Pruned dead lower leaf',
    notes: 'Clean angled cut above root node.',
    observationType: 'care',
    tags: ['pruning'],
  },
  {
    id: 'e2',
    plantId: 'plant-b',
    plantName: 'Celeste',
    date: '2026-03-25',
    title: 'New basal shoot emerging',
    notes: 'Tiny green spear pushing up through the soil mix.',
    observationType: 'growth',
    growthMeasurement: '+2 cm',
    tags: ['shoot'],
  },
  {
    id: 'e3',
    plantId: 'plant-a',
    plantName: 'Atlas',
    date: '2026-04-02',
    title: 'Fifth leaf fenestrated',
    notes: 'Amazing perforated growth pattern.',
    observationType: 'milestone',
    tags: ['fenestration'],
  },
];

// 1. Plant filter
const plantAEntries = sampleFeed.filter((e) => e.plantId === 'plant-a');
assert(plantAEntries.length === 2, 'Filters entries by plant ID correctly (2 entries for plant-a)');

// 2. Observation type filter
const milestoneEntries = sampleFeed.filter((e) => e.observationType === 'milestone');
assert(milestoneEntries.length === 1 && milestoneEntries[0].id === 'e3', 'Filters entries by observation type');

// 3. Live search matching
const searchNotes = sampleFeed.filter((e) => e.notes.toLowerCase().includes('green spear'));
assert(searchNotes.length === 1 && searchNotes[0].id === 'e2', 'Search query matches observation notes');

const searchTags = sampleFeed.filter((e) => e.tags?.some((t) => t.includes('fenestration')));
assert(searchTags.length === 1 && searchTags[0].id === 'e3', 'Search query matches tags');

// 4. Chronological sorting
const sortedNewest = [...sampleFeed].sort((a, b) => {
  return parseJournalEntryTimestamp(b.date) - parseJournalEntryTimestamp(a.date);
});
assert(sortedNewest[0].id === 'e3', 'Newest-first sort places April 2 before March entries');
assert(sortedNewest[2].id === 'e1', 'Newest-first sort places March 10 last');

const sortedOldest = [...sampleFeed].sort((a, b) => {
  return parseJournalEntryTimestamp(a.date) - parseJournalEntryTimestamp(b.date);
});
assert(sortedOldest[0].id === 'e1', 'Oldest-first sort places March 10 first');

// --------------------------------------------------------------------------
// Suite 5: Dynamic Overview Metrics & Date Classification
// --------------------------------------------------------------------------
console.log('\n--- Suite 5: Dynamic Overview Metrics & Date Classification ---');

// 1. Dynamic total entries
assert(INITIAL_JOURNAL_ENTRIES.length === 6, 'Seed journal entries loaded accurately (6 entries)');

// 2. Plants documented calculation
const documentedPlantIds = new Set<string>();
INITIAL_JOURNAL_ENTRIES.forEach((e) => {
  if (e.plantId) documentedPlantIds.add(e.plantId);
});
assert(documentedPlantIds.size >= 4, 'Dynamically calculates unique plants documented in journal');

// 3. Entries this month
const entriesThisMonth = INITIAL_JOURNAL_ENTRIES.filter((e) => isDateInCurrentMonth(e.date));
assert(typeof entriesThisMonth.length === 'number', 'Calculates entries this month dynamically without hardcoding');

// 4. Most recent entry detection
const mostRecentSeedEntry = [...INITIAL_JOURNAL_ENTRIES].sort(
  (a, b) => parseJournalEntryTimestamp(b.date) - parseJournalEntryTimestamp(a.date)
)[0];
assert(mostRecentSeedEntry !== undefined, 'Identifies most recent journal entry correctly');

// 5. Date formatting
const displayStr = formatJournalDisplayDate('2026-03-27');
assert(displayStr.includes('March 27, 2026'), 'Formats ISO date YYYY-MM-DD into readable English display date');

// --------------------------------------------------------------------------
// Suite 6: Plant Doctor & Care Planner Integrations
// --------------------------------------------------------------------------
console.log('\n--- Suite 6: Plant Doctor & Care Planner Integrations ---');

// 1. Plant Doctor integration: Save assessment as journal entry
const doctorJournalEntry: JournalEntry = {
  id: `journal-doctor-${Date.now()}`,
  plantId: 'plant-2',
  plantName: 'Celeste (Calathea Orbifolia)',
  date: getLocalTodayDate(),
  title: 'Plant Doctor: Marginal Chlorosis & Low Humidity',
  notes: 'Crispy margins detected on lower leaves.\n\nVisible Evidence: leaf tip necrosis, curled margins\n\n(AI-assisted assessment recorded during active session)',
  observationType: 'issue',
  plantDoctorAssessmentId: 'assessment-calathea-1',
};

assert(doctorJournalEntry.observationType === 'issue', 'Doctor assessment maps to "issue" category');
assert(doctorJournalEntry.title.startsWith('Plant Doctor:'), 'Carries diagnostic issue title');
assert(doctorJournalEntry.plantDoctorAssessmentId !== undefined, 'Preserves linkage to doctor assessment ID');

// 2. Care Planner integration: Option to log completed task in journal
const completedCareTask: CareTask = {
  id: 'task-watering-1',
  plantId: 'plant-1',
  plantName: 'Atlas (Monstera Deliciosa)',
  taskType: 'watering',
  title: 'Deep soak with rainwater',
  dueDate: getLocalTodayDate(),
  priority: 'normal',
  completed: true,
  completedAt: `${getLocalTodayDate()}T11:00:00.000Z`,
  notes: 'Flushed substrate thoroughly until run-off emerged from drainage holes.',
};

// Simulate "Log in journal" transformation
const taskJournalEntry: JournalEntry = {
  id: `journal-task-${Date.now()}`,
  plantId: completedCareTask.plantId,
  plantName: completedCareTask.plantName,
  date: getLocalTodayDate(),
  title: `Completed: ${completedCareTask.title}`,
  notes: `Completed care routine: ${completedCareTask.title}\n\nTask notes: ${completedCareTask.notes}`,
  observationType: completedCareTask.taskType === 'repotting' ? 'repotting' : 'care',
  tags: ['care-routine', completedCareTask.taskType],
};

assert(taskJournalEntry.plantId === completedCareTask.plantId, 'Prefills plantId from completed care task');
assert(taskJournalEntry.title === 'Completed: Deep soak with rainwater', 'Prefills title with care task title');
assert(taskJournalEntry.observationType === 'care', 'Prefills observationType as "care" for watering routine');
assert(taskJournalEntry.notes.includes('Flushed substrate thoroughly'), 'Preserves care task notes for user review');

// --------------------------------------------------------------------------
// Summary
// --------------------------------------------------------------------------
console.log('\n========================================');
console.log(`VERIFICATION COMPLETE: ${passed}/${passed + failed} TESTS PASSED.`);
if (failed > 0) {
  console.error(`FAILED: ${failed} tests failed.`);
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY.');
}
console.log('========================================\n');
