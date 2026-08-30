import { ProjectMember } from './project';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id: string;
  project: string;
  creator: ProjectMember; // Populated by backend safely
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: ProjectMember | null; // Populated by backend safely
  labels: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string | null;
  labels?: string[];
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string | null;
  labels?: string[];
  dueDate?: string | null;
}

export interface TaskListResponse {
  success: boolean;
  data: Task[];
}

export interface TaskResponse {
  success: boolean;
  data: Task;
}

export interface DeleteTaskResponse {
  success: boolean;
  data: Record<string, never>;
}

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];
