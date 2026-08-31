import { useQuery } from '@tanstack/react-query';
import { getProjectActivity } from '../services/activityService';

export const activityKeys = {
  all: ['activity'] as const,
  project: (projectId: string) => [...activityKeys.all, 'project', projectId] as const,
};

export function useProjectActivity(projectId: string, enabled = true) {
  return useQuery({
    queryKey: activityKeys.project(projectId),
    queryFn: () => getProjectActivity(projectId),
    select: (response) => response.data,
    enabled: !!projectId && enabled,
  });
}
