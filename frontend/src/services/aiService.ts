import apiClient from '../lib/apiClient';

export interface AIHealthData {
  healthScore: number;
  status: 'Healthy' | 'At Risk' | 'Critical';
  summary: string;
  recommendations: string[];
}

export const aiService = {
  getProjectHealth: (projectId: string): Promise<{ success: boolean; data: AIHealthData }> => {
    return apiClient<{ success: boolean; data: AIHealthData }>(`/ai/projects/${projectId}/ai-health`);
  }
};
