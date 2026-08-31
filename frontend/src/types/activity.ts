import type { UserBasic } from './project';

export interface Activity {
  _id: string;
  project: string;
  task?: {
    _id: string;
    title: string;
  };
  actor: UserBasic;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityListResponse {
  success: boolean;
  data: Activity[];
}
