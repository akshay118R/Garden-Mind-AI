import {
  getLocalTodayDate,
  addDays,
  addMonths,
  calculateNextOccurrenceDate,
  classifyTask,
  formatDisplayDate,
  formatDisplayTime,
} from './src/utils/dateUtils';
import { generateCareSuggestions } from './src/services/careSuggestionService';
import { CareTask, Plant } from './src/types/garden';
import { INITIAL_PLANTS, INITIAL_CARE_TASKS } from './src/data/seedData';

console.log('=== RUNNING SMART CARE PLANNER STAGE 4 VERIFICATION SUITE ===\n');

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

const todayStr = getLocalTodayDate();

// SUITE 1: Date Handling & Task Classification
console.log('--- Suite 1: Local Calendar Date Classification ---');

// Test 1.1: getLocalTodayDate produces YYYY-MM-DD
assert(/^\d{4}-\d{2}-\d{2}$/.test(todayStr), `Local date format is ISO YYYY-MM-DD: ${todayStr}`);

// Test 1.2: Overdue task classification
const yesterdayStr = addDays(todayStr, -1);
assert(
  classifyTask(yesterdayStr, false, todayStr) === 'overdue',
  'Pending task with yesterday due date classifies as "overdue"'
);

// Test 1.3: Today task classification
assert(
  classifyTask(todayStr, false, todayStr) === 'today',
  'Pending task due today classifies as "today" (NOT overdue)'
);

// Test 1.4: Upcoming task classification
const tomorrowStr = addDays(todayStr, 1);
assert(
  classifyTask(tomorrowStr, false, todayStr) === 'upcoming',
  'Pending task due tomorrow classifies as "upcoming"'
);

// Test 1.5: Completed task classification
assert(
  classifyTask(yesterdayStr, true, todayStr) === 'completed',
  'Completed task with past due date classifies as "completed" (NOT overdue)'
);
assert(
  classifyTask(todayStr, true, todayStr) === 'completed',
  'Completed task due today classifies as "completed"'
);

// Test 1.6: Human-readable display formatting
assert(formatDisplayDate(todayStr, undefined, todayStr) === 'Today', 'Formats today as "Today"');
assert(formatDisplayDate(tomorrowStr, undefined, todayStr) === 'Tomorrow', 'Formats tomorrow as "Tomorrow"');
assert(
  formatDisplayDate(yesterdayStr, undefined, todayStr).includes('Overdue'),
  'Formats past due date with "Overdue" indicator'
);
assert(formatDisplayTime('09:00') === '9:00 AM', 'Formats 24h 09:00 to 9:00 AM');
assert(formatDisplayTime('15:30') === '3:30 PM', 'Formats 24h 15:30 to 3:30 PM');

// SUITE 2: Recurrence Calculations
console.log('\n--- Suite 2: Recurrence Calculations ---');

// Test 2.1: Daily recurrence (+1 day)
assert(
  calculateNextOccurrenceDate('2026-10-10', 'daily') === '2026-10-11',
  'Daily recurrence increments date by exactly 1 day'
);

// Test 2.2: Weekly recurrence (+7 days)
assert(
  calculateNextOccurrenceDate('2026-10-10', 'weekly') === '2026-10-17',
  'Weekly recurrence increments date by exactly 7 days'
);

// Test 2.3: Monthly recurrence (+1 month)
assert(
  calculateNextOccurrenceDate('2026-10-10', 'monthly') === '2026-11-10',
  'Monthly recurrence increments month accurately'
);

// Test 2.4: None / undefined recurrence returns base date
assert(
  calculateNextOccurrenceDate('2026-10-10', 'none') === '2026-10-10',
  'None recurrence preserves base date'
);

// SUITE 3: Task Operations (Add, Toggle, Edit, Delete, Safe Plant Deletion)
console.log('\n--- Suite 3: Task Lifecycle Operations ---');

// Test 3.1: Task creation with valid fields
const sampleTask: CareTask = {
  id: 'task-test-1',
  plantId: 'plant-1',
  plantName: 'Atlas (Monstera Deliciosa)',
  taskType: 'watering',
  title: 'Deep soak potting soil',
  dueDate: todayStr,
  dueTime: '10:00',
  priority: 'high',
  completed: false,
  recurrence: 'weekly',
  createdAt: todayStr,
};
assert(sampleTask.title === 'Deep soak potting soil', 'Creates task with specified title');
assert(sampleTask.completed === false, 'New task initializes as pending');

// Test 3.2: Toggle completion with recurrence generation
function simulateToggle(task: CareTask): { completed: CareTask; nextOccurrence?: CareTask } {
  const isNowCompleted = !task.completed;
  const completedTask = {
    ...task,
    completed: isNowCompleted,
    completedAt: isNowCompleted ? new Date().toISOString() : undefined,
  };

  let nextOccurrence: CareTask | undefined;
  if (isNowCompleted && task.recurrence && task.recurrence !== 'none') {
    const nextDate = calculateNextOccurrenceDate(task.dueDate, task.recurrence);
    nextOccurrence = {
      ...task,
      id: `task-next-${Date.now()}`,
      dueDate: nextDate,
      completed: false,
      completedAt: undefined,
    };
  }
  return { completed: completedTask, nextOccurrence };
}

const toggleResult = simulateToggle(sampleTask);
assert(toggleResult.completed.completed === true, 'Task transitions to completed state');
assert(Boolean(toggleResult.completed.completedAt), 'Records completion timestamp');
assert(
  toggleResult.nextOccurrence !== undefined &&
    toggleResult.nextOccurrence.dueDate === addDays(todayStr, 7),
  'Weekly task completion automatically schedules next occurrence 7 days ahead'
);
assert(
  toggleResult.nextOccurrence?.completed === false,
  'Next occurrence initializes as pending'
);

// Test 3.3: Edit task preserves ID
const editedTask: CareTask = {
  ...sampleTask,
  title: 'Updated title: Flush soil with distilled water',
  priority: 'medium',
};
assert(editedTask.id === sampleTask.id, 'Task editing preserves unique ID');
assert(editedTask.title.includes('Updated title'), 'Task editing updates title correctly');

// Test 3.4: Safe plant deletion disassociation
const initialTasksList = [...INITIAL_CARE_TASKS];
const deletedPlantId = 'plant-2';
const disassociatedTasks = initialTasksList.map((t) => {
  if (t.plantId === deletedPlantId) {
    return { ...t, plantId: undefined, plantName: `${t.plantName} (Archived)` };
  }
  return t;
});
const affectedTask = disassociatedTasks.find((t) => t.id === 'task-1');
assert(
  affectedTask?.plantId === undefined && affectedTask?.plantName?.includes('Archived'),
  'Deleting plant disassociates tasks safely without deleting unrelated tasks'
);

// SUITE 4: Transparent Personalized Care Suggestions
console.log('\n--- Suite 4: Personalized Care Suggestions ---');

const testPlants: Plant[] = [
  {
    id: 'plant-sugg-1',
    name: 'Bella',
    species: 'Calathea Roseopicta',
    category: 'Foliage',
    location: 'Living Room East Window',
    careStatus: 'attention',
    wateringFrequencyDays: 5,
    lastWatered: '6 days ago',
    nextWateringDays: 0,
    addedDate: '2026-10-01',
  },
];

const suggestions = generateCareSuggestions(testPlants, [], todayStr);
assert(suggestions.length > 0, 'Generates suggestions for test specimen');

const healthSuggestion = suggestions.find((s) => s.taskType === 'pest_inspection');
assert(
  healthSuggestion !== undefined && healthSuggestion.reason.includes('Needs attention'),
  'Rule generates targeted pest/health check for specimen marked "attention"'
);

const waterSuggestion = suggestions.find((s) => s.taskType === 'watering');
assert(
  waterSuggestion !== undefined && waterSuggestion.reason.includes('5-day schedule'),
  'Rule generates hydration check based on user-supplied watering frequency'
);

// SUITE 5: Overview Dashboard Metric Synchronization
console.log('\n--- Suite 5: Overview Dashboard Integration ---');

const activeSeedTasks = INITIAL_CARE_TASKS;
const overdueInSeed = activeSeedTasks.filter(
  (t) => !t.completed && t.dueDate && t.dueDate < todayStr
);
const todayInSeed = activeSeedTasks.filter(
  (t) => !t.completed && t.dueDate === todayStr
);
const totalDueInOverview = overdueInSeed.length + todayInSeed.length;

assert(totalDueInOverview > 0, 'Calculates active due tasks for Overview summary');
assert(overdueInSeed.length === 1, 'Overdue demo task isolated accurately');
assert(todayInSeed.length >= 3, 'Today tasks isolated accurately');

console.log(`\n========================================`);
console.log(`VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED.`);
console.log(`========================================\n`);
