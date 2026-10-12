import { apiClient } from './apiClient';
import { CareTask, CareTaskType, TaskPriority } from '../types/garden';

export interface TaskQueryParams {
  plantId?: string;
  completed?: boolean;
  priority?: TaskPriority;
  taskType?: CareTaskType;
}

export const taskApi = {
  async getAll(params?: TaskQueryParams): Promise<CareTask[]> {
    const query = new URLSearchParams();
    if (params?.plantId) query.set('plant_id', params.plantId);
    if (params?.completed !== undefined) query.set('completed', String(params.completed));
    if (params?.priority) query.set('priority', params.priority);
    if (params?.taskType) query.set('task_type', params.taskType);

    const queryString = query.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return apiClient.get<CareTask[]>(endpoint);
  },

  async getById(id: string): Promise<CareTask> {
    return apiClient.get<CareTask>(`/tasks/${encodeURIComponent(id)}`);
  },

  async create(task: Omit<CareTask, 'id'> & { id?: string }): Promise<CareTask> {
    return apiClient.post<CareTask>('/tasks', task);
  },

  async update(id: string, updates: Partial<CareTask>): Promise<CareTask> {
    return apiClient.patch<CareTask>(`/tasks/${encodeURIComponent(id)}`, updates);
  },

  async toggle(id: string, completed?: boolean): Promise<CareTask> {
    const updates: Partial<CareTask> = {};
    if (completed !== undefined) {
      updates.completed = completed;
      updates.completedAt = completed ? new Date().toISOString() : undefined;
    }
    return apiClient.patch<CareTask>(`/tasks/${encodeURIComponent(id)}`, updates);
  },

  async delete(id: string): Promise<{ message: string; taskId: string }> {
    return apiClient.delete<{ message: string; taskId: string }>(`/tasks/${encodeURIComponent(id)}`);
  },
};
