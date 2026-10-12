import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Plant, CareTask, JournalEntry, ToastNotification, ViewMode } from '../types/garden';
import {
  INITIAL_PLANTS,
  INITIAL_CARE_TASKS,
  INITIAL_JOURNAL_ENTRIES,
} from '../data/seedData';
import {
  getLocalTodayDate,
  calculateNextOccurrenceDate,
  formatDisplayDate,
} from '../utils/dateUtils';
import { plantApi } from '../services/plantApi';
import { taskApi } from '../services/taskApi';
import { journalApi } from '../services/journalApi';
import { apiClient } from '../services/apiClient';

interface GardenContextType {
  plants: Plant[];
  careTasks: CareTask[];
  journalEntries: JournalEntry[];
  toasts: ToastNotification[];
  viewMode: ViewMode;
  isLoading: boolean;
  isBackendConnected: boolean;
  backendError: string | null;
  setViewMode: (mode: ViewMode) => void;
  refreshData: () => Promise<void>;
  addPlant: (plantData: Omit<Plant, 'id' | 'addedDate'>) => Promise<Plant>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  removePlant: (id: string) => Promise<void>;
  toggleCareTask: (taskId: string) => Promise<void>;
  addCareTask: (task: CareTask) => Promise<void>;
  updateCareTask: (taskId: string, updates: Partial<CareTask>) => Promise<void>;
  removeCareTask: (taskId: string) => Promise<void>;
  addJournalEntry: (entry: JournalEntry, files?: File[]) => Promise<void>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>, newFiles?: File[]) => Promise<void>;
  removeJournalEntry: (id: string) => Promise<void>;
  deleteJournalPhoto: (entryId: string, photoIdOrUrl: string) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  addToast: (message: string, type?: ToastNotification['type']) => void;
  dismissToast: (id: string) => void;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Toast Management
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastNotification['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = { id, type, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  }, [dismissToast]);

  // Initial Fetch & Sync from Backend
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);
    try {
      // Parallel fetch from live FastAPI backend
      const [fetchedPlants, fetchedTasks, fetchedJournal] = await Promise.all([
        plantApi.getAll(),
        taskApi.getAll(),
        journalApi.getAll(),
      ]);

      setPlants(fetchedPlants);
      setCareTasks(fetchedTasks);
      setJournalEntries(fetchedJournal);
      setIsBackendConnected(true);
    } catch (err: any) {
      console.warn('Backend connection failed; falling back to local fallback data:', err);
      setIsBackendConnected(false);
      setBackendError(err.message || 'FastAPI backend unavailable');
      
      // Fallback to initial seeds in browser if backend offline
      setPlants((prev) => (prev.length > 0 ? prev : INITIAL_PLANTS));
      setCareTasks((prev) => (prev.length > 0 ? prev : INITIAL_CARE_TASKS));
      setJournalEntries((prev) => (prev.length > 0 ? prev : INITIAL_JOURNAL_ENTRIES));

      addToast(
        'Backend server unavailable. Displaying local cache. Changes will not persist until FastAPI is running.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Add Plant
  const addPlant = useCallback(
    async (plantData: Omit<Plant, 'id' | 'addedDate'>): Promise<Plant> => {
      const todayStr = getLocalTodayDate();

      if (isBackendConnected) {
        try {
          const createdPlant = await plantApi.create({
            ...plantData,
            addedDate: todayStr,
            careStatus: plantData.careStatus || 'needs_info',
          });

          setPlants((prev) => [createdPlant, ...prev]);

          // Automatically schedule initial care task on server
          try {
            const initialCareTaskPayload: Omit<CareTask, 'id'> = {
              plantId: createdPlant.id,
              plantName: createdPlant.species
                ? `${createdPlant.name} (${createdPlant.species})`
                : createdPlant.name,
              taskType: 'watering',
              title: 'Initial hydration check and placement settling',
              dueDate: todayStr,
              dueDescription: 'Due today',
              isToday: true,
              completed: false,
              priority: 'high',
            };
            const createdTask = await taskApi.create(initialCareTaskPayload);
            setCareTasks((prev) => [createdTask, ...prev]);
          } catch (taskErr) {
            console.error('Failed to create initial care task:', taskErr);
          }

          addToast(`"${createdPlant.name}" has been saved to the database.`, 'success');
          return createdPlant;
        } catch (error: any) {
          addToast(`Failed to save plant: ${error.message}`, 'error');
          throw error;
        }
      } else {
        // Fallback offline behavior
        const newId = `plant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const localPlant: Plant = {
          ...plantData,
          id: newId,
          addedDate: todayStr,
          careStatus: plantData.careStatus || 'needs_info',
        };
        setPlants((prev) => [localPlant, ...prev]);
        addToast(`"${localPlant.name}" added locally (backend offline).`, 'info');
        return localPlant;
      }
    },
    [isBackendConnected, addToast]
  );

  // Update Plant
  const updatePlant = useCallback(
    async (id: string, updates: Partial<Plant>) => {
      let previousPlants: Plant[] = [];
      setPlants((prev) => {
        previousPlants = prev;
        return prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      });

      if (isBackendConnected) {
        try {
          const updated = await plantApi.update(id, updates);
          setPlants((prev) => prev.map((p) => (p.id === id ? updated : p)));

          // Refresh tasks and journal to sync updated plant name
          const [refreshedTasks, refreshedJournal] = await Promise.all([
            taskApi.getAll(),
            journalApi.getAll(),
          ]);
          setCareTasks(refreshedTasks);
          setJournalEntries(refreshedJournal);

          addToast(`"${updated.name}" updated successfully.`, 'success');
        } catch (error: any) {
          // Rollback on failure
          setPlants(previousPlants);
          addToast(`Failed to update plant: ${error.message}`, 'error');
        }
      } else {
        addToast(`Plant updated locally.`, 'success');
      }
    },
    [isBackendConnected, addToast]
  );

  // Remove Plant
  const removePlant = useCallback(
    async (id: string) => {
      let previousPlants: Plant[] = [];
      let removedName = '';

      setPlants((prev) => {
        previousPlants = prev;
        const target = prev.find((p) => p.id === id);
        if (target) removedName = target.name;
        return prev.filter((p) => p.id !== id);
      });

      if (isBackendConnected) {
        try {
          await plantApi.delete(id);
          // Reload tasks and journal to reflect safe unlinking performed by server
          const [refreshedTasks, refreshedJournal] = await Promise.all([
            taskApi.getAll(),
            journalApi.getAll(),
          ]);
          setCareTasks(refreshedTasks);
          setJournalEntries(refreshedJournal);

          addToast(`"${removedName || 'Plant'}" removed from database.`, 'info');
        } catch (error: any) {
          setPlants(previousPlants);
          addToast(`Failed to delete plant: ${error.message}`, 'error');
        }
      } else {
        // Offline unlinking
        setCareTasks((prev) =>
          prev.map((task) =>
            task.plantId === id
              ? { ...task, plantId: undefined, plantName: `${task.plantName || removedName} (Archived)` }
              : task
          )
        );
        setJournalEntries((prev) =>
          prev.map((entry) =>
            entry.plantId === id
              ? { ...entry, plantId: undefined, plantName: `${entry.plantName || removedName} (Archived)` }
              : entry
          )
        );
        addToast(`"${removedName || 'Plant'}" removed locally.`, 'info');
      }
    },
    [isBackendConnected, addToast]
  );

  // Toggle Care Task
  const toggleCareTask = useCallback(
    async (taskId: string) => {
      const target = careTasks.find((t) => t.id === taskId);
      if (!target) return;

      const newCompletedState = !target.completed;
      const originalTasks = [...careTasks];

      // Optimistic update
      setCareTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: newCompletedState,
              completedAt: newCompletedState ? new Date().toISOString() : undefined,
            };
          }
          return task;
        })
      );

      if (isBackendConnected) {
        try {
          const updated = await taskApi.toggle(taskId, newCompletedState);
          setCareTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

          // If completed and has recurrence, schedule next occurrence
          if (newCompletedState && target.recurrence && target.recurrence !== 'none') {
            const nextDueDate = calculateNextOccurrenceDate(target.dueDate, target.recurrence);
            const todayLocal = getLocalTodayDate();
            const nextTaskPayload: Omit<CareTask, 'id'> = {
              plantId: target.plantId,
              plantName: target.plantName,
              taskType: target.taskType,
              title: target.title,
              dueDate: nextDueDate,
              dueTime: target.dueTime,
              priority: target.priority,
              notes: target.notes,
              recurrence: target.recurrence,
              completed: false,
              dueDescription: formatDisplayDate(nextDueDate, target.dueTime),
              isToday: nextDueDate === todayLocal,
              createdAt: todayLocal,
            };

            const createdNext = await taskApi.create(nextTaskPayload);
            setCareTasks((prev) => [createdNext, ...prev]);
            addToast(`"${target.title}" completed. Next recurrence scheduled.`, 'success');
          } else {
            addToast(`"${target.title}" ${newCompletedState ? 'completed' : 'reopened'}.`, 'success');
          }
        } catch (error: any) {
          setCareTasks(originalTasks);
          addToast(`Failed to update task: ${error.message}`, 'error');
        }
      } else {
        addToast(`"${target.title}" ${newCompletedState ? 'completed' : 'reopened'} locally.`, 'info');
      }
    },
    [careTasks, isBackendConnected, addToast]
  );

  // Add Care Task
  const addCareTask = useCallback(
    async (task: CareTask) => {
      if (isBackendConnected) {
        try {
          const { id: _, ...taskPayload } = task;
          const created = await taskApi.create(taskPayload);
          setCareTasks((prev) => [created, ...prev]);
          addToast(`Care task scheduled: "${created.title}".`, 'success');
        } catch (error: any) {
          addToast(`Failed to schedule task: ${error.message}`, 'error');
        }
      } else {
        setCareTasks((prev) => [task, ...prev]);
        addToast(`Care task scheduled locally: "${task.title}".`, 'info');
      }
    },
    [isBackendConnected, addToast]
  );

  // Update Care Task
  const updateCareTask = useCallback(
    async (taskId: string, updates: Partial<CareTask>) => {
      const originalTasks = [...careTasks];
      setCareTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
      );

      if (isBackendConnected) {
        try {
          const updated = await taskApi.update(taskId, updates);
          setCareTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
          addToast(`Care task "${updated.title}" updated.`, 'success');
        } catch (error: any) {
          setCareTasks(originalTasks);
          addToast(`Failed to update care task: ${error.message}`, 'error');
        }
      } else {
        addToast(`Care task updated locally.`, 'success');
      }
    },
    [careTasks, isBackendConnected, addToast]
  );

  // Remove Care Task
  const removeCareTask = useCallback(
    async (taskId: string) => {
      const originalTasks = [...careTasks];
      const target = careTasks.find((t) => t.id === taskId);
      setCareTasks((prev) => prev.filter((t) => t.id !== taskId));

      if (isBackendConnected) {
        try {
          await taskApi.delete(taskId);
          addToast(`"${target?.title || 'Care task'}" removed from schedule.`, 'info');
        } catch (error: any) {
          setCareTasks(originalTasks);
          addToast(`Failed to remove care task: ${error.message}`, 'error');
        }
      } else {
        addToast(`"${target?.title || 'Care task'}" removed locally.`, 'info');
      }
    },
    [careTasks, isBackendConnected, addToast]
  );

  // Add Journal Entry (with multipart photo uploads)
  const addJournalEntry = useCallback(
    async (entry: JournalEntry, files?: File[]) => {
      if (isBackendConnected) {
        try {
          const { id: _, ...entryPayload } = entry;
          const created = await journalApi.create(entryPayload);

          // Upload any selected photo files
          const uploadedUrls: string[] = [];
          if (files && files.length > 0) {
            for (const file of files) {
              try {
                const photoResp = await journalApi.uploadPhoto(created.id, file);
                uploadedUrls.push(photoResp.url);
              } catch (photoErr: any) {
                console.error('Photo upload failed:', photoErr);
                addToast(`Photo "${file.name}" failed to upload: ${photoErr.message}`, 'error');
              }
            }
          }

          // If photos were uploaded, fetch refreshed entry with photo references
          if (uploadedUrls.length > 0) {
            const refreshedEntry = await journalApi.getById(created.id);
            setJournalEntries((prev) => [refreshedEntry, ...prev]);
          } else {
            setJournalEntries((prev) => [created, ...prev]);
          }

          const targetLabel = created.plantName || 'Garden';
          addToast(`Observation recorded for ${targetLabel} in database.`, 'success');
        } catch (error: any) {
          addToast(`Failed to record journal entry: ${error.message}`, 'error');
        }
      } else {
        setJournalEntries((prev) => [entry, ...prev]);
        const targetLabel = entry.plantName || 'Garden';
        addToast(`Observation recorded for ${targetLabel} locally.`, 'info');
      }
    },
    [isBackendConnected, addToast]
  );

  // Update Journal Entry
  const updateJournalEntry = useCallback(
    async (id: string, updates: Partial<JournalEntry>, newFiles?: File[]) => {
      const originalEntries = [...journalEntries];
      setJournalEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      );

      if (isBackendConnected) {
        try {
          await journalApi.update(id, updates);

          // Upload any newly attached files
          if (newFiles && newFiles.length > 0) {
            for (const file of newFiles) {
              try {
                await journalApi.uploadPhoto(id, file);
              } catch (photoErr: any) {
                console.error('Photo upload failed in edit:', photoErr);
                addToast(`Photo "${file.name}" failed to upload: ${photoErr.message}`, 'error');
              }
            }
          }

          const freshEntry = await journalApi.getById(id);
          setJournalEntries((prev) => prev.map((e) => (e.id === id ? freshEntry : e)));
          addToast(`Observation "${freshEntry.title}" updated.`, 'success');
        } catch (error: any) {
          setJournalEntries(originalEntries);
          addToast(`Failed to update observation: ${error.message}`, 'error');
        }
      } else {
        addToast(`Observation updated locally.`, 'success');
      }
    },
    [journalEntries, isBackendConnected, addToast]
  );

  // Remove Journal Entry
  const removeJournalEntry = useCallback(
    async (id: string) => {
      const originalEntries = [...journalEntries];
      const target = journalEntries.find((e) => e.id === id);
      setJournalEntries((prev) => prev.filter((e) => e.id !== id));

      if (isBackendConnected) {
        try {
          await journalApi.delete(id);
          addToast(`Journal observation "${target?.title || 'Entry'}" removed.`, 'info');
        } catch (error: any) {
          setJournalEntries(originalEntries);
          addToast(`Failed to delete observation: ${error.message}`, 'error');
        }
      } else {
        addToast(`Journal observation removed locally.`, 'info');
      }
    },
    [journalEntries, isBackendConnected, addToast]
  );

  // Delete Journal Photo
  const deleteJournalPhoto = useCallback(
    async (entryId: string, photoIdOrUrl: string) => {
      if (isBackendConnected) {
        try {
          // If given a URL, extract filename or photo ID
          const photoId = photoIdOrUrl.split('/').pop()?.split('.')[0] || photoIdOrUrl;
          await journalApi.deletePhoto(entryId, photoId);
          const freshEntry = await journalApi.getById(entryId);
          setJournalEntries((prev) => prev.map((e) => (e.id === entryId ? freshEntry : e)));
          addToast('Photo removed from entry.', 'info');
        } catch (error: any) {
          addToast(`Failed to remove photo: ${error.message}`, 'error');
        }
      }
    },
    [isBackendConnected, addToast]
  );

  // Reset to Demo Data
  const resetToDemoData = useCallback(async () => {
    if (isBackendConnected) {
      try {
        await apiClient.post('/seed');
        await refreshData();
        addToast('Demonstration garden collection restored from database.', 'info');
      } catch (error: any) {
        addToast(`Failed to reset data: ${error.message}`, 'error');
      }
    } else {
      setPlants(INITIAL_PLANTS);
      setCareTasks(INITIAL_CARE_TASKS);
      setJournalEntries(INITIAL_JOURNAL_ENTRIES);
      addToast('Demonstration garden collection restored locally.', 'info');
    }
  }, [isBackendConnected, refreshData, addToast]);

  const value = useMemo(
    () => ({
      plants,
      careTasks,
      journalEntries,
      toasts,
      viewMode,
      isLoading,
      isBackendConnected,
      backendError,
      setViewMode,
      refreshData,
      addPlant,
      updatePlant,
      removePlant,
      toggleCareTask,
      addCareTask,
      updateCareTask,
      removeCareTask,
      addJournalEntry,
      updateJournalEntry,
      removeJournalEntry,
      deleteJournalPhoto,
      resetToDemoData,
      addToast,
      dismissToast,
    }),
    [
      plants,
      careTasks,
      journalEntries,
      toasts,
      viewMode,
      isLoading,
      isBackendConnected,
      backendError,
      setViewMode,
      refreshData,
      addPlant,
      updatePlant,
      removePlant,
      toggleCareTask,
      addCareTask,
      updateCareTask,
      removeCareTask,
      addJournalEntry,
      updateJournalEntry,
      removeJournalEntry,
      deleteJournalPhoto,
      resetToDemoData,
      addToast,
      dismissToast,
    ]
  );

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
};

export const useGarden = (): GardenContextType => {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error('useGarden must be used within a GardenProvider');
  }
  return context;
};
