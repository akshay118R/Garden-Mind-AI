import { apiClient } from './apiClient';
import { Plant, PlantStatus } from '../types/garden';

export interface PlantQueryParams {
  search?: string;
  status?: PlantStatus;
  category?: string;
  location?: string;
}

export const plantApi = {
  async getAll(params?: PlantQueryParams): Promise<Plant[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.location) query.set('location', params.location);

    const queryString = query.toString();
    const endpoint = queryString ? `/plants?${queryString}` : '/plants';
    return apiClient.get<Plant[]>(endpoint);
  },

  async getById(id: string): Promise<Plant> {
    return apiClient.get<Plant>(`/plants/${encodeURIComponent(id)}`);
  },

  async create(plant: Omit<Plant, 'id'> & { id?: string }): Promise<Plant> {
    return apiClient.post<Plant>('/plants', plant);
  },

  async update(id: string, updates: Partial<Plant>): Promise<Plant> {
    return apiClient.patch<Plant>(`/plants/${encodeURIComponent(id)}`, updates);
  },

  async delete(id: string): Promise<{ message: string; plantId: string }> {
    return apiClient.delete<{ message: string; plantId: string }>(`/plants/${encodeURIComponent(id)}`);
  },
};
