import apiClient from '../lib/apiClient';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskListResponse,
  TaskResponse,
  DeleteTaskResponse,
} from '../types/task';

export const taskService = {
  getTasks: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient<TaskListResponse>(`/projects/${projectId}/tasks`, {
      method: 'GET',
    });
    return response.data;
  },

  createTask: async (projectId: string, input: CreateTaskInput): Promise<Task> => {
    const response = await apiClient<TaskResponse>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  },

  getTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient<TaskResponse>(`/tasks/${taskId}`, {
      method: 'GET',
    });
    return response.data;
  },

  updateTask: async (taskId: string, input: UpdateTaskInput): Promise<Task> => {
    const response = await apiClient<TaskResponse>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient<DeleteTaskResponse>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};
