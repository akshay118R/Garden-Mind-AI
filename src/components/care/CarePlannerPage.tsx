import React, { useState, useMemo } from 'react';
import { CareTask, Plant, CareTaskType, CareSuggestion } from '../../types/garden';
import { useGarden } from '../../context/GardenContext';
import { TaskItem, getCategoryLabel } from './TaskItem';
import { AddCareTaskModal } from './AddCareTaskModal';
import { EditCareTaskModal } from './EditCareTaskModal';
import { ConfirmDeleteTaskDialog } from './ConfirmDeleteTaskDialog';
import { CareSuggestionsSection } from './CareSuggestionsSection';
import {
  getLocalTodayDate,
  formatHeaderDate,
  formatDisplayDate,
  classifyTask,
} from '../../utils/dateUtils';
import {
  Plus,
  CalendarCheck2,
  CalendarDays,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListTodo,
  Droplets,
  Sun,
  Scissors,
  Sparkles,
  Search,
  Box,
  Leaf,
} from 'lucide-react';

interface CarePlannerPageProps {
  careTasks: CareTask[];
  plants: Plant[];
  onToggleTask: (taskId: string) => void;
  onOpenAddTask: () => void;
  onOpenAddJournalForTask?: (task: CareTask) => void;
}

type TaskViewTab = 'today' | 'upcoming' | 'all' | 'completed';

export const CarePlannerPage: React.FC<CarePlannerPageProps> = ({
  careTasks,
  plants,
  onToggleTask,
  onOpenAddTask,
  onOpenAddJournalForTask,
}) => {
  const { addCareTask, updateCareTask, removeCareTask } = useGarden();

  // Tab & Category Filtering
  const [activeTab, setActiveTab] = useState<TaskViewTab>('today');
  const [selectedCategory, setSelectedCategory] = useState<CareTaskType | 'all'>('all');

  // Modal Dialog Controllers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<CareTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<CareTask | null>(null);

  const todayStr = useMemo(() => getLocalTodayDate(), []);

  // Summary Metrics Calculated Dynamically from Real State
  const metrics = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    let completedToday = 0;

    for (const task of careTasks) {
      if (task.completed) {
        if (task.completedAt && task.completedAt.startsWith(todayStr)) {
          completedToday++;
        }
      } else {
        const c = classifyTask(task.dueDate, false, todayStr);
        if (c === 'overdue') overdue++;
        else if (c === 'today') dueToday++;
        else if (c === 'upcoming') upcoming++;
      }
    }

    return { dueToday, overdue, upcoming, completedToday };
  }, [careTasks, todayStr]);

  // Filter Tasks by Active Tab & Selected Category
  const filteredTasks = useMemo(() => {
    return careTasks.filter((task) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && task.taskType !== selectedCategory) {
        return false;
      }

      // 2. View Tab Filter
      if (activeTab === 'completed') {
        return task.completed;
      }

      if (task.completed) {
        return false; // Non-completed tabs only show pending tasks
      }

      const c = classifyTask(task.dueDate, false, todayStr);
      if (activeTab === 'today') {
        // Today view includes tasks due today AND overdue tasks
        return c === 'today' || c === 'overdue';
      }
      if (activeTab === 'upcoming') {
        return c === 'upcoming';
      }
      if (activeTab === 'all') {
        return true; // All pending tasks
      }

      return true;
    });
  }, [careTasks, activeTab, selectedCategory, todayStr]);

  // Separate Overdue and Today in the "Today" tab for visual distinction
  const overdueTasksInView = useMemo(() => {
    if (activeTab !== 'today') return [];
    return filteredTasks.filter((t) => !t.completed && t.dueDate < todayStr);
  }, [filteredTasks, activeTab, todayStr]);

  const dueTodayTasksInView = useMemo(() => {
    if (activeTab !== 'today') return filteredTasks;
    return filteredTasks.filter((t) => !t.completed && t.dueDate === todayStr);
  }, [filteredTasks, activeTab, todayStr]);

  // Handle Adding Suggested Task
  const handleAddSuggestedTask = (suggestion: CareSuggestion) => {
    const newTask: CareTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      plantId: suggestion.plantId,
      plantName: suggestion.plantName,
      taskType: suggestion.taskType,
      title: suggestion.title,
      dueDate: suggestion.suggestedDueDate,
      priority: suggestion.priority,
      completed: false,
      notes: suggestion.reason,
      recurrence: 'weekly',
      createdAt: todayStr,
      dueDescription: formatDisplayDate(suggestion.suggestedDueDate),
      isToday: suggestion.suggestedDueDate === todayStr,
    };
    addCareTask(newTask);
  };

  const handleConfirmDelete = (taskId: string) => {
    removeCareTask(taskId);
    setTaskToDelete(null);
  };

  const categoryPills: { id: CareTaskType | 'all'; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'watering', label: 'Watering', icon: Droplets },
    { id: 'sunlight', label: 'Sunlight', icon: Sun },
    { id: 'fertilizing', label: 'Fertilizer', icon: Sparkles },
    { id: 'pruning', label: 'Pruning', icon: Scissors },
    { id: 'pest_inspection', label: 'Pest Check', icon: Search },
    { id: 'repotting', label: 'Repotting', icon: Box },
    { id: 'general', label: 'General', icon: Leaf },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* 1. Header with Local Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botanical-subtle text-botanical text-xs font-semibold mb-2 border border-sage-200">
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>{formatHeaderDate()}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-forest-800 tracking-tight">
            Care Planner
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
            Small, consistent care helps your garden thrive. Manage due dates, rotation rhythms, and completed routines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onOpenAddTask();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 transition-all shadow-natural shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-leaf" />
          <span>Add Care Task</span>
        </button>
      </div>

      {/* 2. Real-Time Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Due Today */}
        <div
          onClick={() => setActiveTab('today')}
          className={`p-4 rounded-natural border transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-white border-botanical shadow-natural ring-1 ring-botanical/20'
              : 'bg-white border-sage-200/80 shadow-natural-sm hover:border-botanical/50'
          }`}
        >
          <div className="flex items-center justify-between text-charcoal-muted mb-1.5">
            <span className="text-xs font-semibold">Due Today</span>
            <span className="p-1.5 rounded-lg bg-leaf-subtle text-forest-800">
              <CalendarDays className="w-3.5 h-3.5 text-botanical" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-forest-800">
            {metrics.dueToday}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">Scheduled for today</p>
        </div>

        {/* Overdue (Distinguished clearly) */}
        <div
          onClick={() => setActiveTab('today')}
          className={`p-4 rounded-natural border transition-all cursor-pointer ${
            metrics.overdue > 0
              ? 'bg-terracotta-subtle/30 border-terracotta-border/80 shadow-natural-sm hover:border-terracotta'
              : 'bg-white border-sage-200/80 shadow-natural-sm hover:border-botanical/50'
          }`}
        >
          <div className="flex items-center justify-between text-charcoal-muted mb-1.5">
            <span className="text-xs font-semibold">Overdue</span>
            <span
              className={`p-1.5 rounded-lg ${
                metrics.overdue > 0
                  ? 'bg-terracotta text-white'
                  : 'bg-sage-100 text-charcoal-muted'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-editorial ${
              metrics.overdue > 0 ? 'text-terracotta' : 'text-forest-800'
            }`}
          >
            {metrics.overdue}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">
            {metrics.overdue > 0 ? 'Attention needed' : 'All caught up'}
          </p>
        </div>

        {/* Upcoming */}
        <div
          onClick={() => setActiveTab('upcoming')}
          className={`p-4 rounded-natural border transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-white border-botanical shadow-natural ring-1 ring-botanical/20'
              : 'bg-white border-sage-200/80 shadow-natural-sm hover:border-botanical/50'
          }`}
        >
          <div className="flex items-center justify-between text-charcoal-muted mb-1.5">
            <span className="text-xs font-semibold">Upcoming</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-forest-800">
            {metrics.upcoming}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">Next 7+ days</p>
        </div>

        {/* Completed Today */}
        <div
          onClick={() => setActiveTab('completed')}
          className={`p-4 rounded-natural border transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-white border-botanical shadow-natural ring-1 ring-botanical/20'
              : 'bg-white border-sage-200/80 shadow-natural-sm hover:border-botanical/50'
          }`}
        >
          <div className="flex items-center justify-between text-charcoal-muted mb-1.5">
            <span className="text-xs font-semibold">Completed Today</span>
            <span className="p-1.5 rounded-lg bg-alert-successBg text-alert-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-forest-800">
            {metrics.completedToday}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">Finished routines</p>
        </div>
      </div>

      {/* 3. Main Task Area: View Tabs & Category Filters */}
      <div className="space-y-4">
        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-sage-200/80 pb-2">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto" role="tablist">
            {[
              { id: 'today', label: `Today & Overdue (${metrics.dueToday + metrics.overdue})` },
              { id: 'upcoming', label: `Upcoming (${metrics.upcoming})` },
              { id: 'all', label: `All Pending (${metrics.dueToday + metrics.overdue + metrics.upcoming})` },
              { id: 'completed', label: `Completed (${careTasks.filter((t) => t.completed).length})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TaskViewTab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-forest-800 text-ivory-50 shadow-natural-sm'
                      : 'bg-white text-charcoal-muted hover:bg-sage-100 border border-sage-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categoryPills.map((pill) => {
            const Icon = pill.icon;
            const isSelected = selectedCategory === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSelectedCategory(pill.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-botanical text-white shadow-natural-sm font-semibold'
                    : 'bg-white text-charcoal-muted hover:bg-sage-50 border border-sage-200/60'
                }`}
              >
                {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Task List Feed */}
        <div className="space-y-4">
          {/* Overdue Section in Today Tab */}
          {activeTab === 'today' && overdueTasksInView.length > 0 ? (
            <div className="space-y-2.5 p-3.5 rounded-natural-lg bg-terracotta-subtle/20 border border-terracotta-border/60">
              <div className="flex items-center gap-2 text-xs font-bold text-terracotta px-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Overdue Tasks — Scheduled prior to today ({overdueTasksInView.length})</span>
              </div>
              <div className="space-y-2">
                {overdueTasksInView.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    plants={plants}
                    onToggle={onToggleTask}
                    onEdit={(t) => setTaskToEdit(t)}
                    onDelete={(t) => setTaskToDelete(t)}
                    onLogJournal={onOpenAddJournalForTask}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Main List */}
          {activeTab === 'today' ? (
            dueTodayTasksInView.length === 0 && overdueTasksInView.length === 0 ? (
              <div className="bg-white rounded-natural-lg border border-sage-200 p-10 text-center text-xs text-charcoal-muted shadow-natural-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sage-100 text-botanical flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-editorial text-base font-bold text-forest-800">
                  All routines for today are complete!
                </h4>
                <p className="max-w-sm mx-auto text-charcoal-muted">
                  No pending tasks due today under the {selectedCategory !== 'all' ? `"${getCategoryLabel(selectedCategory)}"` : 'current'} filter.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-natural-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-leaf" />
                  <span>Schedule another task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dueTodayTasksInView.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    plants={plants}
                    onToggle={onToggleTask}
                    onEdit={(t) => setTaskToEdit(t)}
                    onDelete={(t) => setTaskToDelete(t)}
                    onLogJournal={onOpenAddJournalForTask}
                  />
                ))}
              </div>
            )
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-natural-lg border border-sage-200 p-10 text-center text-xs text-charcoal-muted shadow-natural-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sage-100 text-botanical flex items-center justify-center mx-auto">
                <ListTodo className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-base font-bold text-forest-800">
                No tasks found
              </h4>
              <p className="max-w-sm mx-auto text-charcoal-muted">
                {activeTab === 'completed'
                  ? 'No completed tasks recorded in this category yet.'
                  : activeTab === 'upcoming'
                  ? 'No upcoming tasks registered for the next 7+ days.'
                  : 'No tasks scheduled matching this filter.'}
              </p>
              {activeTab !== 'completed' ? (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700 shadow-natural-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-leaf" />
                  <span>Add a task</span>
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  plants={plants}
                  onToggle={onToggleTask}
                  onEdit={(t) => setTaskToEdit(t)}
                  onDelete={(t) => setTaskToDelete(t)}
                  onLogJournal={onOpenAddJournalForTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Personalized Care Suggestions Section */}
      <CareSuggestionsSection
        plants={plants}
        existingTasks={careTasks}
        onAddSuggestedTask={handleAddSuggestedTask}
      />

      {/* Interactive Modals */}
      <AddCareTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        plants={plants}
        onAddTask={addCareTask}
      />

      <EditCareTaskModal
        task={taskToEdit}
        isOpen={taskToEdit !== null}
        onClose={() => setTaskToEdit(null)}
        plants={plants}
        onUpdateTask={updateCareTask}
      />

      <ConfirmDeleteTaskDialog
        task={taskToDelete}
        isOpen={taskToDelete !== null}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
