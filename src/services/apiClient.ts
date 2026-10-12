/**
 * GardenMind AI — Centralized Typed API Client
 *
 * Provides a robust fetch wrapper for communication with the FastAPI backend.
 * Handles environment-based URL configuration, typed error parsing,
 * JSON serialization, and safe multipart FormData uploads.
 */

export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_API_BASE_URL;
}

export function resolveMediaUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  const base = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${cleanPath}`;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const { body, timeoutMs = 15000, headers: customHeaders, ...fetchInit } = options;

  const headers: Record<string, string> = {};
  let serializedBody: BodyInit | null | undefined = undefined;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (isFormData) {
    // When sending FormData, DO NOT manually set Content-Type header.
    // The browser must automatically set multipart/form-data with the boundary parameter.
    serializedBody = body as FormData;
  } else if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    serializedBody = JSON.stringify(body);
  }

  // Merge custom headers
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((val, key) => {
        headers[key] = val;
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, val]) => {
        headers[key] = val;
      });
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchInit,
      headers,
      body: serializedBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response body safely
    let responseData: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else {
      const text = await response.text();
      responseData = text ? { message: text } : null;
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      if (responseData && typeof responseData === 'object') {
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail
            .map((err: any) => err.msg || JSON.stringify(err))
            .join('; ');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }
      throw new ApiError(response.status, errorMessage, responseData);
    }

    return responseData as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApiError(408, `Request timed out after ${timeoutMs}ms.`);
    }
    throw new ApiError(0, `Network error: Unable to reach backend at ${baseUrl}. Please ensure the FastAPI server is running.`);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: formData }),

  async checkHealth(): Promise<{ healthy: boolean; status: string; database: string }> {
    try {
      const res = await apiRequest<{ status: string; database: string }>('/health', { timeoutMs: 3000 });
      return {
        healthy: res.status === 'healthy',
        status: res.status,
        database: res.database,
      };
    } catch {
      return {
        healthy: false,
        status: 'offline',
        database: 'disconnected',
      };
    }
  },
};
