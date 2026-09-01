import apiClient from '../lib/apiClient';

export interface GlobalAnalytics {
  activeProjectsCount: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
  statusChartData: { name: string; value: number }[];
  myUpcomingTasks: {
    _id: string;
    title: string;
    dueDate?: string;
    project: { _id: string; name: string };
  }[];
}

export interface ProjectAnalytics {
  workloadChartData: { name: string; tasks: number }[];
  overdueCount: number;
  completionPercentage: number;
  totalTasks: number;
}

export const analyticsService = {
  getGlobalAnalytics: (): Promise<{ success: boolean; data: GlobalAnalytics }> => {
    return apiClient<{ success: boolean; data: GlobalAnalytics }>('/analytics/global');
  },
  
  getProjectAnalytics: (projectId: string): Promise<{ success: boolean; data: ProjectAnalytics }> => {
    return apiClient<{ success: boolean; data: ProjectAnalytics }>(`/analytics/projects/${projectId}`);
  },
};
