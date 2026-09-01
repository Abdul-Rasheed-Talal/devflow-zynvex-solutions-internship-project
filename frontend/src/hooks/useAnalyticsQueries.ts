import { useQuery } from '@tanstack/react-query';
import { analyticsService, GlobalAnalytics, ProjectAnalytics } from '../services/analyticsService';

export function useGlobalAnalytics() {
  return useQuery<{ success: boolean; data: GlobalAnalytics }, Error, GlobalAnalytics>({
    queryKey: ['analytics', 'global'],
    queryFn: () => analyticsService.getGlobalAnalytics(),
    select: (res) => res.data,
  });
}

export function useProjectAnalytics(projectId: string) {
  return useQuery<{ success: boolean; data: ProjectAnalytics }, Error, ProjectAnalytics>({
    queryKey: ['analytics', 'project', projectId],
    queryFn: () => analyticsService.getProjectAnalytics(projectId),
    select: (res) => res.data,
    enabled: !!projectId,
  });
}
