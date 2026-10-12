# GardenMind AI — Project Status

## 1. Project Name & Objective
- **Project Name:** GardenMind AI
- **Tagline:** Grow smarter. Care naturally.
- **Description:** An intelligent botanical companion web application designed to help people monitor plant health, organize indoor and outdoor garden collections, schedule personalized care routines, and track plant growth progress.
- **Current Objective:** Complete the eight-stage roadmap with full-stack verification, on-device ONNX vision AI diagnostics, SQLite relational persistence, and deployment preparation. All eight stages have been developed, integrated, and audited. Authoritative final status is recorded in Section 28 (October 11, 2026).

---

## 2. Current Stage & Status
- **Current Stage:** Pre-Release QA Audit & Validation (Section 28 — Latest Authoritative Audit)
- **Application Implementation:** Verified and operational across all 5 user workflows.
- **Automated Tests:** 153/153 passed tests and checks (100% test pass rate for the executed suite; not a statement/branch code-coverage percentage, as no code coverage percentage has been established; reconciling earlier historical milestone totals of 148/148 in Stage 8 with 5 restart persistence checks added in Section 28).
- **Browser Verification:** Blocked / Pending interactive browser testing. Dev server availability and responsive component layouts were verified via live HTTP requests and source code inspection, but HTTP checks and source code inspection do not equal successful interactive browser testing; automated Playwright testing remains blocked by external CDN driver download failure.
- **Deployment Status:** Prepared (Containerized & Edge blueprints ready); not deployed pending user cloud account setup.
- **Production Readiness:** Pending manual interactive browser testing and cloud deployment provisioning.
- **Date:** October 11, 2026
- **Authoritative Status Summary:** See Section 28 for the latest authoritative audit.
- **Retained System Limitations:** Real-world plant-diagnosis accuracy on field photographs is unbenchmarked (PlantVillage lab conditions domain gap); model softmax scores represent uncalibrated heuristic threshold tiers rather than empirical Bayesian probabilities; unsupported ornamental houseplants default to inconclusive; single-tenant personal scope without authentication or multi-tenant isolation.

---

## 3. Stage 1 History: Prompt 1 — Premium Frontend & Design Foundation

### A. Features Implemented in Stage 1
- **Brand Identity & Botanical Design System:** Named Aesthetic Direction: Botanical Editorial Refinement (DFII Score: 19/19). Colors: Deep Forest Green (`#183D2B`), Botanical Green (`#397653`), Fresh Leaf Accent (`#8EBF78`), Warm Ivory Background (`#F8F7F0`), Soft Sage Surfaces (`#E9EFE4`), Charcoal Typography (`#202B24`), and Terracotta alerts (`#C25E28`).
- **Typography Pairing:** Editorial serif headers (`Playfair Display` / `Georgia`) paired with clean geometric body sans (`Plus Jakarta Sans` / `Inter`).
- **Navigation Shell:** 5 destinations (`Overview`, `My Garden`, `Plant Doctor`, `Care Planner`, `Growth Journal`) with sticky desktop sidebar and responsive mobile drawer/bottom bar.
- **Overview Dashboard:** "Your garden is growing." hero section, demonstration metric cards, initial plant showcase cards, today's care checklist, Plant Doctor spotlight, and growth feed.
- **Initial Screens:** Prototypes of My Garden, Plant Doctor, Care Planner, Growth Journal, and Settings modal.

### B. Files Created in Stage 1
- `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`.
- `src/index.css`, `src/main.tsx`, `src/App.tsx`, `src/types/garden.ts`, `src/data/seedData.ts`.
- `src/components/layout/` (`Sidebar.tsx`, `Header.tsx`, `MobileNav.tsx`).
- `src/components/common/` (`StatusBadge.tsx`, `ImageWithFallback.tsx`, `Modal.tsx`, `BannerDemoNotice.tsx`).
- `src/components/overview/OverviewDashboard.tsx`.
- `src/components/garden/` (`MyGardenPage.tsx`, `AddPlantModal.tsx`, `PlantDetailModal.tsx`).
- `src/components/doctor/PlantDoctorPage.tsx`.
- `src/components/care/` (`CarePlannerPage.tsx`, `AddCareTaskModal.tsx`).
- `src/components/journal/` (`GrowthJournalPage.tsx`, `AddJournalModal.tsx`).
- `src/components/settings/SettingsModal.tsx`.

---

## 4. Stage 2 Progress: Prompt 2 — My Garden & Plant Management

### A. Features Actually Implemented in Stage 2

#### 1. Centralized Shared State Architecture (`GardenContext`)
- **Single Source of Truth:** Built `GardenContext` and `useGarden()` hook managing plants, care tasks, journal entries, view mode, and toasts.
- **Immediate Synchronization:** Adding, editing, or deleting a plant in My Garden instantly updates:
  - The visible collection grid and list in My Garden.
  - The live plant count badge in the page header and sidebar.
  - The total plants, healthy, and attention-needed cards on the Overview dashboard.
  - The curated plant showcase on the Overview dashboard.
  - Any associated scheduled care tasks.

#### 2. Enhanced Plant Domain Model
- Strictly typed `Plant` model supporting optional fields without fabricated defaults:
  - Unique ID.
  - Plant name (required).
  - Species (optional, handles unrecorded species gracefully without broken UI).
  - Category (optional: *Foliage*, *Succulent*, *Flowering*, *Tree*, *Fern*, *Herb & Edible*, *Other*).
  - Location (optional: *Living Room East Window*, *Balcony Courtyard*, etc.).
  - Care status (*Looking healthy*, *Needs attention*, *Care information needed*).
  - Date added and optional acquisition/planting date.
  - Care notes and optional watering guidance.
  - Light requirement and watering frequency in days.
  - Image URL or selected device image reference.

#### 3. Complete My Garden Header & Live Metrics
- Dynamic title: "My Garden" with short botanical description: *"Every plant has its own needs. Keep them thriving."*
- Dynamic plant counter: `{plants.length} Plants` derived strictly from actual collection state.
- Primary "Add a plant" CTA button with icon.

#### 4. Dual View Modes: Grid View & List View
- **View Switcher:** Accessible toggle in My Garden header allowing users to switch between:
  - **Grid View (`PlantCard`):** Photo-rich botanical cards with image fallback, care status badge, category pill, location badge, watering rhythm countdown, light exposure, and quick action buttons (*Details*, *Edit*, *Remove*).
  - **List View (`PlantRow`):** Compact, high-density row format displaying thumbnail, name, species, category, location, care frequency, status badge, and action controls.
- **Responsive Adaptability:** On mobile viewports, the list view adapts into clean compact horizontal cards without horizontal scroll overflow.

#### 5. Search Engine & Multi-Factor Filtering
- **Live Search Field:** Real-time query matching across plant name, species, location, notes, and category.
- **Category & Status Filters:**
  - *All Plants* (displays total count).
  - *Looking healthy* (displays count).
  - *Needs attention* (displays count).
  - *Care info needed* (displays count).
  - *Indoor* & *Outdoor* location grouping.
- **Conjunctive Filtering:** Search queries and status filters work together predictably without overriding each other.
- **Clear Filters Action:** One-click recovery button restoring full collection view.

#### 6. Resilient Empty States
- **No-Results State:** Informative empty state when a search query or filter matches zero plants, showing the active criteria and a "Clear filters" action button.
- **Empty-Garden State:** Welcoming empty state when 0 plants exist in the collection, featuring a prominent "Add your first plant" button that opens the Add Plant modal.

#### 7. Polished Add Plant Workflow (`AddPlantModal`)
- **Field Validation:** Plant name is required and trimmed; prevents empty submissions and duplicate clicks with submission lock.
- **Default Care Status:** Newly added plants default to **"Care information needed"** (`needs_info`), in compliance with product requirements (does not assume new plants are automatically healthy).
- **Image Handling:**
  - File picker accepting JPEG, PNG, and WebP images.
  - Client-side size validation (max 10 MB) with clear error messaging.
  - Live object URL preview with remove/replace action.
  - Memory leak protection via `URL.revokeObjectURL` cleanup on unmount/replacement.
  - Curated botanical photo presets and custom image URL support.
  - Graceful fallback when no image is provided.
- **Automatic Care Routine Creation:** Automatically schedules an initial hydration check for the newly added specimen.
- **Success Notification:** Emits a confirmation toast and closes the form upon creation.

#### 8. Plant Details & Edit Plant Workflow (`PlantDetailModal` & `EditPlantModal`)
- **Plant Details:** Comprehensive modal viewing all recorded botanical metadata, light needs, watering rhythm, acquisition date, and placement notes.
- **Edit Plant Modal:**
  - Pre-populated form to update name, species, category, location, care status, light requirement, watering schedule, watering guidance, notes, and photo.
  - Preserves unique plant ID.
  - Immediately updates collection state and synchronizes names in care tasks and journal entries.
  - Emits success toast upon saving.

#### 9. Safe Plant Deletion (`ConfirmDeleteDialog`)
- **Confirmation Dialog:** Identifies target plant by name and species, explaining that removal will delete the plant and its scheduled care tasks.
- **Cancel Safety:** Leaves plant completely intact and returns to previous view.
- **Safe Execution:** Removes plant from shared collection, cleans up related care tasks, closes details modal, and emits feedback toast.
- **Accessibility:** Accessible focus on Cancel button by default, Escape key dismissal.

#### 10. Toast Feedback System (`ToastContainer`)
- Floating, accessible notification toasts (`aria-live="polite"`) delivering real-time feedback for additions, edits, deletions, and demo resets.

### B. Files Created or Modified in Stage 2
- `src/types/garden.ts`: Added optional fields, `ViewMode`, and `ToastNotification`.
- `src/context/GardenContext.tsx`: Shared React context provider and `useGarden()` hook managing plants, tasks, journal, view mode, and toasts.
- `src/components/common/ToastContainer.tsx`: Floating feedback notifications.
- `src/components/common/ConfirmDeleteDialog.tsx`: Accessible deletion confirmation modal.
- `src/components/garden/PlantCard.tsx`: Reusable grid view card component with status badge and actions.
- `src/components/garden/PlantRow.tsx`: Reusable list view row component with compact layout and actions.
- `src/components/garden/AddPlantModal.tsx`: Updated with full validation, default `needs_info` status, file upload, and object URL cleanup.
- `src/components/garden/EditPlantModal.tsx`: Modal for editing plant details, notes, care status, and imagery.
- `src/components/garden/PlantDetailModal.tsx`: Detail modal displaying all fields with direct Edit and Delete triggers.
- `src/components/garden/MyGardenPage.tsx`: Updated with dynamic count, search, filter tabs, Grid/List toggle, and dual views.
- `src/components/overview/OverviewDashboard.tsx`: Synchronized with shared state, added empty collection state and resilient optional field rendering.
- `src/App.tsx`: Wrapped with `GardenProvider`, centralized modal controllers, and toast rendering.
- `src/data/seedData.ts`: Added categories, acquisition dates, and watering guidance to initial plants.

---

## 5. Stage 3 Progress: Prompt 3 — Plant Doctor AI & Image Upload Experience

### A. Features Actually Implemented in Stage 3

#### 1. End-to-End Plant Doctor Workflow
- **Reassuring Botanical Identity:** Scientific, clear workspace with header title *"Plant Doctor"*, supporting text *"Understand what your plant may be telling you"*, and a prominent caveat clarifying that photo-based assessments provide observational insight rather than definitive laboratory diagnoses.
- **Dynamic Plant Selector (`PlantSelectorDropdown`):**
  - Seamlessly connected to shared `GardenContext` plant state.
  - Allows selecting any saved plant from My Garden, or continuing with *"Unlisted / General specimen"*.
  - Displays selected plant identity badge with thumbnail preview, species, and location.
  - Provides one-click unlinking without modifying stored plant data.
  - Automatically pre-fills species and growing location fields in the diagnostic context form as non-destructive defaults.
  - Resilient empty garden state: when zero plants exist, explains clearly and offers an *"Add plant"* action without blocking photo analysis.

#### 2. Polished Photo Upload & Validation Architecture
- **Drag-and-Drop & File Selection:**
  - Accessible dropzone with visual focus feedback, hover states, and keyboard triggering (Enter/Space).
  - Hidden input accepting `image/jpeg`, `image/png`, and `image/webp`.
  - Client-side MIME validation and file size verification against configurable default limit (10 MB).
  - Clear error feedback banners for unsupported file types (e.g. PDF, GIF) and oversized files with formatted size in MB.
  - Live object URL preview with specimen readiness indicator.
  - User actions to replace or remove the selected image.
  - **Memory Leak Protection:** Explicit cleanup via `URL.revokeObjectURL(url)` on image change, image removal, and component unmount.
  - Submission gate: Analysis submission button disabled until a valid photograph is present.
  - Zero eager uploads: Images are never transmitted or uploaded before explicit submission.

#### 3. Botanical Photography Guidance (`PhotoGuidanceCard`)
- Interactive, expandable guide providing scientific advice:
  - *Natural, diffuse light:* Photograph in bright indirect daylight; avoid direct flash glare.
  - *Sharp, steady focus:* Keep lens 6–10 inches from lesions to capture crisp venation.
  - *Include healthy margin:* Frame the transition boundary between affected and healthy green tissue.
  - *No color filters:* Avoid artificial filters or saturation enhancements that alter chlorosis/necrosis hues.
  - *Diagnostic Caveat:* Reminds users that 2D surface photography cannot inspect root systems, soil pathogen ecology, or microscopic mites.

#### 4. Additional Context Form
- Optional fields that refine the differential without overwhelming the user:
  - *Plant Species / Name:* Free-text with placeholder guidance, auto-prefilled from linked plant.
  - *Primary Affected Area:* Accessible dropdown (*Leaves & Foliage*, *Stems & Petioles*, *Roots & Soil Line*, *Flowers & Buds*, *Whole Plant / Systemic*, *Other / Unsure*).
  - *Observed Symptoms:* Free-text textarea for visible user descriptions.
  - *Growing Location:* Sunlight/room placement details.
  - *Recent Care Changes:* Repotting, watering adjustments, fertilization history.
- Non-destructive decoupling: Editing context fields never modifies or dirties the original plant in My Garden.

#### 5. Analysis Service Integration Boundary (`src/services/plantDoctorService.ts`)
- **Strict Scientific Integrity (Zero Fake AI Diagnoses):**
  - Evaluates live service capability via `getAnalysisServiceStatus()`.
  - When backend is unconfigured (as in Stage 3 ahead of Stage 6 FastAPI integration), **DOES NOT fabricate disease labels, random confidence numbers, or fake machine-learning diagnostics**.
  - Throws typed `AnalysisServiceError('SERVICE_NOT_CONFIGURED', ...)` and presents an honest, informative unavailable notice.
  - Prepares typed `submitPlantAnalysis` boundary supporting `POST /api/v1/diagnose/image` with `FormData`, JSON context serialization, abort signals, and HTTP error handling for seamless Stage 6 hookup.

#### 6. Honest Service Standby Notice (`ServiceUnavailableNotice`)
- Informative standby screen explaining diagnostic integrity standards.
- Preserves all user inputs: attached image (filename, size, type), linked plant, tagged species, symptoms, affected area, and care changes are kept completely intact.
- Provides technical roadmap transparency: identifies the planned FastAPI vision endpoint.
- Interactive actions: *"Return & Edit Details"* and *"Retry Connection Check"* with active checking indicator.

#### 7. Structured Assessment Report View (`AnalysisResultView`)
- Structured, polished result view rendered when a verified response is available:
  - Specimen identity and inspection timestamp.
  - Primary candidate issue banner or *"Inconclusive Assessment"* badge.
  - **4-Pillar Separation:**
    1. *Visible Evidence:* Specific physical markers detected in image pixels (e.g. chlorotic halos, concentric lesions).
    2. *Alternative Explanations:* Competing environmental or biotic differentials.
    3. *Uncertainty & Limitations:* Heuristic distinction between model pattern matching and laboratory certainty (superseding clarification: softmax output scores operate as heuristic threshold tiers, not empirical calibrated probabilities); explicit warning against aggressive chemical interventions based solely on photos.
    4. *Recommended Low-Risk Next Steps:* Safe, non-destructive actions (isolation, hydration hygiene, gentle pruning).
  - Additional observations needed to confirm the hypothesis.
  - Model metadata footer (model name, version, inference latency).

#### 8. Integration with Growth Journal & Care Planner
- **Growth Journal Integration:** Direct *"Record in Growth Journal"* action creates a typed `JournalEntry` with `observationType: 'issue'`, prefilled summary, visible evidence markers, and linked plant name in `GardenContext`.
- **Care Planner Integration:** Each recommended low-risk step includes an *"Add to Care Planner"* action that creates a confirmed `CareTask` in `GardenContext`.
- Emits real-time toast feedback upon recording.

### B. Files Created or Modified in Stage 3
- `src/types/analysis.ts`: Created complete TypeScript definitions for `AnalysisRequest`, `AnalysisResult`, `ConfidenceAssessment`, `VisibleEvidenceItem`, `RecommendedAction`, `PlantDoctorContext`, and error types.
- `src/services/plantDoctorService.ts`: Created typed integration client with capability checker `getAnalysisServiceStatus()`, client-side validation `validateAnalysisRequest()`, and error models.
- `src/components/doctor/PhotoGuidanceCard.tsx`: Expandable photo guidance card with natural lighting, focus, framing tips, and scientific caveat.
- `src/components/doctor/PlantSelectorDropdown.tsx`: Shared-state plant selector with thumbnail preview, unlinking action, and empty garden handling.
- `src/components/doctor/ServiceUnavailableNotice.tsx`: Transparent, honest service standby component preserving user inputs without fake AI scores.
- `src/components/doctor/AnalysisResultView.tsx`: Structured assessment view with 4-pillar separation, Growth Journal recording, and Care Planner scheduling.
- `src/components/doctor/PlantDoctorPage.tsx`: Refactored full page orchestrating intake workflow, drag-and-drop, validation, abort controller, and view states.
- `src/App.tsx`: Wired `onNavigateToMyGarden` and `onOpenAddPlant` navigation callbacks to `PlantDoctorPage`.
- `tsconfig.json`: Added `"types": ["vite/client"]` for strict `import.meta.env` typing.
- `test-doctor.ts`: Automated verification suite covering validation, service honesty, structured results, journal/task conversions, and garden state regressions.

---

## 6. Stage 4 Progress: Prompt 4 — Smart Care Planner & Task Management

### A. Features Actually Implemented in Stage 4

#### 1. Real Local Calendar Date Classification (`src/utils/dateUtils.ts`)
- **Strict Timezone Integrity:** Built `dateUtils.ts` providing local calendar date functions (`getLocalTodayDate()`, `addDays()`, `addMonths()`) based on user's active local timezone (`en-CA` locale format `YYYY-MM-DD`), preventing off-by-one UTC timestamp rollover bugs.
- **Four-Phase Task Classification:**
  - *Overdue:* Pending task with due date prior to today's local date (`dueDate < todayStr && !completed`).
  - *Due Today:* Pending task scheduled for today (`dueDate === todayStr && !completed`).
  - *Upcoming:* Pending task scheduled after today (`dueDate > todayStr && !completed`).
  - *Completed:* Finished task (`completed === true`), regardless of original due date.
- **Human-Friendly Date Labels (`formatDisplayDate`):** Resolves dates to *"Today"*, *"Tomorrow"*, *"Overdue (Yesterday)"*, or formatted short dates with optional 12-hour AM/PM time tags.
- **Header Date Display:** Real user calendar date displayed prominently in the header (e.g. *"Saturday, October 10, 2026"*).

#### 2. Dynamic Real-Time Summary Metrics
- Main screen summary cards calculated strictly from live task state:
  - **Due Today:** Count of pending tasks due on current date.
  - **Overdue:** Count of pending tasks whose due dates have passed; rendered in high-visibility terracotta when > 0.
  - **Upcoming:** Count of pending tasks scheduled for future dates.
  - **Completed Today:** Count of tasks finished during the current calendar date (`completedAt.startsWith(todayStr)`).
- Zero hardcoded figures or static summaries.

#### 3. Multi-View Task Filtering & Category Segmentation
- **Four Core Task Views:**
  - **Today View:** Shows tasks due today and isolates overdue tasks in a dedicated high-priority alert container at the top of the feed.
  - **Upcoming View:** Displays future routines scheduled for the next 7+ days.
  - **All Pending View:** Comprehensive overview of all active, uncompleted care duties.
  - **Completed View:** Historical record of finished routines with completion status badges.
- **Category Segmentation Pills:**
  - Filter by: *All Categories*, *Watering*, *Sunlight*, *Fertilizer*, *Pruning*, *Pest Check*, *Repotting*, and *General Care*.
- Dynamic counts in tab headers updating synchronously with task state.

#### 4. Complete Care Task Lifecycle (Add, Edit, Complete, Delete)
- **Add Care Task Workflow (`AddCareTaskModal`):**
  - Required title validation with whitespace trimming.
  - Category selector with botanical icons.
  - Associated plant selector with optional unassigned option (*General Garden Routine*).
  - Due date picker defaulting to local today, plus optional due time picker.
  - Priority selector (*Low*, *Medium*, *High*).
  - Recurrence rule selector (*Does not repeat*, *Daily*, *Weekly*, *Monthly*).
  - Optional guidance notes.
  - Inline error feedback and submission lock preventing duplicate additions.
- **Task Completion & Recurrence Engine:**
  - Toggle completion checkbox with accessible label.
  - Marks task completed and timestamps `completedAt`.
  - Reopening (undo) resets `completed` to false and clears `completedAt`.
  - **Recurrence Automation:** When completing a recurring task (`daily`, `weekly`, `monthly`), the engine immediately schedules the next single occurrence for its future cycle (+1 day, +7 days, +1 month) while preserving the current completed record in the Completed tab.
- **Edit Care Task Workflow (`EditCareTaskModal`):**
  - Full modal pre-populated with task details.
  - Preserves unique task ID and status.
  - Refreshes all summary counts and views immediately upon save.
- **Safe Task Deletion (`ConfirmDeleteTaskDialog`):**
  - Accessible modal confirming deletion with task title and date.
  - Cancel leaves task intact; Confirm deletes only the target task.

#### 5. Transparent Personalized Care Suggestions (`careSuggestionService.ts`)
- **Botanical Rule Engine:** Derives transparent, non-destructive suggestions based strictly on user-entered plant details:
  - *Hydration Review:* Suggests soil moisture check for plants with target watering frequencies.
  - *Light Orientation:* Suggests quarter-turn rotations for specimens placed near windows or shelves.
  - *Targeted Health Review:* Suggests leaf inspections for specimens flagged as *"Needs attention"*.
  - *Foliage Maintenance:* Suggests dusting and misting for broad-leaf foliage specimens.
- **User-Confirmed & Transparent:** Every suggestion clearly explains its botanical reasoning. Suggestions are **never automatically scheduled**; users explicitly confirm with *"Add to schedule"* or dismiss via *"Dismiss"*.
- Resilient sparse-data state explaining how to receive more suggestions by adding plant care notes.
- Strictly labeled as botanical rule-based suggestions (zero fake AI claims).

#### 6. Safe Plant Deletion Reference Handling
- Deleting a plant in My Garden safely disassociates its care tasks (`plantId = undefined`, `plantName = 'Plant Name (Archived)'`) rather than breaking foreign references or silently deleting unrelated tasks.

#### 7. Overview Dashboard Full Synchronization
- Connects Overview page's "Care Tasks Due" metric and "Today's Care" interactive checklist directly to the shared `GardenContext` state.
- Real-time today's pending count accurately includes overdue tasks.
- Overdue tasks on Overview carry an inline high-visibility badge.
- Completing a task on the Overview checklist updates the Care Planner and vice versa.
- Dynamically resolves plant names through the shared `plants` state.

#### 8. Notifications & Reminders Transparency
- Operates purely through in-app visual indicators and floating toast notifications.
- No false claims of browser push notifications, SMS, or email delivery.

---

## 7. Files Created or Modified in Stage 4

### Types, Utils, & Services
- [`src/types/garden.ts`](src/types/garden.ts): Enhanced `CareTask` with `dueDate`, `dueTime`, `priority`, `recurrence`, `notes`, `createdAt`; added `CareSuggestion`, `TaskPriority`, `TaskRecurrence`.
- [`src/utils/dateUtils.ts`](src/utils/dateUtils.ts): Created date utilities for local timezone formatting, recurrence date calculation, date classification, and 12-hour display.
- [`src/services/careSuggestionService.ts`](src/services/careSuggestionService.ts): Created botanical rule-based care suggestion generator with transparent reasoning.

### Components
- [`src/components/care/TaskItem.tsx`](src/components/care/TaskItem.tsx): Reusable task card with completion toggle, category icon, recurrence badge, overdue styling, and edit/delete actions.
- [`src/components/care/AddCareTaskModal.tsx`](src/components/care/AddCareTaskModal.tsx): Updated modal with field validation, date picker, category grid, recurrence, and plant association.
- [`src/components/care/EditCareTaskModal.tsx`](src/components/care/EditCareTaskModal.tsx): Modal for editing existing task title, category, date, priority, recurrence, and notes.
- [`src/components/care/ConfirmDeleteTaskDialog.tsx`](src/components/care/ConfirmDeleteTaskDialog.tsx): Accessible deletion confirmation modal.
- [`src/components/care/CareSuggestionsSection.tsx`](src/components/care/CareSuggestionsSection.tsx): Suggestions card section with transparent reasons and user confirmation.
- [`src/components/care/CarePlannerPage.tsx`](src/components/care/CarePlannerPage.tsx): Updated page with header date, live summary metrics, 4 view tabs, overdue distinction, and modals.
- [`src/components/overview/OverviewDashboard.tsx`](src/components/overview/OverviewDashboard.tsx): Synchronized with date-based task classification, overdue tasks, and dynamic plant name resolution.
- [`src/components/doctor/PlantDoctorPage.tsx`](src/components/doctor/PlantDoctorPage.tsx): Supplied `dueDate` to scheduled care task creation.

### State & Seed Data
- [`src/context/GardenContext.tsx`](src/context/GardenContext.tsx): Added `updateCareTask`, `removeCareTask`, automated recurrence generation in `toggleCareTask`, and safe plant disassociation.
- [`src/data/seedData.ts`](src/data/seedData.ts): Dynamic local due dates, overdue demo task, and completed demo task.

### Testing
- [`test-care-planner.ts`](test-care-planner.ts): Comprehensive Stage 4 test suite validating date classification, recurrence, editing, safe disassociation, and suggestions.

---

## 8. Dependencies Added in Stage 4
- **None.** No external packages or heavyweight state libraries were introduced. All functionality was built cleanly with native React 18, standard `Intl.DateTimeFormat`, and Tailwind CSS.

---

## 9. Commands Needed to Install and Run on Windows

```powershell
# 1. Install dependencies
npm install

# 2. Start the local development server (running at http://127.0.0.1:5173/)
npm run dev

# 3. Run TypeScript type-check and linter (0 errors, 0 warnings)
npm run lint

# 4. Compile production build
npm run build

# 5. Run Stage 4 automated test suite
npx -y tsx test-care-planner.ts

# 6. Run Stage 3 regression suite
npx -y tsx test-doctor.ts
```

---

## 10. Tests and Verification Actually Performed in Stage 4

1. **TypeScript Linting (`npm run lint`):**
   - Executed `tsc --noEmit`.
   - **Result: PASSED** (0 errors, 0 warnings).
2. **Production Bundle Compilation (`npm run build`):**
   - Executed `tsc -b && vite build`.
   - **Result: PASSED** (1616 modules transformed, built in 2.86s).
3. **Local HTTP Server Verification:**
   - Dev server running at `http://127.0.0.1:5173/`.
   - Probed via `curl.exe -I http://127.0.0.1:5173/`: returned `HTTP/1.1 200 OK`.
   - Probed transformed modules (`/src/components/care/CarePlannerPage.tsx`): returned `HTTP/1.1 200 OK`.
4. **Automated Stage 4 Test Suite (`test-care-planner.ts` via `tsx`):**
   - **Suite 1: Local Calendar Date Classification:**
     - Verified `getLocalTodayDate()` format `YYYY-MM-DD`.
     - Verified pending task with past date classifies as `overdue`.
     - Verified pending task due today classifies as `today` (not overdue).
     - Verified pending task with future date classifies as `upcoming`.
     - Verified completed tasks classify as `completed` (never overdue).
     - Verified human-friendly display formatting ("Today", "Tomorrow", "Yesterday (Overdue)").
     - Verified 24h to 12h AM/PM time formatting.
   - **Suite 2: Recurrence Calculations:**
     - Verified daily recurrence (+1 day).
     - Verified weekly recurrence (+7 days).
     - Verified monthly recurrence (+1 month).
     - Verified none recurrence preserves base date.
   - **Suite 3: Task Lifecycle Operations:**
     - Verified task creation and pending initialization.
     - Verified task completion and `completedAt` timestamp.
     - Verified weekly recurring task creates next occurrence 7 days ahead as pending.
     - Verified task editing preserves ID and updates fields.
     - Verified deleting plant disassociates tasks safely without deleting unrelated tasks.
   - **Suite 4: Personalized Care Suggestions:**
     - Verified targeted pest/health check generated for plant with `careStatus: 'attention'`.
     - Verified hydration check generated based on user-supplied watering frequency.
   - **Suite 5: Overview Dashboard Integration:**
     - Verified active due tasks calculation for Overview summary.
     - Verified overdue demo task and today's tasks isolation.
   - **Result: ALL 30/30 TESTS PASSED.**
5. **Stage 3 Plant Doctor Regression Suite (`test-doctor.ts` via `tsx`):**
   - **Result: ALL 23/23 TESTS PASSED.**

---

## 11. Known Bugs, Limitations, and Unfinished Features
- **Client Session State:** Added and edited tasks persist in React Context memory for the active browser session. Full page reload restores initial seed data until SQLite/PostgreSQL persistence is connected in Stage 6.
- **FastAPI Backend:** The backend API and database persistence (FastAPI, SQLite/PostgreSQL) remain future work.
- **Notifications:** Notifications are visual in-app badges and toasts; browser push notifications and email reminders are not yet implemented.

---

## 12. Confirmation of State, Recurrence, and Notifications Status
- **Data Persistence:** Task data is stored in frontend session memory (`GardenContext`).
- **Recurrence Engine:** Simple recurrence (`daily`, `weekly`, `monthly`) is fully implemented and verified. Completing a recurring task automatically schedules the next single occurrence while preserving history.
- **Notification Reality:** Confirmed that push notifications, email, and SMS are NOT active. The interface displays in-app feedback only.

---

## 13. Stage 4 Completion Summary
- **Stage 4 Status:** Smart Care Planner & Task Management complete & verified.
- **Stage 4 Test Results:** 30/30 tests passed (`test-care-planner.ts`).
- **Care Suggestions & Recurrence:** Verified active in frontend state.

---

## 14. Stage 5 Progress: Prompt 5 — Growth Journal & Plant Progress Tracking

### A. Features Actually Implemented in Stage 5

#### 1. Strongly Typed Botanical Journal Entry Model
- **Comprehensive Domain Model (`JournalEntry`):**
  - Unique entry ID (`id: string`).
  - Optional associated plant ID (`plantId?: string`) and plant name (`plantName?: string`), cleanly supporting both plant-specific and general garden-wide observations.
  - Entry date (`date: string`) with flexible ISO YYYY-MM-DD parsing and English display formatting.
  - Required headline (`title: string`) and detailed observation notes (`notes: string`).
  - 8 distinct, descriptive observation categories (`observationType: JournalObservationType`):
    - `general` (General Observation)
    - `growth` (New Growth / Shoot emergence)
    - `milestone` (Botanical Milestone / Fenestration)
    - `flowering` (Floral bracts, buds, blooming)
    - `care` (Watering, feeding, dusting, flushing)
    - `repotting` (Substrate refresh, root trim, container upgrade)
    - `issue` (Health Concern / Leaf yellowing / Pests)
    - `recovery` (Recovery Progress / Rejuvenation)
  - Multi-photo attachment array (`photos?: string[]`) with legacy single image fallback (`imageUrl?: string`).
  - User-recorded dimensions (`growthMeasurement?: string`), e.g., "+12 cm shoot, 5 splits".
  - Tags array (`tags?: string[]`) for taxonomy and live keyword filtering.
  - Plant vitality status / mood (`mood?: PlantMood`): *Thriving*, *Steady*, *Struggling*, *Dormant*.
  - Assessment linkage (`plantDoctorAssessmentId?: string`) linking records to genuine Plant Doctor checks.
  - Timestamps (`createdAt?: string`, `updatedAt?: string`).

#### 2. Growth Journal Main Feed & Dynamic Overview Metrics (`GrowthJournalPage`)
- **Header:** Title *"Growth Journal"*, supporting subtitle *"Capture the little changes that help your garden grow."*, and dynamic activity summary displaying total entries and latest entry timestamp.
- **Dynamic Metric Cards (Calculated from Real State, Never Hardcoded):**
  - *Total Entries:* Count of all journal records currently in memory.
  - *Plants Documented:* Count of unique plants with at least one journal entry.
  - *This Month:* Count of entries recorded in the current calendar month (`isDateInCurrentMonth`).
  - *Most Recent:* Dynamically resolves latest updated observation and its date.
- **Visual Timeline Feed:**
  - Responsive chronological cards with botanical styling, hover elevation, and plant links.
  - Category badges with distinct botanical color tokens.
  - Photo thumbnail strip previewing up to 4 images with a `+N more` counter.
  - Measurement callouts displaying honest user metrics.
  - Hashtag pill displays.
  - Quick "View details" action.

#### 3. Live Search Engine, Multi-Factor Filtering & Sorting
- **Real-Time Search Field:** Live query evaluation across entry title, observation notes, plant name, user tags, and measurement text.
- **Plant Filter Dropdown:** Filter by any individual plant in the collection, or isolate general garden entries.
- **Observation Category Filter:** Filter by any of the 8 botanical observation categories.
- **Sort Switcher:** Toggle between *Newest first* (default) and *Oldest first* based on parsed calendar timestamps (`parseJournalEntryTimestamp`).
- **Resilient Empty States:**
  - Empty garden journal: welcoming onboarding state with a *"New journal entry"* CTA.
  - Zero search/filter results: informative empty state with a *"Reset all filters"* button.

#### 4. Growth Progress & Visual Archive (`GrowthProgressSection`)
- **Chronological Photo Strip:** Visual photo gallery of every photo attached to journal entries with overlay title, date, and specimen tag.
- **User-Recorded Measurements Log:** Filtered grid of all dimension records with dates and units (e.g., "+12 cm shoot, 5 splits", "Ambient humidity steady at 65%").
- **Honest Data Presentation:** Strictly displays recorded user numbers without fabricated trendlines, simulated growth curves, or unsupported AI health predictions.

#### 5. Photo Attachment & Memory Safety Architecture (`photoUtils.ts`)
- **Format Validation:** Restricts uploads to standard web image formats: JPEG (`image/jpeg`), PNG (`image/png`), and WebP (`image/webp`). Rejects non-image documents (PDF) and animated formats (GIF).
- **Size Validation:** Enforces a configurable 10 MB per-file limit (`MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024`).
- **Preview & Removal:** Generates client-side object URLs with live thumbnail previews and remove actions.
- **Memory Leak Protection:** Proactively revokes object URLs via `URL.revokeObjectURL` upon photo removal, form cancellation, and component unmount.
- **Honest Session Disclosure:** Prominently explains in the UI that photos are stored in local frontend session memory and do not upload to a remote server.

#### 6. Complete Entry Creation Workflow (`AddJournalModal`)
- Required fields: Title, observation notes, date (defaulted to local calendar date via `getLocalTodayDate()`, editable for historical records), and category.
- Optional fields: Associated plant selector (allows unlinked general garden entries), multi-photo file picker, tags, measurements, and vitality mood.
- Field-level validation with clear error messaging and disabled submit state during processing.
- Cancel safety cleans up unsaved blob URLs without saving. Form resets only upon successful creation.

#### 7. Full Entry Inspection & Photo Lightbox (`JournalDetailModal`)
- Detailed modal displaying full observation notes, associated plant badge, date, category badge, vitality mood, measurement callouts, tags, and timestamps.
- **Photo Inspection Lightbox:** Clicking any photo opens an enlarged high-resolution view with keyboard Escape dismissal and click-outside close behavior.
- Direct triggers to Edit Entry or Delete Entry.

#### 8. Edit Entry Workflow (`EditJournalModal`)
- Pre-populates all existing form fields.
- Preserves unique entry ID, `createdAt` timestamp, and existing photos unless explicitly removed.
- Validates edits and updates shared state immediately, reflecting changes across feeds and summaries.

#### 9. Safe Deletion Workflow (`ConfirmDeleteJournalDialog`)
- Modal asking for explicit confirmation, displaying target entry title and date.
- Cancel preserves the entry completely.
- Confirm removes only the intended entry from shared state, closes details modal, and updates counters immediately.

#### 10. Plant-Specific Growth History Integration (`PlantDetailModal`)
- Integrated *"Growth History & Journal"* timeline into the existing `PlantDetailModal`.
- Filters shared journal entries for the selected plant, sorted chronologically newest-first.
- Displays entry dates, category badges, observation text previews, measurements, and photo thumbnails.
- Inline *"Record entry"* action pre-populates `AddJournalModal` with the selected plant's ID.
- Helpful empty state when a specimen has no recorded entries: *"Create first entry for [Plant Name]"*.

#### 11. State Integrity & Plant Deletion Safety (`GardenContext`)
- **Safe Plant Removal:** When a plant is deleted, associated journal entries are NOT deleted or corrupted; they are safely disassociated (`plantId: undefined`, `plantName: "[Plant Name] (Archived)"`), ensuring historical journal logs remain intact without broken references.
- **Plant Renaming Synchronization:** Renaming a plant in My Garden automatically updates associated journal entries while preserving entries without plants.
- Shared single source of truth across Growth Journal, My Garden, Overview, and Care Planner.

#### 12. Cross-Feature Integrations
- **Plant Doctor Integration:** Plant Doctor analysis results can be saved to the journal with `observationType: 'issue'`, preserving evidence features and candidate diagnoses as observational session notes.
- **Care Planner Integration:** Completed tasks in Care Planner include a *"Record observation in Growth Journal"* action that pre-fills `AddJournalModal` with the plant, type `care`, and task notes for user review before saving.

---

## 15. Files Created or Modified in Stage 5

### A. New Files Created
1. `src/utils/photoUtils.ts`: Photo validation (max 10 MB, JPEG/PNG/WebP), object URL creation, and `URL.revokeObjectURL` cleanup utilities.
2. `src/components/journal/EditJournalModal.tsx`: Interactive modal for editing existing observations while preserving IDs and photos.
3. `src/components/journal/JournalDetailModal.tsx`: Comprehensive modal for viewing full observations, tags, measurements, and lightbox photo inspections.
4. `src/components/journal/ConfirmDeleteJournalDialog.tsx`: Accessible deletion confirmation modal with cancel safety.
5. `src/components/journal/GrowthProgressSection.tsx`: Photo strip gallery and user-recorded measurements review component.
6. `test-growth-journal.ts`: Automated 48-assertion verification suite covering data models, validation, lifecycle, feed filters, and integrations.

### B. Files Modified
1. `src/types/garden.ts`: Expanded `JournalObservationType` to 8 categories; updated `JournalEntry` with optional `plantId`/`plantName`, `photos` array, `tags`, `mood`, `plantDoctorAssessmentId`, and timestamps.
2. `src/utils/dateUtils.ts`: Added `parseJournalEntryTimestamp`, `isDateInCurrentMonth`, and `formatJournalDisplayDate` helpers.
3. `src/data/seedData.ts`: Enriched `INITIAL_JOURNAL_ENTRIES` with ISO dates, photo arrays, tags, measurements, mood, flowering, and repotting records.
4. `src/context/GardenContext.tsx`: Added `updateJournalEntry` and `removeJournalEntry`; updated `removePlant` to safely disassociate journal entries without deleting them.
5. `src/components/journal/AddJournalModal.tsx`: Rebuilt with multi-photo attachment, local date picker, 8 category options, tags, measurements, and object URL cleanup.
6. `src/components/journal/GrowthJournalPage.tsx`: Rebuilt with dynamic header metrics, Growth Progress section, search field, plant filter, category filter, sort toggle, and visual timeline feed.
7. `src/components/garden/PlantDetailModal.tsx`: Embedded plant-specific growth history timeline and *"Record entry"* shortcut.
8. `src/components/care/TaskItem.tsx`: Added *"Record observation in Growth Journal"* action for completed care routines.
9. `src/components/care/CarePlannerPage.tsx`: Connected journal logging trigger from completed tasks to `AddJournalModal`.
10. `src/components/overview/OverviewDashboard.tsx`: Added graceful fallback for optional `plantName` in recent growth feed.
11. `src/App.tsx`: Wired journal modal controllers, details modal, edit modal, delete dialog, and state synchronization.

---

## 16. Dependencies Added in Stage 5
- **No external dependencies added:** Built completely using React, TypeScript, Tailwind CSS, Lucide icons, and browser native APIs (`URL.createObjectURL`, `URL.revokeObjectURL`). Zero bloat, zero heavy charting libraries.

---

## 17. Windows Commands for Running and Testing

```powershell
# 1. Install dependencies (if needed)
npm install

# 2. Run local development server
npm run dev

# 3. Execute TypeScript check
npm run lint

# 4. Compile production build
npm run build

# 5. Run Stage 5 Growth Journal automated test suite
npx -y tsx test-growth-journal.ts

# 6. Run Stage 4 Care Planner test suite (regression verification)
npx -y tsx test-care-planner.ts

# 7. Run Stage 3 Plant Doctor test suite (regression verification)
npx -y tsx test-doctor.ts
```

---

## 18. Tests and Verification Actually Performed in Stage 5

1. **TypeScript Linting (`npm run lint`):**
   - Executed `tsc --noEmit`.
   - **Result: PASSED** (0 errors, 0 warnings).
2. **Production Bundle Compilation (`npm run build`):**
   - Executed `tsc -b && vite build`.
   - **Result: PASSED** (1621 modules transformed, built in 3.57s).
3. **Local HTTP Server Verification:**
   - Dev server running at `http://127.0.0.1:5173/`.
   - Probed via `curl.exe -I http://127.0.0.1:5173/`: returned `HTTP/1.1 200 OK`.
   - Probed transformed module `/src/components/journal/GrowthJournalPage.tsx`: returned `HTTP/1.1 200 OK`.
4. **Automated Stage 5 Test Suite (`test-growth-journal.ts` via `tsx`):**
   - **Suite 1: Strongly Typed Journal Entry Model & Creation:**
     - Verified entry creation with unique ID, stable plant ID, title, and valid observation type.
     - Verified photo array, user-supplied measurements, user tags, and plant vitality mood.
     - Verified general garden entry creation with no plantId.
     - Verified all 8 descriptive observation categories.
   - **Suite 2: Photo Validation & Memory Management Boundary:**
     - Verified acceptance of JPEG, PNG, and WebP photographs.
     - Verified rejection of non-image document formats (PDF) and unsupported types (GIF).
     - Verified rejection of files exceeding 10 MB limit with clear error messaging.
   - **Suite 3: Editing, Deletion & Safe Plant Disassociation:**
     - Verified editing preserves unique ID, updates title/measurements, and preserves `createdAt`.
     - Verified deletion removes only the targeted entry while preserving unrelated entries.
     - Verified deleting a plant disassociates journal entries safely (`plantId: undefined`, `plantName: "... (Archived)"`), never silently deleting records or leaving broken references.
   - **Suite 4: Feed Filtering, Live Search & Chronological Sorting:**
     - Verified filtering entries by plant ID.
     - Verified filtering entries by observation type.
     - Verified live search matching in title, observation notes, and tags.
     - Verified chronological sorting: newest-first places April 2 before March entries; oldest-first places March 10 first.
   - **Suite 5: Dynamic Overview Metrics & Date Classification:**
     - Verified seed journal entries load dynamically (6 entries).
     - Verified unique plants documented count calculated dynamically.
     - Verified entries this month calculated dynamically against current month.
     - Verified detection of most recent journal entry.
     - Verified English display date formatting from ISO strings.
   - **Suite 6: Plant Doctor & Care Planner Integrations:**
     - Verified saving Plant Doctor assessment to journal with type `issue` and candidate title.
     - Verified pre-filling journal entry from completed care task with plant ID, type `care`, and task notes.
   - **Result: ALL 48/48 TESTS PASSED.**
5. **Stage 4 Smart Care Planner Regression Suite (`test-care-planner.ts` via `tsx`):**
   - **Result: ALL 30/30 TESTS PASSED.**
6. **Stage 3 Plant Doctor Regression Suite (`test-doctor.ts` via `tsx`):**
   - **Result: ALL 23/23 TESTS PASSED.**
7. **Browser Automation Status:**
   - Attempted browser subagent verification via `open_browser_url`. Failed due to Playwright CDN 404 driver download issue (`playwright-1.57.0-win32_x64.zip` returned 404 from Azure CDN). Local dev server HTTP endpoints and client bundle compilation verified directly.

---

## 19. Known Bugs, Limitations, and Unfinished Features
- **Client Session State:** Journal entries and object URL photos persist in React Context memory for the active browser session. Full page reload restores initial seed data until SQLite/PostgreSQL persistence is connected in Stage 6.
- **Photo Storage Reality:** Photographs attached via file input are held as browser object URLs in memory; they are not uploaded to a remote file server or persistent blob store until backend file handling is added in Stage 6.
- **FastAPI Backend:** The backend API and persistent database layer remain future work in Stage 6.

---

## 20. Confirmation of State, Photos, and Integrations Status
- **Journal State Persistence:** Stored in frontend session memory (`GardenContext`).
- **Photo Persistence Reality:** Verified that photos do NOT persist across full page refresh. Explicitly disclosed in the UI.
- **Plant Doctor Integration:** Functional. Allows saving genuine assessments as journal entries with heuristic uncertainty tiers (superseding clarification: threshold score tiers, not empirical calibrated probabilities). Zero fake AI results.
- **Care Planner Integration:** Functional. Allows logging completed care routines into the Growth Journal with prefilled plant and notes.

---

---

## 21. Stage 6 History: Prompt 6 — Real Backend, FastAPI, SQLite & Persistent Data

### A. Executive Summary
In Stage 6, GardenMind AI was transitioned from a frontend-only state model into a full-stack, enterprise-grade architecture powered by a Python FastAPI backend and a persistent SQLite database. All plant records, smart care planner tasks, growth journal entries, and multipart photo uploads are now persisted directly to disk and served via versioned REST APIs (`/api/v1`). Deleting specimens follows an intentional relationship safety contract: related care tasks and historical growth observations are never broken or cascade-deleted; instead, they are cleanly disassociated and labeled with `(Archived)` history.

### B. Architecture Actually Implemented
- **Backend Architecture:**
  - **Framework:** Python 3.14 + FastAPI with asynchronous lifespan management.
  - **ORM & Database:** SQLAlchemy 2.x with project-local SQLite engine (`backend/data/gardenmind.db`), configurable via `DATABASE_URL`.
  - **Data Modeling & Validation:** Pydantic v2 schemas with `alias_generators.to_camel` and `populate_by_name=True` ensuring seamless bidirectional camelCase serialization matching React TypeScript domain interfaces without ad-hoc translation layers.
  - **File Storage:** Local filesystem storage at `backend/data/uploads/` with sanitized UUID naming, MIME validation (JPEG, PNG, WebP), 10 MB per-file enforcement, path traversal defense, and secure static retrieval endpoints.
  - **CORS Middleware:** Configured with origins (`http://127.0.0.1:5173`, `http://localhost:5173`), explicit allowed methods and headers, without wildcard credentials.
  - **Database Seeding:** Idempotent database initialization preserving existing user records on startup while populating the 8 core botanical specimens, 5 care tasks, and 6 journal entries if the database is uninitialized.
- **Frontend Integration Architecture:**
  - **Centralized API Client (`apiClient.ts`):** Fetch wrapper reading `VITE_API_BASE_URL` with fallback to `http://127.0.0.1:8000/api/v1`, automatic request timeouts (15s abort controller), typed `ApiError` normalization, and proper `FormData` boundary handling (never manually setting `Content-Type` on multipart uploads).
  - **Typed Feature Services:** `plantApi.ts`, `taskApi.ts`, `journalApi.ts`.
  - **Shared State Layer (`GardenContext.tsx`):** Centralized state now synchronizes directly with backend REST endpoints on mount and during CRUD operations, featuring optimistic updates, rollback on rejection, honest error toasts, and graceful offline fallback if the FastAPI process is stopped.
  - **Live Backend Banner (`BannerDemoNotice.tsx`):** Real-time status indicator alerting users whether the FastAPI + SQLite backend is active or in local fallback mode.

### C. Database Schema & Relational Integrity
1. **`plants` table:**
   - Columns: `id` (VARCHAR PK), `name` (VARCHAR NOT NULL), `species` (VARCHAR), `category` (VARCHAR), `location` (VARCHAR), `care_status` (VARCHAR NOT NULL), `last_watered` (VARCHAR), `next_watering_days` (INTEGER), `light_requirement` (VARCHAR), `watering_frequency_days` (INTEGER), `watering_guidance` (VARCHAR), `acquisition_date` (VARCHAR), `notes` (TEXT), `image_url` (VARCHAR), `added_date` (VARCHAR NOT NULL), `created_at` (DATETIME UTC), `updated_at` (DATETIME UTC).
2. **`care_tasks` table:**
   - Columns: `id` (VARCHAR PK), `plant_id` (VARCHAR FK -> `plants.id`, `ondelete="SET NULL"`), `plant_name` (VARCHAR), `task_type` (VARCHAR NOT NULL), `title` (VARCHAR NOT NULL), `due_date` (VARCHAR NOT NULL), `due_time` (VARCHAR), `priority` (VARCHAR NOT NULL), `completed` (BOOLEAN NOT NULL), `completed_at` (VARCHAR), `notes` (TEXT), `recurrence` (VARCHAR NOT NULL), `due_description` (VARCHAR), `is_today` (BOOLEAN), `created_at` (VARCHAR), `updated_at` (DATETIME UTC).
   - Relationship Safety: Foreign key set to `SET NULL`. Upon plant deletion, the plant router explicitly updates tasks to `plant_id = None` and appends `(Archived)` to `plant_name`, preserving user history.
3. **`journal_entries` table:**
   - Columns: `id` (VARCHAR PK), `plant_id` (VARCHAR FK -> `plants.id`, `ondelete="SET NULL"`), `plant_name` (VARCHAR), `date` (VARCHAR NOT NULL), `title` (VARCHAR NOT NULL), `notes` (TEXT NOT NULL), `observation_type` (VARCHAR NOT NULL), `image_url` (VARCHAR), `growth_measurement` (VARCHAR), `tags_csv` (TEXT), `mood` (VARCHAR), `plant_doctor_assessment_id` (VARCHAR), `created_at` (VARCHAR), `updated_at` (DATETIME UTC).
   - Relationship Safety: Preserved with `(Archived)` notation upon plant deletion.
4. **`journal_photos` table:**
   - Columns: `id` (VARCHAR PK), `journal_entry_id` (VARCHAR FK -> `journal_entries.id`, `ondelete="CASCADE"`), `stored_path` (VARCHAR NOT NULL), `original_filename` (VARCHAR NOT NULL), `media_type` (VARCHAR NOT NULL), `file_size` (INTEGER NOT NULL), `uploaded_at` (DATETIME UTC).
   - Cascade Deletion: Deleting a journal entry or photo record triggers automatic physical file deletion from disk.

### D. REST API Endpoints Implemented & Verified
- **Health Check:**
  - `GET /api/v1/health` -> Returns system health, version, SQLite connection status, and storage folder status.
- **Plants Resource:**
  - `GET /api/v1/plants` -> List plants with optional filtering by `search`, `status`, `category`, and `location`.
  - `GET /api/v1/plants/{plant_id}` -> Single plant retrieval by ID (404 on missing).
  - `POST /api/v1/plants` -> Register specimen with server-side validation (422 on invalid status, 400 on empty name).
  - `PATCH /api/v1/plants/{plant_id}` -> Update specimen and synchronize plant name across existing tasks and journal entries.
  - `DELETE /api/v1/plants/{plant_id}` -> Safe deletion with unlinking of related tasks and journal observations.
- **Care Tasks Resource:**
  - `GET /api/v1/tasks` -> List tasks with filtering by `plant_id`, `completed`, `priority`, and `task_type`.
  - `GET /api/v1/tasks/{task_id}` -> Single task retrieval.
  - `POST /api/v1/tasks` -> Create care task with foreign key validation (rejects invalid plant IDs with 400).
  - `PATCH /api/v1/tasks/{task_id}` -> Update task fields or toggle completion status and timestamp.
  - `DELETE /api/v1/tasks/{task_id}` -> Delete care task row.
- **Growth Journal Resource:**
  - `GET /api/v1/journal` -> List journal entries with filtering by `plant_id`, `observation_type`, live text search, and chronological sorting (`newest`/`oldest`).
  - `GET /api/v1/journal/{entry_id}` -> Single journal entry retrieval including attached photo URLs.
  - `POST /api/v1/journal` -> Create journal entry with plant validation and tag parsing.
  - `PATCH /api/v1/journal/{entry_id}` -> Update observation title, notes, tags, and measurements.
  - `DELETE /api/v1/journal/{entry_id}` -> Delete entry and clean up associated physical files from disk.
- **Multipart Photo Storage:**
  - `POST /api/v1/journal/{entry_id}/photos` -> Multipart image upload validating MIME (JPEG, PNG, WebP) and size (<= 10MB).
  - `GET /api/v1/uploads/{filename}` -> Secure file retrieval with HTTP caching headers and path-traversal sanitization.
  - `DELETE /api/v1/journal/{entry_id}/photos/{photo_id}` -> Delete photo record and unlinks file from disk.
- **Seed Management:**
  - `POST /api/v1/seed` -> Idempotent demo reset restoring baseline botanical collection.

### E. Files Created or Modified in Stage 6
- **Backend Directory (`backend/`):**
  - `backend/app/main.py`: FastAPI application entrypoint with lifespan startup/shutdown, CORS, and root health routes.
  - `backend/app/core/config.py`: Environment configuration and Pydantic Settings.
  - `backend/app/db/session.py`: Database engine and session generator.
  - `backend/app/db/base.py`: SQLAlchemy Base registry.
  - `backend/app/db/seed_data.py`: Initial botanical specimens, tasks, and journal observations.
  - `backend/app/models/` (`plant.py`, `task.py`, `journal.py`): Relational ORM models.
  - `backend/app/schemas/` (`base.py`, `plant.py`, `task.py`, `journal.py`, `health.py`): Pydantic validation schemas.
  - `backend/app/api/v1/` (`router.py`, `health.py`, `plants.py`, `tasks.py`, `journal.py`, `uploads.py`, `seed.py`): Versioned REST controllers.
  - `backend/tests/` (`conftest.py`, `test_health.py`, `test_plants.py`, `test_tasks.py`, `test_journal.py`, `test_uploads.py`, `verify_live_persistence.py`): Automated unit, integration, and live verification suites.
  - `backend/requirements.txt`: Python package requirements.
  - `backend/.env.example`: Backend environment variable templates.
- **Frontend Directory (`src/`):**
  - `src/services/apiClient.ts`: Centralized typed fetch client, error normalization, and media URL resolution.
  - `src/services/plantApi.ts`, `src/services/taskApi.ts`, `src/services/journalApi.ts`: Feature REST API clients.
  - `src/context/GardenContext.tsx`: Integrated backend state provider with loading, error handling, and offline fallback.
  - `src/components/common/BannerDemoNotice.tsx`: Real-time backend connectivity banner.
  - `src/components/common/ImageWithFallback.tsx`: Automatic resolution of relative backend media URLs.
  - `src/components/journal/AddJournalModal.tsx`, `EditJournalModal.tsx`: Real multipart file attachment and photo uploads.
  - `src/components/journal/JournalDetailModal.tsx`, `GrowthJournalPage.tsx`: Live resolution of photo URLs in cards, lightbox, and detail modals.
  - `.env.example`, `.env`: Frontend environment variable configuration (`VITE_API_BASE_URL`).

### F. Dependencies Added
- **Backend (`backend/requirements.txt`):**
  - `fastapi==0.115.11`: High-performance asynchronous API framework.
  - `uvicorn[standard]==0.34.0`: ASGI server for local Windows development.
  - `sqlalchemy==2.0.38`: Relational database ORM.
  - `pydantic==2.10.6`: Data validation and schema parsing.
  - `pydantic-settings==2.8.1`: `.env` configuration management.
  - `python-multipart==0.0.20`: Multipart/form-data upload parsing.
  - `pytest==8.3.4`: Testing framework.
  - `httpx==0.28.1`: HTTP client for FastAPI TestClient.

### G. Windows Local Development Setup & Execution Commands
1. **Backend Setup & Startup:**
   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   .\.venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   - API Docs: `http://127.0.0.1:8000/docs` (Swagger UI) / `http://127.0.0.1:8000/redoc`
   - Health Check: `http://127.0.0.1:8000/api/v1/health`
2. **Frontend Setup & Startup:**
   ```powershell
   npm install
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   - Frontend Application: `http://127.0.0.1:5173/`
3. **Backend Test Execution:**
   ```powershell
   .\backend\.venv\Scripts\pytest backend/tests -v
   .\backend\.venv\Scripts\python.exe backend/tests/verify_live_persistence.py
   ```
4. **Frontend Verification & Regression Tests:**
   ```powershell
   npm run lint
   npm run build
   npx tsx test-growth-journal.ts
   npx tsx test-care-planner.ts
   npx tsx test-doctor.ts
   ```

### H. Verification & Test Execution Results
1. **Backend Automated Pytest Suite (`pytest backend/tests`):**
   - Health check endpoints (`test_root_endpoint`, `test_health_endpoint`).
   - Plant CRUD & CamelCase serialization (`test_create_plant_success`, `test_create_plant_invalid_name`, `test_get_plant_not_found`, `test_update_plant_success`).
   - Plant deletion relationship safety (`test_delete_plant_relationship_safety`).
   - Care Task CRUD & validation (`test_create_task_success`, `test_create_task_with_nonexistent_plant_rejected`, `test_toggle_task_completion`, `test_delete_task`).
   - Journal CRUD & filters (`test_create_and_get_journal_entry`, `test_create_journal_invalid_plant_id`, `test_update_journal_entry`, `test_delete_journal_entry`, `test_list_and_filter_journal`).
   - Photo upload, size/type validation, retrieval, and disk deletion cascade (`test_upload_and_retrieve_photo`, `test_upload_invalid_mime_type`, `test_upload_to_missing_entry`, `test_journal_entry_deletion_cleans_up_photos`).
   - **Result: ALL 20/20 BACKEND TESTS PASSED.**
2. **Live REST & SQLite Disk Verification (`verify_live_persistence.py`):**
   - Live HTTP requests against running FastAPI process on port 8000.
   - Verified physical row writes to SQLite database `backend/data/gardenmind.db`.
   - Verified multipart image upload, physical disk write to `backend/data/uploads/`, and HTTP image retrieval.
   - Verified unlinking safety on plant deletion and file cleanup on journal deletion.
   - **Result: ALL 11/11 LIVE PERSISTENCE CHECKS PASSED (100%).**
3. **Frontend TypeScript & Build Verification:**
   - `npm run lint` (`tsc --noEmit`): 0 errors.
   - `npm run build` (`vite build`): Built production bundle in 6.46s (0 errors).
4. **Frontend Regression Suites (`npx tsx`):**
   - Growth Journal Suite (`test-growth-journal.ts`): 48/48 passed.
   - Smart Care Planner Suite (`test-care-planner.ts`): 30/30 passed.
   - Plant Doctor Suite (`test-doctor.ts`): 23/23 passed.
   - **Total Frontend Test Count: 101/101 PASSED.**
5. **Browser Subagent Status:**
   - Browser tool failed to download Playwright driver due to external CDN 404 error (`https://playwright.azureedge.net/builds/driver/playwright-1.57.0-win32_x64.zip`). Live HTTP and disk persistence were verified directly via integration test suite.

### I. Data Persistence Reality Check
- **Plants Persist After Refresh & Restart:** **YES.** Stored in SQLite `plants` table.
- **Care Tasks Persist After Refresh & Restart:** **YES.** Stored in SQLite `care_tasks` table.
- **Journal Entries Persist After Refresh & Restart:** **YES.** Stored in SQLite `journal_entries` table.
- **Uploaded Photos Persist After Refresh & Restart:** **YES.** Physical image bytes stored on disk at `backend/data/uploads/` with metadata recorded in SQLite `journal_photos` table and served via `/api/v1/uploads/{filename}`.
- **Authentication:** **None.** Local development single-tenant environment without user authentication or multi-tenant isolation.
- **Plant Doctor AI Model Inference:** **Intentionally Unconfigured.** Honest boundary maintained; AI inference will be connected in Prompt 7.

---

## 22. Stage 6 Status Summary
- **Stage 6 Status:** Prompt 6 — Real Backend, FastAPI, SQLite & Persistent Data (Complete & Verified).
- **Persistent Data:** SQLite database with relationships, cascades, and multipart photo storage.

---

## 23. Stage 7 History: Prompt 7 — Real AI Integration & Quality Testing

### A. Executive Summary
In Stage 7, GardenMind AI was integrated with a **genuine, verified plant-image analysis model** that executes directly on the local machine with zero external cloud dependencies, zero recurring API costs, and total user privacy. A high-performance, lightweight **MobileNetV2 vision classifier** fine-tuned on the landmark **PlantVillage dataset** (38 crop and disease classes) was converted to ONNX format and wired into an extensible `PlantAnalysisProvider` architecture within the FastAPI backend. 

Uploaded leaf photographs are safely validated against decompression bombs, size limits (10 MB), and header spoofing, normalized with ImageNet statistics, and evaluated through local CPU tensor inference via `onnxruntime` (~30–45ms latency). Predictions use heuristic score threshold tiers (superseding clarification: statistical softmax scores reflect uncalibrated classifier activations rather than empirical Platt/isotonic Bayesian calibration): statistical softmax scores are transparently separated from biological certainty; uncertain observations trigger an honest inconclusive state; visible evidence is linked to observable pixel features; alternative differential hypotheses are preserved; and recommended actions are strictly restricted to conservative, non-toxic horticultural cultural practices (airflow, isolation, sanitized pruning, bottom watering) with zero dangerous chemical/pesticide dosage advice.

### B. Selected Model & Provenance
- **Model Name:** MobileNetV2 (1.0_224) Plant Disease Classifier
- **Source & Repository:** Hugging Face ONNX Community — [`onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX`](https://huggingface.co/onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX)
- **Architecture:** `MobileNetV2ForImageClassification` (Sandler et al., Google Research)
- **Format & Size:** ONNX format, 9.22 MB (`backend/models/plant_disease_mobilenet_v2.onnx`) + `backend/models/config.json`
- **License:** **Apache 2.0** (Permissive; commercial and open-source use verified)
- **Training Dataset:** PlantVillage (Hughes & Salathé, 2015 / Penn State University), CC BY 4.0 Open Access (54,306 images across 38 classes)
- **Runtime Engine:** `onnxruntime==1.31.0` + `numpy==2.5.3` + `pillow==12.3.0` running on local CPU (Python 3.14 on Windows)
- **Supported Classes (38 Labels across 14 plant species):**
  - Apple (*Scab, Black Rot, Cedar Rust, Healthy*)
  - Blueberry (*Healthy*)
  - Cherry (*Powdery Mildew, Healthy*)
  - Corn (*Cercospora/Gray Leaf Spot, Common Rust, Northern Blight, Healthy*)
  - Grape (*Black Rot, Esca/Black Measles, Leaf Blight, Healthy*)
  - Orange/Citrus (*Citrus Greening/Huanglongbing*)
  - Peach (*Bacterial Spot, Healthy*)
  - Bell Pepper (*Bacterial Spot, Healthy*)
  - Potato (*Early Blight, Late Blight, Healthy*)
  - Raspberry (*Healthy*)
  - Soybean (*Healthy*)
  - Squash (*Powdery Mildew*)
  - Strawberry (*Leaf Scorch, Healthy*)
  - Tomato (*Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy*)

### C. Backend AI Architecture & Endpoints
1. **Provider Abstraction Layer (`backend/app/services/ai/`):**
   - `base.py`: Abstract `PlantAnalysisProvider` defining provider contracts (`name`, `version`, `is_available()`, `get_status()`, `analyze()`).
   - `knowledge_base.py`: Comprehensive 38-class botanical pathology dictionary mapping raw PlantVillage classes to human-readable common names, visual evidence markers, competing alternative explanations, conservative low-risk cultural actions, and physical photographic limitations.
   - `onnx_provider.py`: Concrete `OnnxPlantVillageProvider` executing on-device inference via `onnxruntime.InferenceSession`. Applies ImageNet normalization, Softmax probability calculation, heuristic score threshold tier assignment, and alternative hypothesis generation.
   - `service.py`: Singleton `PlantDoctorService` managing provider lifecycle, input security validation, decompression bomb defense (`Image.MAX_IMAGE_PIXELS = 25_000_000`), and asynchronous thread-pool offloading (`asyncio.to_thread`) to prevent blocking the async event loop.
2. **Versioned REST API Endpoints (`/api/v1/plant-doctor`):**
   - `GET /api/v1/plant-doctor/status`: Returns provider availability, model name, active provider (`onnx_local`), and supported class count (38).
   - `POST /api/v1/plant-doctor/analyze`: Accepts multipart upload (`image` or `file`) with optional diagnostic context JSON or form fields (`selected_plant_id`, `species`, `symptoms`, `affected_area`, `growing_location`, `recent_care_changes`). Enriches context from SQLite database if `selected_plant_id` exists. Returns typed `AnalysisResultOut`.

### D. Diagnostic Integrity & Safety Safeguards
- **Heuristic Uncertainty & Score Tiers (Historically Termed Calibrated Uncertainty):**
  - $p \ge 0.70 \to$ `candidate_identified` (Confidence: `high`)
  - $0.45 \le p < 0.70 \to$ `candidate_identified` (Confidence: `moderate`)
  - $0.30 \le p < 0.45 \to$ `inconclusive` (Confidence: `low`)
  - $p < 0.30 \to$ `inconclusive` (Confidence: `uncertain`)
- **No Fabricated Data:** The model never fabricates pesticide dosages, chemical treatments, soil moisture measurements, temperature, or nutrient levels from a single 2D photograph.
- **Conservative Cultural Care:** Recommended actions are strictly limited to non-chemical horticultural steps (improving airflow, plant isolation, sanitized shears pruning, bottom watering).
- **Explicit Limitations:** Every assessment notes that 2D photos cannot identify subterranean root rot, microscopic nematodes, or systemic viral infections.

### E. Frontend Integration
- **API Client Integration (`src/services/plantDoctorService.ts`):** Wired `submitPlantAnalysis` to `apiClient.upload<AnalysisResult>('/plant-doctor/analyze', formData)`.
- **Status Verification:** Added `checkAnalysisServiceStatus()` and `getAnalysisServiceStatus()` reflecting real provider status.
- **User Agency:** Saving analysis to Growth Journal and scheduling follow-up tasks in Smart Care Planner remain explicit, user-initiated actions.
- **Preserved Aesthetic:** Maintained GardenMind AI's botanical design system (warm ivory `#FAF7F2`, forest green `#1B3B2B`, soft sage `#E5EBE3`, and serif editorial typography).

### F. Files Created or Modified in Stage 7
- **New Files Created:**
  - `docs/AI_MODEL.md`: Exhaustive specification of the MobileNetV2 ONNX model, license, labels, preprocessing, and heuristic score tiers.
  - `backend/models/plant_disease_mobilenet_v2.onnx`: Downloaded 9.22 MB ONNX model checkpoint.
  - `backend/models/config.json`: Hugging Face model configuration with 38-class `id2label` mapping.
  - `backend/app/schemas/doctor.py`: Pydantic validation schemas with CamelCase serialization.
  - `backend/app/services/ai/base.py`: Abstract provider interface.
  - `backend/app/services/ai/knowledge_base.py`: 38-class botanical symptom dictionary and conservative remedies.
  - `backend/app/services/ai/onnx_provider.py`: Concrete local ONNX Runtime inference engine.
  - `backend/app/services/ai/service.py`: Singleton service manager with validation and async execution.
  - `backend/app/api/v1/doctor.py`: REST router for `/plant-doctor/status` and `/plant-doctor/analyze`.
  - `backend/tests/test_model_inference_standalone.py`: Standalone tensor forward-pass test.
  - `backend/tests/test_doctor.py`: 10 automated unit/integration tests for doctor endpoints and validation.
  - `backend/tests/verify_live_ai_inference.py`: End-to-end integration script testing live HTTP requests against the running FastAPI server.
- **Files Modified:**
  - `package.json`: Added `"start": "vite"` script to resolve npm start command.
  - `backend/requirements.txt`: Added `onnxruntime==1.31.0`, `numpy==2.5.3`, and `pillow==12.3.0`.
  - `backend/app/core/config.py`: Added `MODEL_DIR`, `AI_MODEL_PATH`, `AI_MODEL_CONFIG_PATH`, `AI_PROVIDER_TYPE`, `GEMINI_API_KEY`.
  - `backend/app/api/v1/router.py`: Registered `doctor_router` in `api_router`.
  - `backend/.env.example`: Documented AI model configuration options.
  - `src/services/plantDoctorService.ts`: Connected to real FastAPI backend using `apiClient`.
  - `test-doctor.ts`: Updated suite to verify Stage 7 active status and unconfigured fallback.
  - `README.md`: Documented Plant Doctor AI endpoints, test suites, and roadmap progress.
  - `PROJECT_STATUS.md`: Appended Stage 7 documentation.

### G. Windows Local Development Setup & Execution Commands
1. **Install Backend Dependencies:**
   ```powershell
   cd backend
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. **Start Backend Server:**
   ```powershell
   .\.venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
3. **Start Frontend Server:**
   ```powershell
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
4. **Run Backend Automated Tests:**
   ```powershell
   .\backend\.venv\Scripts\pytest backend/tests -v
   ```
5. **Run Live AI Inference Verification:**
   ```powershell
   .\backend\.venv\Scripts\python.exe backend/tests/verify_live_ai_inference.py
   ```
6. **Run Frontend Type Check & Tests:**
   ```powershell
   npm run lint
   npm run build
   npx tsx test-growth-journal.ts
   npx tsx test-care-planner.ts
   npx tsx test-doctor.ts
   ```

### H. Tests & Verification Actually Executed
1. **Backend Automated Pytest Suite (`pytest backend/tests -v`):**
   - `tests/test_doctor.py`:
     - `test_doctor_status_endpoint`: PASSED
     - `test_analyze_valid_jpeg_leaf`: PASSED
     - `test_analyze_valid_png_leaf`: PASSED
     - `test_analyze_empty_file` (400 Bad Request): PASSED
     - `test_analyze_corrupted_image` (400 Bad Request): PASSED
     - `test_analyze_unsupported_format_or_text_disguised_as_jpg` (400 Bad Request): PASSED
     - `test_analyze_oversized_file` (400 Bad Request): PASSED
     - `test_analyze_with_json_context`: PASSED
     - `test_analyze_with_existing_plant_association`: PASSED
     - `test_model_unavailable_behavior` (503 Service Unavailable): PASSED
   - `tests/test_health.py`: 2/2 PASSED
   - `tests/test_plants.py`: 5/5 PASSED
   - `tests/test_tasks.py`: 4/4 PASSED
   - `tests/test_journal.py`: 5/5 PASSED
   - `tests/test_uploads.py`: 4/4 PASSED
   - `tests/test_model_inference_standalone.py`: 1/1 PASSED
   - **Result: ALL 31/31 BACKEND TESTS PASSED (100%).**
2. **Live AI Inference & Quality Verification (`verify_live_ai_inference.py`):**
   - Live HTTP request against running server on `http://127.0.0.1:8000`.
   - Verified `GET /api/v1/plant-doctor/status` returns `isConfigured: True`, `supportedClassesCount: 38`.
   - Verified genuine model inference on synthetic leaf image: completed in 41.5 ms on CPU.
   - Verified input safety rejections: empty file (400), corrupted stream (400), disguised text (400).
   - **Result: ALL 5/5 LIVE AI CHECKS PASSED.**
3. **Frontend TypeScript & Build Verification:**
   - `npm run lint` (`tsc --noEmit`): **0 errors**.
   - `npm run build` (`vite build`): Built production bundle in 4.45s (**0 errors**).
4. **Frontend Regression Suites (`npx tsx`):**
   - `test-doctor.ts`: 23/23 PASSED.
   - `test-care-planner.ts`: 30/30 PASSED.
   - `test-growth-journal.ts`: 48/48 PASSED.
   - **Total Frontend Test Count: 101/101 PASSED.**
5. **Checks Not Run:**
   - Playwright browser subagent visual recording failed due to Playwright CDN 404 driver download issue (`playwright-1.57.0-win32_x64.zip` returned 404 from Azure CDN). All frontend components, endpoints, and data contracts were verified directly via automated and live HTTP suites.

### I. Reality Check & Verification Summary
- **Genuine Model Inference Verified:** **YES.** Real ONNX tensor forward pass running locally on CPU in ~30–45ms.
- **Fake Diagnoses Present:** **NO.** Strict heuristic score thresholds with honest inconclusive states.
- **Privacy & Security:** Images processed in-memory, zero persistent storage of unapproved doctor images, zero telemetry.
- **Extensibility:** Multi-provider architecture ready for optional cloud vision extensions via `GEMINI_API_KEY`.
- **Prompt 8 Status:** **Not started.**

---

## 24. Stage 7 Status Summary
- **Stage 7 Status:** Prompt 7 — Real AI Integration & Quality Testing (Complete & Fully Verified).
- **Vision Model:** Local MobileNetV2 (PlantVillage ONNX, 38 classes, Apache 2.0, CPU inference in 24–45ms).

---

## 25. Stage 8 History: Prompt 8 — Deployment, GitHub & Final Verification

### A. Final Repository & Codebase Audit
In Stage 8, GardenMind AI was subjected to an exhaustive full-stack audit across code quality, security posture, configuration integrity, deployment containerization, and automated test coverage.
- **Repository Structure:** Clean, decoupled modular structure separating frontend (`src/`), backend (`backend/`), AI model checkpoints (`backend/models/`), and deployment descriptors (`Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml`, `render.yaml`).
- **Git Readiness:** Project is prepared for initialization as a clean Git repository. All secrets, local virtualenvs, database binaries, and uploaded photos are strictly protected by a hardened `.gitignore`. No remote pushes or external commits were executed without explicit authorization.

### B. Features Actually Implemented & Operational
1. **Overview Dashboard:** Dynamic real-time metrics (collection count, pending tasks, recent growth logs), urgent attention alerts, and promotional card for active on-device Vision AI.
2. **My Garden:** Specimen catalog with custom nicknames, botanical taxonomy, location tagging, watering rhythms, and relationship-safe deletion.
3. **Plant Doctor AI:** Genuine on-device vision diagnostic pipeline powered by `onnxruntime` executing MobileNetV2 fine-tuned on PlantVillage (38 crop condition classes) in ~25–45ms on CPU. Produces structured 4-pillar assessment reports with heuristic confidence tiers and zero toxic chemical recommendations.
4. **Smart Care Planner:** Recurring task engine (daily, weekly, monthly) with automated next-occurrence calculation upon completion, priority classifications, and contextual care advice.
5. **Growth Journal:** Visual timeline with 8 observation types, user measurements, plant mood vitality, multi-photo attachments, and lightbox viewer.
6. **FastAPI & SQLite Persistence:** Full relational CRUD operations, transactional relationship unlinking on specimen deletion, and filesystem photo storage with automatic cascade cleanup.

### C. Actual Technology Stack
- **Frontend:** React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Lucide React icons.
- **Backend:** Python 3.14/3.11, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2 schemas.
- **Database:** SQLite with local engine (`backend/data/gardenmind.db`).
- **AI & ML Engine:** ONNX Runtime (`onnxruntime==1.31.0`), NumPy (`numpy==2.5.3`), Pillow (`pillow==12.3.0`), MobileNetV2 (1.0_224, Apache 2.0, 9.22 MB).
- **Containerization & Deployment:** Docker, Docker Compose, Vercel SPA routing (`vercel.json`), Netlify SPA routing (`netlify.toml`), Render Blueprint (`render.yaml`).

### D. Security & Privacy Audit Findings
- **Zero Hardcoded Secrets in Working Tree:** Working-tree scan reported zero hardcoded secrets (API keys, passwords, bearer tokens, or cloud credentials). Git history has not been scanned because the workspace is not initialized as a Git repository.
- **Privacy First:** User photographs are analyzed directly in-memory on the local CPU; they are never uploaded to remote third-party AI APIs without explicit user configuration.
- **Decompression Bomb Protection:** Enforced `Image.MAX_IMAGE_PIXELS = 25_000_000` and maximum file size of 10 MB.
- **Path Traversal Defense:** Filenames sanitized with UUIDs and isolated to the designated upload folder.
- **CORS Hardening:** Configured with explicit local and production origin whitelists without wildcard credential sharing.

### E. Deployment Architecture Recommendation
- **Frontend Target:** **Vercel** or **Netlify** for static global edge CDN delivery with automated Git CI/CD. Configuration files [`vercel.json`](vercel.json) and [`netlify.toml`](netlify.toml) provided.
- **Backend Target:** **Render**, **Railway**, or **Fly.io** running containerized FastAPI with a **Persistent Disk Volume** mounted at `/app/data` (or `/var/data`). Configuration files [`backend/Dockerfile`](backend/Dockerfile), [`docker-compose.yml`](docker-compose.yml), and [`render.yaml`](render.yaml) provided.
- **Filesystem Reality:** Serverless functions (e.g. AWS Lambda, Vercel serverless) are **not recommended** for SQLite storage because their filesystem is ephemeral; a persistent disk volume is strictly required to preserve SQLite rows and photo uploads across container restarts.

### F. Verification & Test Execution Results
1. **Frontend Quality & Build Checks:**
   - `npm run lint` (`tsc --noEmit`): **0 Errors, 0 Warnings**.
   - `npm run build` (`vite build`): **Built successfully in 3.92s** (1625 modules transformed, 419.99 kB JS bundle).
2. **Backend Automated Tests (`pytest backend/tests -v`):**
   - **31 / 31 Tests Passed** (100% pass rate).
3. **Live Integration Suites:**
   - Live SQLite Disk Persistence (`verify_live_persistence.py`): **11 / 11 Checks Passed** (100%).
   - Live ONNX AI Inference (`verify_live_ai_inference.py`): **5 / 5 Checks Passed** (100%, 24.8ms CPU latency).
   - Growth Journal Suite (`test-growth-journal.ts`): **48 / 48 Passed**.
   - Smart Care Planner Suite (`test-care-planner.ts`): **30 / 30 Passed**.
   - Plant Doctor Suite (`test-doctor.ts`): **23 / 23 Passed**.
   - **Total Verification Assertions & Tests: 148 / 148 PASSED (100%).**
   - *(Historical Record & Reconciliation Note: 148 / 148 reflects the test suite pass count at the time of Stage 8 execution on October 10, 2026. This was subsequently reconciled to 153 / 153 passing tests and checks in the latest authoritative audit of Section 28 on October 11, 2026, with the addition of 5 server restart persistence checks in `test_restart_persistence.py`. Pass rates reflect 100% passing of the executed suite; no statement/branch code coverage percentage has been established).*

### G. Deployment & GitHub Status
- **GitHub Status:** **Prepared.** Repository structure sanitized, `.gitignore` hardened, `LICENSE` (MIT) added, and professional portfolio `README.md` authored. Awaiting explicit user approval before `git init`, staging, or pushing.
- **Deployment Status:** **Prepared.** Dockerfile, docker-compose, Vercel, Netlify, and Render blueprints prepared. Awaiting user authorization and account provisioning before deploying live.

---

## 26. Stage 8 Status Summary
- **Application Implementation:** Reported complete, supported by existing automated tests across all 5 workflows.
- **Automated Tests:** 148 / 148 reported passing tests and checks at Stage 8 completion on October 10, 2026 (100% test pass rate for the executed suite; not code coverage, as no code coverage percentage has been established). Reconciled in the latest authoritative audit (Section 28, October 11, 2026) to 153 / 153 passing tests and checks with the addition of 5 server restart persistence checks.
- **AI Readiness:** Verified and operational (Local ONNX MobileNetV2, 38 classes, CPU inference in ~25–45ms with heuristic score tiers).
- **Browser Verification:** Blocked / Pending manual interactive browser testing; Playwright automation remains blocked by external driver CDN failure. Dev server HTTP serving and responsive source code were verified, but HTTP checks and source code inspection do not equal successful interactive browser testing.
- **Deployment Status:** Prepared but not deployed (Awaiting user authorization and cloud provisioning).
- **GitHub Publication Status:** Prepared (Awaiting user authorization; workspace is not yet initialized as a Git repository).
- **Production Readiness:** Pending manual interactive browser testing, cloud deployment provisioning, and production security review.
- **Retained System Limitations:** Real-world diagnostic accuracy on field photographs is unbenchmarked (PlantVillage lab conditions domain gap); model softmax scores represent uncalibrated heuristic threshold tiers rather than empirical Bayesian probabilities; unsupported ornamental houseplants default to inconclusive; single-tenant personal scope without authentication or multi-tenant isolation.

---

## 27. Final Audit, Status Correction & Portfolio Readiness (October 10, 2026 — Historical Audit)

### A. Audit Overview & Date
- **Audit Date:** October 10, 2026
- **Auditor Roles:** Senior Full-Stack Engineer, ML Engineer, QA Engineer, Security Reviewer, Technical Documentation Specialist.
- **Audit Objective:** Perform an evidence-based audit across the entire eight-prompt development history of GardenMind AI, reconcile test numbers, correct outdated descriptions, verify real on-device AI inference and database persistence, and document authoritative status labels.
- **Historical Audit Note:** This section records the historical audit conducted on October 10, 2026. Authoritative status has transitioned to Section 28 (October 11, 2026) as the latest authoritative audit.

### B. Files Inspected & Modified During Audit
- **Files Inspected:**
  - Frontend: `package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`, `src/index.css`, all component directories (`overview/`, `garden/`, `doctor/`, `care/`, `journal/`, `layout/`, `common/`, `settings/`), all service clients (`apiClient.ts`, `plantApi.ts`, `taskApi.ts`, `journalApi.ts`, `plantDoctorService.ts`).
  - Backend: `backend/app/main.py`, `backend/app/core/config.py`, `backend/app/db/session.py`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/api/v1/`, `backend/app/services/ai/`.
  - Storage & Database: `backend/data/gardenmind.db`, `backend/data/uploads/`.
  - AI Models & Docs: `backend/models/plant_disease_mobilenet_v2.onnx`, `backend/models/config.json`, `docs/AI_MODEL.md`.
  - Tests: `backend/tests/` (7 test files + 2 verification scripts), `test-growth-journal.ts`, `test-care-planner.ts`, `test-doctor.ts`.
  - Deployment & Git: `backend/Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml`, `render.yaml`, `.gitignore`, `.env.example`, `backend/.env.example`, `LICENSE`.
- **Files Modified During Audit:**
  - `docs/AI_MODEL.md`: Updated with heuristic confidence mapping disclosures, scientific dataset domain gap analysis (PlantVillage lab conditions vs home gardening photography), and out-of-distribution houseplant notes.
  - `README.md`: Converted machine-specific paths to repository-relative links, added application visual capture checklist, added B.Tech portfolio resume summary, clarified test pass rate vs code coverage.
  - `PROJECT_STATUS.md`: Corrected outdated opening sections, reconciled test counts, updated historical sections with superseding notes, and appended this Section 27 audit.

### C. Exact Commands Executed & Verified Audit Results
1. **Frontend Type Checking (`npm run lint`):**
   - Command: `npm run lint` (`tsc --noEmit`)
   - Outcome: **PASSED (0 Errors, 0 Warnings)**.
2. **Frontend Production Build (`npm run build`):**
   - Command: `npm run build` (`tsc -b && vite build`)
   - Outcome: **PASSED** (1625 modules transformed, built in 3.28s–5.81s, gzip size 103.25 kB).
3. **Backend Unit & Integration Tests (`pytest tests -v` in `backend/`):**
   - Command: `.\backend\.venv\Scripts\pytest backend/tests -v`
   - Outcome: **31 / 31 PASSED** (100% pass rate).
4. **Live End-to-End SQLite Persistence (`verify_live_persistence.py`):**
   - Command: `.\backend\.venv\Scripts\python.exe backend/tests/verify_live_persistence.py`
   - Outcome: **11 / 11 Checks PASSED** (Health, Plant CRUD, Task CRUD & completion, Journal CRUD, multipart photo upload, disk write, HTTP retrieval, safe disassociation unlinking, cascade file deletion).
5. **Live End-to-End ONNX Vision AI Inference (`verify_live_ai_inference.py`):**
   - Command: `.\backend\.venv\Scripts\python.exe backend/tests/verify_live_ai_inference.py`
   - Outcome: **5 / 5 Checks PASSED** (Status check, 24.8–41.5ms forward-pass latency on CPU, 400 empty file rejection, 400 corrupt stream rejection, 400 disguised text file rejection).
6. **Frontend Automated Regression Suites (`npx tsx`):**
   - `test-growth-journal.ts`: **48 / 48 PASSED** (Entry models, validation, editing, timeline filters, date calculations).
   - `test-care-planner.ts`: **30 / 30 PASSED** (Date classification, daily/weekly/monthly recurrence, lifecycle, suggestions).
   - `test-doctor.ts`: **23 / 23 PASSED** (MIME/size boundaries, live status check, heuristic uncertainty tier schema, journal/care task integration).
   - Total Frontend Assertions: **101 / 101 PASSED**.
7. **Combined Audit Pass Rate:** **148 reported passing tests and checks (100% test pass rate for executed suite)**.
   - *Audit Clarification:* As established in software testing standards, passing 100% of defined test cases does not equal 100% branch or line code coverage. Code coverage was not formally instrumented; the 148 passed tests represent 100% compliance with all defined functional test cases.
   - *(Reconciliation Note: Historical count of 148/148 passed tests as of October 10, 2026 is preserved as historical. It was subsequently reconciled with the latest authoritative result of 153/153 passed tests and checks in Section 28 on October 11, 2026, following the addition of 5 server restart persistence checks).*

### D. Checks That Failed or Were Blocked
- **Playwright Browser Subagent Automation:** **Blocked**.
  - Attempted execution of browser subagent during Stage 7 and Stage 8 failed due to external Microsoft Azure CDN returning HTTP 404 for Windows x64 driver: `https://playwright.azureedge.net/builds/driver/playwright-1.57.0-win32_x64.zip`.
  - Manual & HTTP Verification Performed: Verified all endpoints, API routing, server responses, and build bundles directly via live HTTP requests, curl, and Vite build compilation. These HTTP checks and source build verifications confirm dev server health and code integrity, but do not equal or substitute for successful interactive browser testing; interactive browser testing remains pending.

### E. AI Model Capabilities & Scientific Integrity
- **Verified Capabilities:**
  - Real, local CPU forward-pass execution via `onnxruntime` (~25–45ms latency).
  - 38 output classes covering 14 crop and leaf pathology categories from the PlantVillage dataset.
  - ImageNet normalization (`mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`).
  - Software pipeline validation defenses against decompression bombs (`25_000_000` pixels max), oversized files (10 MB max), and corrupted byte streams.
  - Conservative cultural remedies only (airflow, isolation, sanitized shears pruning, bottom watering).
- **Unverified & Out-of-Scope Capabilities (Explicit Disclosures):**
  - Real-world diagnostic accuracy on field photographs has **not** been benchmarked; PlantVillage training data was collected under controlled lab conditions on uniform paper backgrounds, creating a domain gap with home smartphone photos.
  - Softmax scores are heuristic threshold tiers (`high`, `moderate`, `low`, `uncertain`), **not** calibrated empirical Bayesian probabilities.
  - Non-crop ornamental houseplants (Monstera, Pothos, Snake Plant, Ficus) are outside the 38 classes; the system transparently defaults to an inconclusive state for unsupported foliage.
  - Synthetic test images verify code execution and memory safety, not clinical botanical diagnosis.

### F. Security & Privacy Audit
- **Working Tree Scan:** Scanned all source code, tests, and configurations in the working tree; verified zero hardcoded API keys, database credentials, or secret tokens.
- **Git History Inspection:** Unperformed / Not applicable at this stage because the local workspace has not yet been initialized as a Git repository (awaiting explicit user approval before `git init`).
- **Safe Environment Configuration:** Provided sanitized `.env.example` templates for both root and `backend/`.
- **Hardened `.gitignore`:** Verified exclusion of `.env`, `backend/.env`, `.env.production`, virtual environments (`.venv/`, `backend/.venv/`), SQLite database files (`*.db`, `backend/data/`), uploaded photographs, and cache directories.
- **Single-Tenant Local Scope:** Explicitly discloses that no multi-tenant authentication, user sessions, or row-level permissions exist in this version.

### G. GitHub & Deployment Readiness
- **GitHub Status:** **Prepared (Awaiting User Authorization)**. Clean directory structure, MIT license, hardened `.gitignore`, and comprehensive portfolio README with Mermaid diagrams ready for `git init`.
- **Deployment Status:** **Prepared but not deployed (Awaiting User Authorization)**. Containerized `backend/Dockerfile`, `docker-compose.yml`, `render.yaml` with persistent volume mount (`/app/data`), `vercel.json`, and `netlify.toml` prepared.

---

### H. Historical Status Matrix (October 10, 2026 — Reconciled with Section 28)

| Category | Status Label | Verification Evidence & Notes |
|---|---|---|
| **1. Application Implementation** | `Reported complete` | Supported by existing automated tests; all 5 primary pages (Overview, My Garden, Plant Doctor, Care Planner, Growth Journal) implemented and wired. |
| **2. Backend and Database** | `Verified` | FastAPI backend operational on port 8000; SQLite persistent storage (`gardenmind.db`) with relational integrity and safe unlinking verified. |
| **3. AI Model Readiness** | `Verified` | MobileNetV2 ONNX model (9.22 MB, Apache 2.0) executes on-device CPU inference in 24.8–41.5ms; heuristic confidence tiers & 4-pillar reports active. |
| **4. Automated Test Results** | `148 reported passing (Historical)` | Historical October 10 result: 148 reported passing tests and checks across 31 backend pytest cases, 101 frontend regression tests, and 16 live integration checks (100% test pass rate for executed suite; not code coverage, as no code coverage percentage has been established). Reconciled in Section 28 to 153/153 with 5 restart persistence checks added. |
| **5. Manual & Browser Verification** | `Blocked / Pending manual verification` | Live HTTP API and static production bundles verified; Playwright browser automation remains blocked by external CDN 404 driver download. HTTP checks and source code inspection do not equal successful interactive browser testing; interactive browser testing remains pending. |
| **6. Security and Privacy** | `Verified (Working tree & .gitignore)` | Working tree scanned with zero hardcoded credentials; .gitignore verified; git history scan unperformed (repo not yet initialized); single-tenant personal scope. |
| **7. GitHub Readiness** | `Verified (Prepared)` | Sanitized repo, `.gitignore`, MIT `LICENSE`, `.env.example`, and portfolio `README.md` authored. Awaiting explicit user approval before `git init` or push. |
| **8. Deployment Readiness** | `Prepared but not deployed` | `Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml`, and `render.yaml` configured with persistent disk mount. Not deployed pending user cloud account setup. |
| **9. Production Readiness** | `Pending final verification` | Pending manual interactive browser testing, deployment validation, and production security review. |
| **10. Outstanding Issues** | `Documented` | External account setup (GitHub/Render/Vercel), capturing manual UI screenshots per checklist, and resolving browser driver download. |

---

## 28. Final Manual QA and Pre-Release Audit — Latest Authoritative Audit (October 11, 2026)

### A. Audit Date & Environment
- **Audit Date:** October 11, 2026
- **Auditor Role:** Senior QA Engineer & Software Engineer
- **Audit Status:** **Latest Authoritative Audit.** This audit represents the definitive, current status baseline for the GardenMind AI project, superseding Section 27 and all prior historical audit matrices.
- **Environment:** Windows 10/11 x64, Python 3.14.7 (`backend\.venv`), Node.js v24.20.0, npm 12.0.2, Vite 5.4.21, FastAPI 0.115+, Uvicorn 0.34+, SQLite 3, ONNX Runtime 1.31.0.
- **Active Local Services:**
  - FastAPI Backend: `http://127.0.0.1:8000` (API prefix `/api/v1`)
  - Vite Frontend: `http://127.0.0.1:5173`

### B. Commands Actually Executed
1. `npm run lint` (`tsc --noEmit`)
2. `npm run build` (`tsc -b && vite build`)
3. `.\backend\.venv\Scripts\pytest backend/tests -v` (Executed from repository root)
4. `.\.venv\Scripts\pytest tests -v` (Executed from `backend/` directory)
5. `npx tsx test-growth-journal.ts`
6. `npx tsx test-care-planner.ts`
7. `npx tsx test-doctor.ts`
8. `.\backend\.venv\Scripts\python.exe backend/tests/verify_live_persistence.py`
9. `.\backend\.venv\Scripts\python.exe backend/tests/verify_live_ai_inference.py`
10. `.\backend\.venv\Scripts\python.exe backend/tests/test_restart_persistence.py seed` and `verify`
11. Working tree secrets scanner (`backend/tests/scan_secrets.py`)
12. `browser_subagent` invocation for automated browser navigation
13. `curl.exe -s http://127.0.0.1:5173/`, `curl.exe -s -I http://127.0.0.1:5173/src/main.tsx`, `curl.exe -s -I http://127.0.0.1:5173/src/App.tsx`
14. Health and status queries via PowerShell `Invoke-RestMethod` to `http://127.0.0.1:8000/api/v1/health` and `/api/v1/plant-doctor/status`

### C. Exact Test Results
- **Frontend Type Check (`npm run lint`):** **PASSED** (0 Errors, 0 Warnings).
- **Frontend Production Compilation (`npm run build`):** **PASSED** (1625 modules transformed, production assets generated in `dist/` in 21.98s; bundle size 419.99 kB JS, 41.91 kB CSS).
- **Backend Pytest Suite (`pytest backend/tests -v`):** **31 / 31 PASSED** (100% pass rate in 1.01s–1.23s).
- **Frontend Growth Journal Suite (`test-growth-journal.ts`):** **48 / 48 PASSED** (Models, validations, filters, disassociation, metrics).
- **Frontend Care Planner Suite (`test-care-planner.ts`):** **30 / 30 PASSED** (Calendar dates, recurrence, lifecycle, suggestions).
- **Frontend Plant Doctor Suite (`test-doctor.ts`):** **23 / 23 PASSED** (MIME/size boundaries, live status check, heuristic uncertainty schema).
- **Live SQLite Persistence (`verify_live_persistence.py`):** **11 / 11 Checks PASSED** (CRUD operations, multipart photo upload, disk write, HTTP retrieval, safe unlinking, cascade file deletion).
- **Live ONNX AI Inference (`verify_live_ai_inference.py`):** **5 / 5 Checks PASSED** (35.8ms forward pass on CPU, 400 rejection on empty, corrupted, and disguised text files).
- **Server Restart Persistence (`test_restart_persistence.py`):** **5 / 5 Checks PASSED** (Verified that specimen record, care task, journal entry, and physical image file survived full backend termination and restart).
- **Total Executed Assertions & Tests:** **153 / 153 PASSED (100% test pass rate for executed suite)**.
- **Code Coverage Clarification:** The 100% pass rate applies strictly to the 153 executed tests and checks. No statement, branch, or line code coverage percentage has been established.
- **Reconciliation with Prior Stages:** Reconciles the historical Stage 8 count (148/148) by including 5 server restart persistence checks (`test_restart_persistence.py`), establishing the current authoritative baseline of 153/153.

### D. Browser Tests Completed and Not Completed
- **Automated Browser Automation (Playwright subagent):** **BLOCKED**.
  - Attempted execution of `browser_subagent` failed due to an external network issue: Microsoft Azure CDN returned `HTTP 404 Not Found` for `https://playwright.azureedge.net/builds/driver/playwright-1.57.0-win32_x64.zip`.
  - In accordance with the prompt's strict rules, no simulated success is claimed for browser automation.
- **Completed Manual & HTTP Verification:**
  - Verified Vite dev server serves HTML, JavaScript module graph, CSS, and favicon on `http://127.0.0.1:5173`.
  - Verified responsive layout implementations in source code: desktop sidebar (`hidden md:flex`) and mobile drawer + sticky bottom navigation bar (`md:hidden`).
  - Verified empty states, submission locks, and toast notification boundaries across all pages.
  - **Critical Verification Boundary:** These HTTP status checks, curl queries, and source code reviews verify server reachability, bundle delivery, and static markup structure; they do NOT equal, substitute for, or constitute successful interactive browser testing.
- **Untested / Requires Manual User Action:**
  - **Interactive Browser Testing (Pending):** Interactive browser inspection (opening `http://127.0.0.1:5173` in a local browser like Chrome or Edge, visually validating animations, responsive reflow, modal interactions, and selecting an image through the OS file picker dialog) has not been performed and remains pending.

### E. Bugs Found and Fixes Made
- **Bug Identified:** When executing `pytest` or server scripts from the workspace root (`d:\Antigravity\GardenMind AI`), relative path settings in `backend/app/core/config.py` (`./models/plant_disease_mobilenet_v2.onnx`, `./models/config.json`, `./data/uploads`) failed to resolve because the current working directory was the root, not `backend/`. This caused 5 doctor tests to return `503 Service Unavailable`.
- **Fix Applied:**
  - Added `resolved_model_path`, `resolved_config_path`, and fallback directory resolution in `backend/app/core/config.py` using `Path(__file__).resolve().parent.parent.parent` to automatically locate backend resources when run from either the root or `backend/` directory.
  - Updated `backend/app/services/ai/service.py` to use `settings.resolved_model_path` and `settings.resolved_config_path`.
- **Verification of Fix:** `pytest backend/tests -v` now runs cleanly from the repository root, passing **31 / 31 tests (100%)**.

### F. Security and Persistence Audit
- **Working Tree Scan:** Executed comprehensive regex scanner over all source files, configurations, and environment templates. **Zero hardcoded API keys, passwords, bearer tokens, or secrets found.**
- **Git History Scan:** **Unperformed / Not applicable.** The workspace is not yet initialized as a Git repository (`git status` returned `fatal: not a git repository`). A Git history scan will be performed once the user explicitly authorizes `git init`.
- **Environment File Handling:** `.env` contains only `VITE_API_BASE_URL`. `.env.example` and `backend/.env.example` provide clean, sanitized configuration templates with empty placeholders.
- **`.gitignore` Review:** Hardened and verified. Confirmed exclusion of `.env`, `backend/.env`, SQLite database files (`*.db`, `backend/data/`), test databases (`test_gardenmind.db`), uploaded photographs, and virtual environment directories.
- **Persistence Across Application Restarts:** Verified through automated test `backend/tests/test_restart_persistence.py`. Plant records, care tasks, journal entries, and uploaded photographs remain fully intact in SQLite and on the local filesystem across complete server termination and reload.
- **Deployment Persistent Storage Requirement:** Serverless runtimes (AWS Lambda, Vercel Serverless) have ephemeral filesystems and are unsuitable for SQLite and file uploads. Production deployment requires container hosting with a **persistent disk volume** (e.g., Render with `/app/data` disk mount, Fly.io, or Railway).
- **Retained Scientific & Architectural Limitations:**
  - **Real-World Plant-Diagnosis Accuracy:** Diagnostic accuracy on field photographs has not been benchmarked; PlantVillage training data was captured under controlled agricultural laboratory settings on uniform paper backgrounds, introducing a domain gap with home smartphone photography.
  - **Uncalibrated Model Scores:** Softmax outputs represent uncalibrated heuristic threshold tiers (`high`, `moderate`, `low`, `uncertain`), not empirical Bayesian probabilities.
  - **Unsupported Ornamental Houseplants:** The 38 classes cover agricultural crop conditions; unsupported non-crop ornamental houseplants (e.g., Monstera, Pothos, Ficus, Snake Plant) default to an honest inconclusive result.
  - **Missing Authentication:** Local development single-tenant architecture with no user authentication, sessions, or multi-tenant isolation.

### G. Current Deployment & Pre-Release Readiness
- **Readiness Verdict:** **Ready for GitHub Preparation (Pending User Approval).**
  - Application code, schemas, and tests are clean, robust, and verified.
  - Local AI inference and SQLite persistence operate reliably.
  - Git repository initialization (`git init`, initial commit, and remote push) awaits explicit user authorization.
  - **Interactive Browser Testing Status:** **Pending** (requires manual verification by user in a browser).
  - **Cloud Deployment Status:** **Pending** (prepared with containerized blueprints; awaits user cloud account provisioning).

### H. Latest Authoritative Status Matrix (October 11, 2026)

| Category | Authoritative Status Label | Verification Evidence & Notes |
|---|---|---|
| **1. Application Implementation** | `Verified & Operational` | Supported by automated tests across all 5 core workflows (Overview, My Garden, Plant Doctor, Care Planner, Growth Journal). |
| **2. Backend and Database** | `Verified` | FastAPI backend operational on port 8000; SQLite persistent storage (`gardenmind.db`) with relational integrity, cascade cleanups, and restart persistence verified. |
| **3. AI Model Readiness** | `Verified (Local ONNX)` | MobileNetV2 ONNX model (9.22 MB, Apache 2.0) executes on-device CPU inference in 24.8–35.8ms; heuristic confidence tiers and 4-pillar reports active. |
| **4. Automated Test Results** | `153 / 153 passed (100%)` | 153 passed tests and checks across 31 backend pytest cases, 101 frontend regression tests, 16 live integration checks, and 5 restart persistence checks (100% test pass rate for executed suite; no code coverage percentage established). Reconciles historical Stage 8 total of 148. |
| **5. Manual & Browser Verification** | `Blocked / Pending manual verification` | Dev server HTTP responses and responsive source code verified, but HTTP checks and source inspection do not equal successful interactive browser testing; Playwright automation remains blocked by external CDN 404 driver download; interactive browser testing remains pending. |
| **6. Security and Privacy** | `Verified (Working tree & .gitignore)` | Working-tree scan reported zero hardcoded secrets; .gitignore verified; Git history scan unperformed because workspace is not initialized as a Git repository; single-tenant personal scope without authentication. |
| **7. GitHub Readiness** | `Prepared (Awaiting Authorization)` | Sanitized repo, `.gitignore`, MIT `LICENSE`, `.env.example`, and portfolio `README.md` authored; awaiting explicit user approval before `git init` or push. |
| **8. Deployment Readiness** | `Prepared but not deployed` | Containerized `backend/Dockerfile`, `docker-compose.yml`, `render.yaml` with persistent volume mount (`/app/data`), `vercel.json`, and `netlify.toml` prepared; not deployed pending user cloud account setup. |
| **9. Production Readiness** | `Pending final verification` | Pending manual interactive browser testing, cloud deployment provisioning, and production security review. |
| **10. Retained Limitations** | `Explicitly Documented` | Real-world plant-diagnosis accuracy unbenchmarked; uncalibrated model scores; unsupported ornamental houseplants; missing authentication. |

