import type { UserBasic } from './project';

export interface AuditLog {
  _id: string;
  project: string;
  actor: UserBasic;
  action: string;
  targetUser?: UserBasic;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogListResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
