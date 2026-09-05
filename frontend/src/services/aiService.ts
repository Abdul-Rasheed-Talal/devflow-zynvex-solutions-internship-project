import apiClient from '../lib/apiClient';

export interface AIHealthMetrics {
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  todoTasks: number;
  overdueTasks: number;
  urgentOverdue?: number;
  unassignedTasks?: number;
  velocity?: number;
  daysRemaining?: number | null;
  isProjectOverdue?: boolean;
}

export interface AIHealthData {
  healthScore: number;
  status: 'Healthy' | 'At Risk' | 'Critical';
  summary: string;
  metrics?: AIHealthMetrics;
  riskFactors?: string[];
  recommendations: string[];
  timelineEstimate?: string;
  analyzedAt?: string;
}

export const aiService = {
  getProjectHealth: (projectId: string): Promise<{ success: boolean; data: AIHealthData }> => {
    return apiClient<{ success: boolean; data: AIHealthData }>(`/ai/projects/${projectId}/ai-health`);
  }
};
