import apiClient from '../lib/apiClient';
import type {
  ProjectListResponse,
  ProjectResponse,
  ProjectDeleteResponse,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types/project';

/**
 * Project service handling communication with the backend.
 * Uses the existing apiClient with HttpOnly cookie credentials.
 */
export const projectService = {
  list: (): Promise<ProjectListResponse> => {
    return apiClient<ProjectListResponse>('/projects', {
      method: 'GET',
    });
  },

  getById: (projectId: string): Promise<ProjectResponse> => {
    return apiClient<ProjectResponse>(`/projects/${projectId}`, {
      method: 'GET',
    });
  },

  create: (data: CreateProjectInput): Promise<ProjectResponse> => {
    return apiClient<ProjectResponse>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (projectId: string, data: UpdateProjectInput): Promise<ProjectResponse> => {
    return apiClient<ProjectResponse>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: (projectId: string): Promise<ProjectDeleteResponse> => {
    return apiClient<ProjectDeleteResponse>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};
