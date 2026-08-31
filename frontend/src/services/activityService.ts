import apiClient from '../lib/apiClient';
import type { ActivityListResponse } from '../types/activity';

export const getProjectActivity = async (projectId: string): Promise<ActivityListResponse> => {
  const response = await apiClient<ActivityListResponse>(`/projects/${projectId}/activity`, { method: 'GET' });
  return response;
};
