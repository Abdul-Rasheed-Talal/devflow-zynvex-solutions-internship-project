import { useQuery } from '@tanstack/react-query';
import { getProjectAuditLogs } from '../services/auditService';

export const auditKeys = {
  all: ['audit'] as const,
  project: (projectId: string) => [...auditKeys.all, 'project', projectId] as const,
  projectPaginated: (projectId: string, page: number) => [...auditKeys.project(projectId), { page }] as const,
};

export function useProjectAuditLogs(projectId: string, page: number = 1, limit: number = 20, enabled = true) {
  return useQuery({
    queryKey: auditKeys.projectPaginated(projectId, page),
    queryFn: () => getProjectAuditLogs(projectId, page, limit),
    enabled: !!projectId && enabled,
  });
}
