import apiClient from '../lib/apiClient';
import type {
  ProjectListResponse,
  ProjectResponse,
  ProjectDeleteResponse,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectMemberListResponse,
  AddMemberInput,
  UpdateMemberRoleInput,
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

  // Membership operations

  getMembers: (projectId: string): Promise<ProjectMemberListResponse> => {
    return apiClient<ProjectMemberListResponse>(`/projects/${projectId}/members`, {
      method: 'GET',
    });
  },

  addMember: (projectId: string, data: AddMemberInput): Promise<ProjectResponse> => {
    return apiClient<ProjectResponse>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeMember: (projectId: string, userId: string): Promise<ProjectResponse> => {
    return apiClient<ProjectResponse>(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  updateMemberRole: (projectId: string, userId: string, data: UpdateMemberRoleInput): Promise<ProjectResponse> => {
    return apiClient<ProjectResponse>(`/projects/${projectId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
