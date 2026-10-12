import React from 'react';
import { Plant, CareTask, JournalEntry, NavigationTab } from '../../types/garden';
import { StatusBadge } from '../common/StatusBadge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  Plus,
  ScanHeart,
  Droplets,
  Sun,
  Scissors,
  Sparkles,
  Check,
  ArrowRight,
  Calendar,
  AlertTriangle,
  BookOpen,
  ArrowUpRight,
  Wind,
  Search,
  Box,
  Leaf,
} from 'lucide-react';
import { getLocalTodayDate } from '../../utils/dateUtils';

interface OverviewDashboardProps {
  plants: Plant[];
  careTasks: CareTask[];
  journalEntries: JournalEntry[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddPlant: () => void;
  onSelectPlant: (plant: Plant) => void;
  onToggleTask: (taskId: string) => void;
  onOpenAddJournal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  plants,
  careTasks,
  journalEntries,
  onNavigate,
  onOpenAddPlant,
  onSelectPlant,
  onToggleTask,
  onOpenAddJournal,
}) => {
  const attentionPlants = plants.filter((p) => p.careStatus === 'attention');
  const healthyPlants = plants.filter((p) => p.careStatus === 'healthy');

  const todayStr = getLocalTodayDate();
  const overdueTasks = careTasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < todayStr
  );
  const pendingTodayTasks = careTasks.filter(
    (t) => !t.completed && (t.dueDate === todayStr || t.isToday)
  );
  const completedTodayTasks = careTasks.filter(
    (t) => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)
  );
  const totalTasksDue = overdueTasks.length + pendingTodayTasks.length;

  // Helper for task type icon
  const getTaskIcon = (type: CareTask['taskType']) => {
    switch (type) {
      case 'watering':
        return <Droplets className="w-4 h-4 text-sky-600" />;
      case 'sunlight':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'pruning':
        return <Scissors className="w-4 h-4 text-emerald-600" />;
      case 'fertilizing':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'misting':
        return <Wind className="w-4 h-4 text-teal-500" />;
      case 'pest_inspection':
        return <Search className="w-4 h-4 text-rose-600" />;
      case 'repotting':
        return <Box className="w-4 h-4 text-amber-700" />;
      case 'general':
      default:
        return <Leaf className="w-4 h-4 text-botanical" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Welcome Section & Hero */}
      <section className="relative overflow-hidden rounded-natural-lg bg-gradient-to-br from-forest-800 via-forest-800 to-botanical-dark text-ivory-50 p-6 sm:p-10 shadow-natural-md border border-forest-700/60">
        {/* Subtle botanical decorative ambient glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-leaf/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 rounded-full bg-botanical/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/80 border border-forest-600/70 text-leaf-light text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Botanical Health & Growth Companion</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-editorial font-bold tracking-tight text-ivory-50 mb-3 leading-tight">
            Your garden is growing.
          </h2>
          <p className="text-sm sm:text-base text-ivory-200/90 leading-relaxed mb-6 font-normal">
            Welcome to your personal botanical Sanctuary. Monitor soil hydration, catch early discoloration signals, and cultivate flourishing indoor & outdoor greenery.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenAddPlant}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-leaf text-forest-900 hover:bg-leaf-light transition-all shadow-natural hover:shadow-natural-md active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add a plant</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('plant-doctor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-forest-700/90 text-ivory-50 hover:bg-forest-600 border border-forest-500/60 transition-all backdrop-blur-sm shadow-natural-sm"
            >
              <ScanHeart className="w-4 h-4 text-leaf" />
              <span>Check plant health</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Garden Summary Metrics (Clearly Labeled Demonstration Data) */}
      <section aria-labelledby="summary-heading">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 id="summary-heading" className="text-sm font-bold uppercase tracking-wider text-charcoal-muted flex items-center gap-2">
            <span>Garden Summary</span>
          </h3>
          <span className="text-[11px] font-medium text-charcoal-subtle bg-sage-100 px-2.5 py-0.5 rounded-full border border-sage-200">
            Sample figures (demonstration data)
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white p-5 rounded-natural border border-sage-200/80 shadow-natural-sm hover:shadow-natural transition-shadow">
            <div className="flex items-center justify-between text-charcoal-muted mb-2">
              <span className="text-xs font-semibold">Total Plants</span>
              <span className="p-1.5 rounded-lg bg-sage-50 text-botanical">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-editorial text-forest-800">
              {plants.length}
            </div>
            <div className="text-[11px] text-charcoal-muted mt-1.5 flex items-center gap-1">
              <span className="text-alert-success font-semibold">{healthyPlants.length}</span> thriving specimens
            </div>
          </div>

          <div className="bg-white p-5 rounded-natural border border-sage-200/80 shadow-natural-sm hover:shadow-natural transition-shadow">
            <div className="flex items-center justify-between text-charcoal-muted mb-2">
              <span className="text-xs font-semibold">Needs Attention</span>
              <span className="p-1.5 rounded-lg bg-terracotta-subtle text-terracotta">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-editorial text-terracotta">
              {attentionPlants.length}
            </div>
            <div className="text-[11px] text-charcoal-muted mt-1.5">
              Foliage or moisture check recommended
            </div>
          </div>

          <div className="bg-white p-5 rounded-natural border border-sage-200/80 shadow-natural-sm hover:shadow-natural transition-shadow">
            <div className="flex items-center justify-between text-charcoal-muted mb-2">
              <span className="text-xs font-semibold">Care Tasks Due</span>
              <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-editorial text-forest-800">
              {totalTasksDue}
              {completedTodayTasks.length > 0 ? (
                <span className="text-sm font-sans font-normal text-charcoal-muted ml-1.5">
                  ({completedTodayTasks.length} done)
                </span>
              ) : null}
            </div>
            <div className="text-[11px] text-charcoal-muted mt-1.5">
              {overdueTasks.length > 0
                ? `${overdueTasks.length} overdue, ${pendingTodayTasks.length} due today`
                : 'Scheduled for completion today'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-natural border border-sage-200/80 shadow-natural-sm hover:shadow-natural transition-shadow">
            <div className="flex items-center justify-between text-charcoal-muted mb-2">
              <span className="text-xs font-semibold">Growth Activity</span>
              <span className="p-1.5 rounded-lg bg-leaf-subtle text-leaf-dark">
                <BookOpen className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-editorial text-forest-800">
              {journalEntries.length}
            </div>
            <div className="text-[11px] text-charcoal-muted mt-1.5">
              Recorded milestone observations
            </div>
          </div>
        </div>
      </section>

      {/* 3. My Plants Preview & Today's Care Dual Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Plants Grid (8 cols) */}
        <section className="lg:col-span-8 space-y-4" aria-labelledby="my-plants-heading">
          <div className="flex items-center justify-between">
            <div>
              <h3 id="my-plants-heading" className="text-xl font-editorial font-bold text-forest-800">
                My Plants
              </h3>
              <p className="text-xs text-charcoal-muted">
                Botanical collection overview with daily light and moisture rhythms.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('my-garden')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-botanical hover:text-forest-800 transition-colors group"
            >
              <span>View collection ({plants.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {plants.length === 0 ? (
            <div className="bg-white rounded-natural border border-sage-200/90 p-8 text-center">
              <p className="text-sm font-semibold text-forest-800">Your collection is empty</p>
              <p className="text-xs text-charcoal-muted mt-1 mb-4">Add your first plant to begin tracking light and hydration.</p>
              <button
                type="button"
                onClick={onOpenAddPlant}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700"
              >
                <Plus className="w-3.5 h-3.5 text-leaf" />
                <span>Add Plant</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plants.slice(0, 4).map((plant) => (
                <article
                  key={plant.id}
                  onClick={() => onSelectPlant(plant)}
                  className="group cursor-pointer bg-white rounded-natural border border-sage-200/90 overflow-hidden shadow-natural-sm hover:shadow-natural-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-sage-50">
                    <ImageWithFallback
                      src={plant.imageUrl}
                      alt={plant.name}
                      fallbackTitle={plant.species || plant.name}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={plant.careStatus} size="sm" />
                    </div>
                    {plant.location ? (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-forest-900/70 backdrop-blur-sm text-[11px] font-medium text-ivory-100 truncate max-w-[80%]">
                        {plant.location}
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-editorial text-base font-bold text-forest-800 group-hover:text-botanical transition-colors truncate">
                        {plant.name}
                      </h4>
                      {plant.species ? (
                        <p className="text-xs italic text-charcoal-muted mb-2 truncate">
                          {plant.species}
                        </p>
                      ) : (
                        <p className="text-xs text-charcoal-subtle italic mb-2">
                          Species unrecorded
                        </p>
                      )}
                      {plant.notes ? (
                        <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed mb-3">
                          {plant.notes}
                        </p>
                      ) : (
                        <p className="text-xs text-charcoal-subtle italic mb-3">
                          No notes recorded.
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-sage-100 flex items-center justify-between text-xs text-charcoal-muted">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-botanical" />
                        <span>{plant.wateringFrequencyDays ? `Every ${plant.wateringFrequencyDays}d` : 'Schedule open'}</span>
                      </span>
                      <span className="text-botanical font-semibold flex items-center gap-0.5 group-hover:underline">
                        <span>Profile</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Today's Care & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Today's Care Checklist */}
          <section
            className="bg-white rounded-natural border border-sage-200/90 p-5 shadow-natural-sm"
            aria-labelledby="today-care-heading"
          >
            <div className="flex items-center justify-between pb-3 border-b border-sage-100 mb-3">
              <div>
                <h3 id="today-care-heading" className="font-editorial text-lg font-bold text-forest-800">
                  Today's Care
                </h3>
                <p className="text-[11px] text-charcoal-muted">
                  Interactive checklist (local state)
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('care-planner')}
                className="text-xs font-semibold text-botanical hover:underline"
              >
                Planner
              </button>
            </div>

            <div className="space-y-2.5">
              {totalTasksDue === 0 ? (
                <div className="text-center py-6 text-charcoal-muted text-xs space-y-1">
                  <p className="font-semibold text-forest-800">
                    All care routines completed for today!
                  </p>
                  <p className="text-[11px]">
                    {completedTodayTasks.length > 0
                      ? `${completedTodayTasks.length} task${completedTodayTasks.length > 1 ? 's' : ''} finished today.`
                      : 'No routines scheduled.'}
                  </p>
                </div>
              ) : (
                [...overdueTasks, ...pendingTodayTasks].map((task) => {
                  const isTaskOverdue = task.dueDate && task.dueDate < todayStr;
                  const linkedPlant = task.plantId ? plants.find((p) => p.id === task.plantId) : undefined;
                  const plantDisplay = linkedPlant
                    ? linkedPlant.species
                      ? `${linkedPlant.name} (${linkedPlant.species})`
                      : linkedPlant.name
                    : task.plantName || 'General Garden Routine';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isTaskOverdue
                          ? 'bg-terracotta-subtle/30 border-terracotta-border/80 hover:border-terracotta text-charcoal'
                          : 'bg-ivory-50/50 border-sage-200/80 hover:border-botanical/40 hover:bg-white text-charcoal'
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Mark ${task.title} complete`}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                          isTaskOverdue
                            ? 'border-terracotta text-terracotta hover:bg-terracotta-subtle bg-white'
                            : 'border-sage-300 hover:border-botanical bg-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3] opacity-0 hover:opacity-100 transition-opacity" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          {getTaskIcon(task.taskType)}
                          <span className="truncate">{task.title}</span>
                          {isTaskOverdue ? (
                            <span className="text-[10px] font-bold text-terracotta bg-terracotta-subtle px-1.5 py-0.2 rounded border border-terracotta-border shrink-0">
                              Overdue
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-charcoal-muted mt-0.5 truncate">
                          {plantDisplay}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Quick Actions Panel */}
          <section
            className="bg-ivory-50 rounded-natural border border-sage-200/90 p-5 shadow-natural-sm"
            aria-labelledby="quick-actions-heading"
          >
            <h3 id="quick-actions-heading" className="font-editorial text-base font-bold text-forest-800 mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenAddPlant}
                className="p-3 bg-white hover:bg-sage-100/60 rounded-xl border border-sage-200/80 text-left transition-colors flex flex-col justify-between"
              >
                <Plus className="w-4 h-4 text-botanical mb-2" />
                <span className="text-xs font-semibold text-forest-800">Add Plant</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('plant-doctor')}
                className="p-3 bg-white hover:bg-sage-100/60 rounded-xl border border-sage-200/80 text-left transition-colors flex flex-col justify-between"
              >
                <ScanHeart className="w-4 h-4 text-terracotta mb-2" />
                <span className="text-xs font-semibold text-forest-800">Analyze Photo</span>
              </button>

              <button
                type="button"
                onClick={onOpenAddJournal}
                className="p-3 bg-white hover:bg-sage-100/60 rounded-xl border border-sage-200/80 text-left transition-colors flex flex-col justify-between"
              >
                <BookOpen className="w-4 h-4 text-forest-700 mb-2" />
                <span className="text-xs font-semibold text-forest-800">Record Entry</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('care-planner')}
                className="p-3 bg-white hover:bg-sage-100/60 rounded-xl border border-sage-200/80 text-left transition-colors flex flex-col justify-between"
              >
                <Calendar className="w-4 h-4 text-sky-700 mb-2" />
                <span className="text-xs font-semibold text-forest-800">Care Planner</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 4. Plant Health Feature Card (Plant Doctor Promotion) */}
      <section className="bg-white rounded-natural-lg border border-sage-200 p-6 sm:p-8 shadow-natural-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-leaf flex items-center justify-center shrink-0 shadow-natural">
              <ScanHeart className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical uppercase tracking-wider mb-1">
                <span>Featured Diagnostic Tool</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-leaf-subtle text-forest-800 rounded font-medium border border-leaf-light/50">ONNX Vision AI Active</span>
              </div>
              <h3 className="text-xl font-editorial font-bold text-forest-800 mb-1.5">
                Plant Doctor: Vision Diagnostics
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                Upload a leaf photo to evaluate health symptoms, foliar diseases, and cultural care steps. Analyzed directly on-device using our local MobileNetV2 vision model trained on 38 botanical pathology classes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('plant-doctor')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural shrink-0"
          >
            <span>Open Plant Doctor</span>
            <ArrowRight className="w-4 h-4 text-leaf" />
          </button>
        </div>
      </section>

      {/* 5. Recent Growth Observation Feed (Clearly Marked Sample Content) */}
      <section aria-labelledby="recent-growth-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 id="recent-growth-heading" className="text-xl font-editorial font-bold text-forest-800">
              Recent Growth & Milestones
            </h3>
            <p className="text-xs text-charcoal-muted">
              Observation entries and botanical developments (sample demonstration content).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('growth-journal')}
            className="text-xs font-semibold text-botanical hover:underline flex items-center gap-1"
          >
            <span>View full journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {journalEntries.slice(0, 3).map((entry) => (
            <article
              key={entry.id}
              className="bg-white p-5 rounded-natural border border-sage-200/80 shadow-natural-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-charcoal-muted mb-2">
                  <span className="font-semibold text-botanical">{entry.plantName || 'General Garden'}</span>
                  <span>{entry.date}</span>
                </div>
                <h4 className="font-editorial text-base font-bold text-forest-800 mb-1.5">
                  {entry.title}
                </h4>
                <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-3">
                  {entry.notes}
                </p>
              </div>

              {entry.growthMeasurement ? (
                <div className="mt-3 pt-3 border-t border-sage-100 flex items-center justify-between text-xs">
                  <span className="text-charcoal-muted font-medium">Measurement:</span>
                  <span className="text-forest-800 font-semibold bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                    {entry.growthMeasurement}
                  </span>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
