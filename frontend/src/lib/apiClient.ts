import { ApiError } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Base API client for DevFlow.
 * Wraps fetch with consistent error handling and JSON parsing.
 * Uses `credentials: 'include'` to automatically send the HttpOnly devflow_access_token cookie.
 */
async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error('Unable to connect to the server. Please try again.') as ApiError;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`;
    const error = new Error(message) as ApiError;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export default apiClient;
