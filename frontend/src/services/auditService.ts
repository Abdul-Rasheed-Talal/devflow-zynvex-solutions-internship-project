import apiClient from '../lib/apiClient';
import type { AuditLogListResponse } from '../types/audit';

export const getProjectAuditLogs = async (
  projectId: string,
  page: number = 1,
  limit: number = 20
): Promise<AuditLogListResponse> => {
  const response = await apiClient<AuditLogListResponse>(
    `/projects/${projectId}/audit?page=${page}&limit=${limit}`,
    { method: 'GET' }
  );
  return response;
};
