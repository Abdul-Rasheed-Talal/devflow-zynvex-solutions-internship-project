import { useQuery } from '@tanstack/react-query';
import { aiService, AIHealthData } from '../services/aiService';
import type { ApiError } from '../types/auth';

export function useProjectHealthAI(projectId: string, isEnabled: boolean = true) {
  return useQuery<{ success: boolean; data: AIHealthData }, ApiError>({
    queryKey: ['ai', 'health', projectId],
    queryFn: () => aiService.getProjectHealth(projectId),
    enabled: !!projectId && isEnabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false
  });
}
