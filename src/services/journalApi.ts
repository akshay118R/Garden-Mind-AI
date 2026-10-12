import { apiClient } from './apiClient';
import { JournalEntry, JournalObservationType } from '../types/garden';

export interface JournalQueryParams {
  plantId?: string;
  observationType?: JournalObservationType;
  search?: string;
  sort?: 'newest' | 'oldest';
}

export interface UploadPhotoResponse {
  id: string;
  journalEntryId: string;
  originalFilename: string;
  mediaType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

export const journalApi = {
  async getAll(params?: JournalQueryParams): Promise<JournalEntry[]> {
    const query = new URLSearchParams();
    if (params?.plantId) query.set('plant_id', params.plantId);
    if (params?.observationType) query.set('observation_type', params.observationType);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);

    const queryString = query.toString();
    const endpoint = queryString ? `/journal?${queryString}` : '/journal';
    return apiClient.get<JournalEntry[]>(endpoint);
  },

  async getById(id: string): Promise<JournalEntry> {
    return apiClient.get<JournalEntry>(`/journal/${encodeURIComponent(id)}`);
  },

  async create(entry: Omit<JournalEntry, 'id'> & { id?: string }): Promise<JournalEntry> {
    return apiClient.post<JournalEntry>('/journal', entry);
  },

  async update(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    return apiClient.patch<JournalEntry>(`/journal/${encodeURIComponent(id)}`, updates);
  },

  async delete(id: string): Promise<{ message: string; entryId: string }> {
    return apiClient.delete<{ message: string; entryId: string }>(`/journal/${encodeURIComponent(id)}`);
  },

  async uploadPhoto(entryId: string, file: File): Promise<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<UploadPhotoResponse>(`/journal/${encodeURIComponent(entryId)}/photos`, formData);
  },

  async deletePhoto(entryId: string, photoId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `/journal/${encodeURIComponent(entryId)}/photos/${encodeURIComponent(photoId)}`
    );
  },
};
