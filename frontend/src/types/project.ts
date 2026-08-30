// Project domain types matching the backend API contract

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface ProjectDeleteResponse {
  success: boolean;
  message: string;
}

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export const PROJECT_PRIORITIES: { value: ProjectPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

// Membership types matching the backend toSafeObject() response
export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberListResponse {
  success: boolean;
  data: ProjectMember[];
}

export interface AddMemberInput {
  userId: string;
}
